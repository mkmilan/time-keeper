const state = { users: [], imputations: [], currentTimesheet: null };

const tsFrom = document.getElementById("ts-from");
const tsTo = document.getElementById("ts-to");
const tsUser = document.getElementById("ts-user");
const tsShift = document.getElementById("ts-shift");
const tsRun = document.getElementById("ts-run");
const tsTableBody = document.querySelector("#ts-table tbody");

const dayUser = document.getElementById("day-user");
const dayDate = document.getElementById("day-date");
const dayRun = document.getElementById("day-run");
const dayTableBody = document.querySelector("#day-table tbody");
const dayTotal = document.getElementById("day-total");
const daySummary = document.getElementById("day-summary");
const dayAddLine = document.getElementById("day-add-line");
const daySave = document.getElementById("day-save");

const shiftSelect = document.getElementById("shift-select");
const shiftDate = document.getElementById("shift-date");
const shiftRun = document.getElementById("shift-run");
const shiftTableBody = document.querySelector("#shift-table tbody");
const shiftTotal = document.getElementById("shift-total");
const shiftSummary = document.getElementById("shift-summary");

const plFrom = document.getElementById("pl-from");
const plTo = document.getElementById("pl-to");
const plProject = document.getElementById("pl-project");
const plRun = document.getElementById("pl-run");
const plTableBody = document.querySelector("#pl-table tbody");

const addFullName = document.getElementById("add-fullname");
const addSap = document.getElementById("add-sap");
const addAdmin = document.getElementById("add-admin");
const addActive = document.getElementById("add-active");
const addUserBtn = document.getElementById("add-user-btn");

const statusEl = document.getElementById("admin-status");
const errorsEl = document.getElementById("admin-errors");

function setStatus(message) {
  statusEl.textContent = message || "";
}

function setErrors(message) {
  errorsEl.textContent = message || "";
}

function getCurrentCETDateDigits() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit"
  }).formatToParts(new Date());
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${lookup.day}${lookup.month}${lookup.year}`;
}

function setDateInputIfEmpty(input, value) {
  if (input && !input.value.trim()) {
    input.value = value;
  }
}

function setDefaultDates() {
  const today = getCurrentCETDateDigits();
  [dayDate, shiftDate, tsFrom, tsTo, plFrom, plTo].forEach((input) =>
    setDateInputIfEmpty(input, today)
  );
}

function dateKeyFromDDMMYY(ddmmyy) {
  if (!/^\d{6}$/.test(ddmmyy)) {
    return null;
  }
  const day = Number(ddmmyy.slice(0, 2));
  const month = Number(ddmmyy.slice(2, 4));
  const year = 2000 + Number(ddmmyy.slice(4, 6));
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getDateKeyOrError(value) {
  if (!value.trim()) {
    return { dateKey: "" };
  }
  const dateKey = dateKeyFromDDMMYY(value.trim());
  if (!dateKey) {
    return { error: "Dates must be DDMMYY (valid calendar date)." };
  }
  return { dateKey };
}

function fillUsers() {
  tsUser.innerHTML = "<option value=\"\">All</option>";
  dayUser.innerHTML = "<option value=\"\">Select user</option>";
  state.users.forEach((user) => {
    const option = document.createElement("option");
    option.value = user._id;
    option.textContent = user.fullName;
    tsUser.appendChild(option);

    const dailyOption = option.cloneNode(true);
    dayUser.appendChild(dailyOption);
  });
}

async function loadUsers() {
  const response = await fetch("/api/users");
  if (!response.ok) {
    return;
  }
  state.users = await response.json();
  fillUsers();
}

async function loadImputations() {
  const response = await fetch("/api/imputations");
  if (!response.ok) {
    return;
  }
  state.imputations = await response.json();
}

function formatDate(dateKey) {
  return dateKey || "-";
}

function formatUser(user) {
  if (!user) return "-";
  return user.fullName || "-";
}

function buildImputationSelect(selectedValue) {
  const select = document.createElement("select");
  select.className = "imputation-select";
  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = "Select";
  select.appendChild(empty);

  state.imputations.forEach((item) => {
    const option = document.createElement("option");
    option.value = String(item.code3);
    option.textContent = `${item.code3} ${item.short} ${item.label}`;
    if (selectedValue && Number(selectedValue) === item.code3) {
      option.selected = true;
    }
    select.appendChild(option);
  });
  return select;
}

function updateDayTotal() {
  let total = 0;
  document.querySelectorAll(".day-time-input").forEach((input) => {
    const value = Number(input.value.replace(",", "."));
    if (Number.isFinite(value)) {
      total += value;
    }
  });
  dayTotal.textContent = total.toFixed(2);
}

function createDayLineRow(data = {}) {
  const row = document.createElement("tr");

  const projectTd = document.createElement("td");
  const projectInput = document.createElement("input");
  projectInput.type = "text";
  projectInput.maxLength = 6;
  projectInput.inputMode = "numeric";
  projectInput.className = "day-project-input";
  projectInput.value = data.projectCode6 || "";
  projectTd.appendChild(projectInput);

  const imputationTd = document.createElement("td");
  const imputationSelect = buildImputationSelect(data.imputationCode3);
  imputationTd.appendChild(imputationSelect);

  const timeTd = document.createElement("td");
  const timeInput = document.createElement("input");
  timeInput.type = "text";
  timeInput.inputMode = "decimal";
  timeInput.className = "day-time-input";
  timeInput.value = data.timeHours !== undefined ? String(data.timeHours) : "";
  timeTd.appendChild(timeInput);

  const removeTd = document.createElement("td");
  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.textContent = "Remove";
  removeBtn.className = "ghost";
  removeBtn.addEventListener("click", () => {
    row.remove();
    updateDayTotal();
  });
  removeTd.appendChild(removeBtn);

  [projectInput, imputationSelect, timeInput].forEach((input) => {
    input.addEventListener("input", updateDayTotal);
  });

  row.appendChild(projectTd);
  row.appendChild(imputationTd);
  row.appendChild(timeTd);
  row.appendChild(removeTd);

  return row;
}

function renderDailyLines(lines = []) {
  dayTableBody.innerHTML = "";
  lines.forEach((line) => dayTableBody.appendChild(createDayLineRow(line)));
  if (!lines.length) {
    dayTableBody.appendChild(createDayLineRow());
  }
  updateDayTotal();
}

function setDailySummary({ userName, dateKey, shift, totalHours }) {
  if (!userName || !dateKey) {
    daySummary.textContent = "";
    return;
  }
  daySummary.textContent = `${userName} | ${dateKey} | Shift: ${shift || "-"} | Total: ${Number(
    totalHours || 0
  ).toFixed(2)}h`;
}

function setShiftSummary({ dateKey, shift, totalHours, userCount }) {
  if (!dateKey || !shift) {
    shiftSummary.textContent = "";
    return;
  }
  shiftSummary.textContent = `Shift: ${shift} | ${dateKey} | Users: ${userCount} | Total: ${Number(
    totalHours || 0
  ).toFixed(2)}h`;
}

async function runDailyLookup() {
  setErrors("");
  setStatus("Loading daily timesheet...");

  if (!dayUser.value) {
    setErrors("Select a user.");
    setStatus("");
    return;
  }

  const dateResult = getDateKeyOrError(dayDate.value);
  if (dateResult.error || !dateResult.dateKey) {
    setErrors(dateResult.error || "Enter a date (DDMMYY).");
    setStatus("");
    return;
  }

  const response = await fetch(
    `/api/timesheets?userId=${dayUser.value}&dateKey=${dateResult.dateKey}`
  );
  if (!response.ok) {
    if (response.status === 404) {
      state.currentTimesheet = null;
      renderDailyLines([]);
      setDailySummary({
        userName: dayUser.selectedOptions[0]?.textContent,
        dateKey: dateResult.dateKey,
        shift: "",
        totalHours: 0
      });
      setErrors("No timesheet found for this user/date.");
      setStatus("");
      return;
    }
    const data = await response.json().catch(() => ({}));
    setErrors(data.error || "Failed to load timesheet.");
    setStatus("");
    return;
  }

  const data = await response.json();
  state.currentTimesheet = {
    _id: data._id,
    userId: data.userId,
    dateKey: data.dateKey,
    shift: data.shift
  };
  renderDailyLines(data.lines || []);
  setDailySummary({
    userName: dayUser.selectedOptions[0]?.textContent,
    dateKey: data.dateKey,
    shift: data.shift,
    totalHours: data.totalHours
  });
  setStatus("Loaded daily timesheet.");
}

function validateDailyLines() {
  const errors = [];
  const lines = [];

  document.querySelectorAll("#day-table tbody tr").forEach((row, index) => {
    const projectInput = row.querySelector(".day-project-input");
    const imputationSelect = row.querySelector(".imputation-select");
    const timeInput = row.querySelector(".day-time-input");

    const projectCode6 = projectInput.value.trim();
    const imputationCode3 = imputationSelect.value.trim();
    const timeValue = timeInput.value.trim();

    const hasAny = projectCode6 || imputationCode3 || timeValue;
    if (!hasAny) {
      return;
    }

    let rowHasError = false;
    if (!/^\d{6}$/.test(projectCode6)) {
      errors.push(`Line ${index + 1}: project code must be 6 digits.`);
      projectInput.classList.add("error-field");
      rowHasError = true;
    }

    if (!/^\d{3}$/.test(imputationCode3)) {
      errors.push(`Line ${index + 1}: select a valid imputation.`);
      imputationSelect.classList.add("error-field");
      rowHasError = true;
    }

    const timeNumber = Number(timeValue.replace(",", "."));
    if (!/^\d+(?:\.\d{1,2})?$/.test(timeValue) || Number.isNaN(timeNumber)) {
      errors.push(`Line ${index + 1}: time must be a decimal (e.g. 8.00).`);
      timeInput.classList.add("error-field");
      rowHasError = true;
    }

    if (!rowHasError) {
      lines.push({
        projectCode6,
        imputationCode3: Number(imputationCode3),
        timeHours: Number(timeNumber)
      });
    }
  });

  if (!lines.length) {
    errors.push("Add at least one complete line.");
  }

  return { lines, errors };
}

async function saveDailyEdits() {
  setErrors("");
  setStatus("");
  document.querySelectorAll(".error-field").forEach((el) => el.classList.remove("error-field"));

  if (!state.currentTimesheet) {
    setErrors("Load a timesheet first.");
    return;
  }

  const { lines, errors } = validateDailyLines();
  if (errors.length) {
    setErrors(errors.join(" "));
    return;
  }

  setStatus("Saving changes...");
  const response = await fetch("/api/timesheets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: state.currentTimesheet.userId,
      dateKey: state.currentTimesheet.dateKey,
      shift: state.currentTimesheet.shift,
      lines
    })
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    setErrors(data.error || "Failed to save changes.");
    setStatus("");
    return;
  }

  const data = await response.json();
  updateDayTotal();
  setStatus(`Saved. Total: ${data.totalHours.toFixed(2)} hours.`);
}

async function runTimesheets() {
  setErrors("");
  setStatus("Loading timesheets...");
  const params = new URLSearchParams();

  const fromResult = getDateKeyOrError(tsFrom.value);
  if (fromResult.error) {
    setErrors(fromResult.error);
    setStatus("");
    return;
  }
  const toResult = getDateKeyOrError(tsTo.value);
  if (toResult.error) {
    setErrors(toResult.error);
    setStatus("");
    return;
  }

  if (fromResult.dateKey) params.set("from", fromResult.dateKey);
  if (toResult.dateKey) params.set("to", toResult.dateKey);
  if (tsUser.value) params.set("userId", tsUser.value);
  if (tsShift.value) params.set("shift", tsShift.value);

  const response = await fetch(`/api/admin/timesheets?${params.toString()}`);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    setErrors(data.error || "Failed to load timesheets.");
    setStatus("");
    return;
  }

  const data = await response.json();
  tsTableBody.innerHTML = "";
  data.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formatDate(item.dateKey)}</td>
      <td>${formatUser(item.userId)}</td>
      <td>${item.sapNumberSnapshot || item.userId?.sapNumber || "-"}</td>
      <td>${item.shift}</td>
      <td>${Number(item.totalHours).toFixed(2)}</td>
    `;
    tsTableBody.appendChild(row);
  });

  setStatus(`Loaded ${data.length} timesheets.`);
}

async function runShiftLookup() {
  setErrors("");
  setStatus("Loading shift timesheets...");

  if (!shiftSelect.value) {
    setErrors("Select a shift.");
    setStatus("");
    return;
  }

  const dateResult = getDateKeyOrError(shiftDate.value);
  if (dateResult.error || !dateResult.dateKey) {
    setErrors(dateResult.error || "Enter a date (DDMMYY).");
    setStatus("");
    return;
  }

  const params = new URLSearchParams();
  params.set("from", dateResult.dateKey);
  params.set("to", dateResult.dateKey);
  params.set("shift", shiftSelect.value);

  const response = await fetch(`/api/admin/timesheets?${params.toString()}`);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    setErrors(data.error || "Failed to load shift timesheets.");
    setStatus("");
    return;
  }

  const data = await response.json();
  shiftTableBody.innerHTML = "";
  let totalHours = 0;

  data.forEach((timesheet) => {
    const userName = timesheet.userId?.fullName || "-";
    const groupRow = document.createElement("tr");
    groupRow.className = "group-row";
    groupRow.innerHTML = `<td colspan="4">${userName}</td>`;
    shiftTableBody.appendChild(groupRow);

    timesheet.lines.forEach((line) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td></td>
        <td>${line.projectCode6}</td>
        <td>${line.imputationCode3}</td>
        <td>${Number(line.timeHours).toFixed(2)}</td>
      `;
      shiftTableBody.appendChild(row);
    });

    const userTotal = Number(timesheet.totalHours) || 0;
    totalHours += userTotal;
    const totalRow = document.createElement("tr");
    totalRow.className = "group-total";
    totalRow.innerHTML = `
      <td colspan="3">Total for ${userName}</td>
      <td>${userTotal.toFixed(2)}</td>
    `;
    shiftTableBody.appendChild(totalRow);
  });

  shiftTotal.textContent = totalHours.toFixed(2);
  setShiftSummary({
    dateKey: dateResult.dateKey,
    shift: shiftSelect.value,
    totalHours,
    userCount: data.length
  });
  setStatus(`Loaded ${data.length} timesheets.`);
}

async function runProjectLines() {
  setErrors("");
  setStatus("Loading project lines...");
  const params = new URLSearchParams();

  const fromResult = getDateKeyOrError(plFrom.value);
  if (fromResult.error) {
    setErrors(fromResult.error);
    setStatus("");
    return;
  }
  const toResult = getDateKeyOrError(plTo.value);
  if (toResult.error) {
    setErrors(toResult.error);
    setStatus("");
    return;
  }

  if (fromResult.dateKey) params.set("from", fromResult.dateKey);
  if (toResult.dateKey) params.set("to", toResult.dateKey);
  if (plProject.value.trim()) params.set("projectCode6", plProject.value.trim());

  const response = await fetch(`/api/admin/project-lines?${params.toString()}`);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    setErrors(data.error || "Failed to load project lines.");
    setStatus("");
    return;
  }

  const data = await response.json();
  plTableBody.innerHTML = "";
  data.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formatDate(item.dateKey)}</td>
      <td>${item.userFullName || "-"}</td>
      <td>${item.shift}</td>
      <td>${item.projectCode6}</td>
      <td>${item.imputationCode3}</td>
      <td>${Number(item.timeHours).toFixed(2)}</td>
    `;
    plTableBody.appendChild(row);
  });

  setStatus(`Loaded ${data.length} lines.`);
}

async function addWorker() {
  setErrors("");
  setStatus("");

  const fullName = addFullName.value.trim();
  const sapNumber = addSap.value.trim();
  if (!fullName || !sapNumber) {
    setErrors("Full name and SAP number are required.");
    return;
  }

  setStatus("Adding worker...");
  const response = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName,
      sapNumber,
      isAdmin: addAdmin.value === "true",
      isActive: addActive.value === "true"
    })
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    setErrors(data.error || "Failed to add worker.");
    setStatus("");
    return;
  }

  addFullName.value = "";
  addSap.value = "";
  addAdmin.value = "false";
  addActive.value = "true";
  await loadUsers();
  setStatus("Worker added.");
}

Promise.all([loadUsers(), loadImputations()]).catch(() => setErrors("Failed to load data."));
setDefaultDates();

tsRun.addEventListener("click", runTimesheets);
plRun.addEventListener("click", runProjectLines);
dayRun.addEventListener("click", runDailyLookup);
shiftRun.addEventListener("click", runShiftLookup);
dayAddLine.addEventListener("click", () => {
  dayTableBody.appendChild(createDayLineRow());
});
daySave.addEventListener("click", saveDailyEdits);
addUserBtn.addEventListener("click", addWorker);
