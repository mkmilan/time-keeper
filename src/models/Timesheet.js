import mongoose from "mongoose";

const lineSchema = new mongoose.Schema(
  {
    projectCode6: {
      type: String,
      required: true,
      match: /^\d{6}$/
    },
    imputationCode3: { type: Number, required: true },
    timeHours: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const extrasSchema = new mongoose.Schema(
  {
    vuilWerkHours: { type: Number, min: 0 },
    supportsHours: { type: Number, min: 0 },
    wachtvergoedingHours: { type: Number, min: 0 },
    km: { type: Number, min: 0 }
  },
  { _id: false }
);

const timesheetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    sapNumberSnapshot: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    dateKey: { type: String, required: true },
    shift: {
      type: String,
      required: true,
      enum: ["day", "early", "late", "night"]
    },
    lines: { type: [lineSchema], default: [] },
    extras: { type: extrasSchema },
    totalHours: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

timesheetSchema.index({ userId: 1, dateKey: 1 }, { unique: true });
timesheetSchema.index({ dateKey: 1, shift: 1 });
timesheetSchema.index({ "lines.projectCode6": 1 });
timesheetSchema.index({ "lines.imputationCode3": 1 });

export const Timesheet = mongoose.model("Timesheet", timesheetSchema);
