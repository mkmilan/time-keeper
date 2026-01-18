import express from "express";
import mongoose from "mongoose";
import { User } from "../models/User.js";
import { ImputationCode } from "../models/ImputationCode.js";
import { Timesheet } from "../models/Timesheet.js";
import {
  IMPUTATION_CODES,
  dateFromKey,
  isValidDateKey,
  isValidDecimalHours,
  isValidImputation,
  isValidProjectCode,
  parseNumber,
  round2
} from "../utils/validation.js";

const router = express.Router();

router.get("/users", async (req, res) => {
  const users = await User.find({ isActive: true })
    .sort({ fullName: 1 })
    .select({ fullName: 1, sapNumber: 1 });
  res.json(users);
});

router.post("/users", async (req, res) => {
  const { fullName, sapNumber, isAdmin, isActive } = req.body || {};

  if (!fullName || typeof fullName !== "string") {
    return res.status(400).json({ error: "fullName is required." });
  }
  if (!sapNumber || typeof sapNumber !== "string") {
    return res.status(400).json({ error: "sapNumber is required." });
  }

  const existing = await User.findOne({ sapNumber: sapNumber.trim() });
  if (existing) {
    return res.status(409).json({ error: "SAP number already exists." });
  }

  const user = await User.create({
    fullName: fullName.trim(),
    sapNumber: sapNumber.trim(),
    isAdmin: Boolean(isAdmin),
    isActive: isActive !== false
  });

  res.status(201).json({ ok: true, userId: user._id });
});

router.get("/imputations", async (req, res) => {
  const imputations = await ImputationCode.find({ active: true })
    .sort({ code3: 1 })
    .select({ code3: 1, short: 1, label: 1 });
  res.json(imputations);
});

router.get("/timesheets", async (req, res) => {
  const { userId, dateKey } = req.query;
  if (!mongoose.isValidObjectId(userId) || !isValidDateKey(dateKey)) {
    return res.status(400).json({ error: "Invalid userId or dateKey." });
  }
  const timesheet = await Timesheet.findOne({ userId, dateKey }).lean();
  if (!timesheet) {
    return res.status(404).json({ error: "Not found" });
  }
  res.json(timesheet);
});

function normalizeLines(lines) {
  if (!Array.isArray(lines)) {
    return { error: "Lines must be an array." };
  }

  const normalized = [];
  for (const [index, line] of lines.entries()) {
    const projectCode6 = String(line?.projectCode6 || "").trim();
    const imputationCode3 = parseNumber(line?.imputationCode3);
    const timeHours = parseNumber(line?.timeHours);

    const hasAny = projectCode6 || imputationCode3 !== null || timeHours !== null;
    if (!hasAny) {
      continue;
    }

    if (!isValidProjectCode(projectCode6)) {
      return { error: `Line ${index + 1}: project code must be 6 digits.` };
    }
    if (!Number.isInteger(imputationCode3) || !isValidImputation(imputationCode3)) {
      return { error: `Line ${index + 1}: invalid imputation code.` };
    }
    if (!isValidDecimalHours(timeHours)) {
      return { error: `Line ${index + 1}: invalid time format.` };
    }

    normalized.push({ projectCode6, imputationCode3, timeHours });
  }

  if (normalized.length === 0) {
    return { error: "At least one line is required." };
  }

  return { lines: normalized };
}

function normalizeExtras(extras) {
  if (!extras || typeof extras !== "object") {
    return {};
  }

  const fields = {
    vuilWerkHours: parseNumber(extras.vuilWerkHours),
    supportsHours: parseNumber(extras.supportsHours),
    wachtvergoedingHours: parseNumber(extras.wachtvergoedingHours),
    km: parseNumber(extras.km)
  };

  const cleaned = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value === null) {
      continue;
    }
    if (!Number.isFinite(value) || value < 0) {
      return { error: `Extra ${key} must be a number >= 0.` };
    }
    cleaned[key] = value;
  }

  return { extras: Object.keys(cleaned).length ? cleaned : undefined };
}

router.post("/timesheets", async (req, res) => {
  const { userId, dateKey, shift } = req.body || {};

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ error: "Invalid userId." });
  }
  if (!isValidDateKey(dateKey)) {
    return res.status(400).json({ error: "Invalid dateKey." });
  }
  if (!["day", "early", "late", "night"].includes(shift)) {
    return res.status(400).json({ error: "Shift is required." });
  }

  const linesResult = normalizeLines(req.body?.lines);
  if (linesResult.error) {
    return res.status(400).json({ error: linesResult.error });
  }

  const extrasResult = normalizeExtras(req.body?.extras);
  if (extrasResult.error) {
    return res.status(400).json({ error: extrasResult.error });
  }

  const user = await User.findById(userId).select({ sapNumber: 1 });
  if (!user) {
    return res.status(400).json({ error: "User not found." });
  }

  const totalHours = round2(
    linesResult.lines.reduce((sum, line) => sum + line.timeHours, 0)
  );

  const payload = {
    userId,
    sapNumberSnapshot: user.sapNumber,
    dateKey,
    date: dateFromKey(dateKey),
    shift,
    lines: linesResult.lines,
    totalHours,
    ...(extrasResult.extras ? { extras: extrasResult.extras } : {})
  };

  try {
    const timesheet = await Timesheet.findOneAndUpdate(
      { userId, dateKey },
      { $set: payload },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ ok: true, timesheetId: timesheet._id, totalHours });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: "Timesheet already exists." });
    }
    res.status(500).json({ error: "Failed to save timesheet." });
  }
});

router.get("/admin/timesheets", async (req, res) => {
  const { from, to, userId, shift } = req.query;
  const query = {};

  if (from || to) {
    if ((from && !isValidDateKey(from)) || (to && !isValidDateKey(to))) {
      return res.status(400).json({ error: "Invalid date range." });
    }
    query.dateKey = {};
    if (from) query.dateKey.$gte = from;
    if (to) query.dateKey.$lte = to;
  }

  if (userId) {
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Invalid userId." });
    }
    query.userId = userId;
  }

  if (shift) {
    if (!["day", "early", "late", "night"].includes(shift)) {
      return res.status(400).json({ error: "Invalid shift." });
    }
    query.shift = shift;
  }

  const timesheets = await Timesheet.find(query)
    .sort({ dateKey: -1 })
    .populate({ path: "userId", select: { fullName: 1, sapNumber: 1 } })
    .lean();

  res.json(timesheets);
});

router.get("/admin/project-lines", async (req, res) => {
  const { from, to, projectCode6 } = req.query;

  if (!isValidProjectCode(projectCode6)) {
    return res.status(400).json({ error: "Invalid project code." });
  }
  if ((from && !isValidDateKey(from)) || (to && !isValidDateKey(to))) {
    return res.status(400).json({ error: "Invalid date range." });
  }

  const match = { "lines.projectCode6": projectCode6 };
  if (from || to) {
    match.dateKey = {};
    if (from) match.dateKey.$gte = from;
    if (to) match.dateKey.$lte = to;
  }

  const results = await Timesheet.aggregate([
    { $match: match },
    { $unwind: "$lines" },
    { $match: { "lines.projectCode6": projectCode6 } },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 0,
        dateKey: 1,
        shift: 1,
        projectCode6: "$lines.projectCode6",
        imputationCode3: "$lines.imputationCode3",
        timeHours: "$lines.timeHours",
        userFullName: "$user.fullName"
      }
    },
    { $sort: { dateKey: -1 } }
  ]);

  res.json(results);
});

router.get("/meta/imputation-codes", (req, res) => {
  res.json(IMPUTATION_CODES);
});

export default router;
