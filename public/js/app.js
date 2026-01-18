const state = {
  users: [],
  imputations: []
};

const userSelect = document.getElementById("user-select");
const sapInput = document.getElementById("sap-input");
const linesBody = document.getElementById("lines-body");
const totalHoursEl = document.getElementById("total-hours");
const addLineBtn = document.getElementById("add-line");
const saveBtn = document.getElementById("save-btn");
const clearBtn = document.getElementById("clear-btn");
const statusEl = document.getElementById("status");
const errorsEl = document.getElementById("errors");

const dateInputs = Array.from(document.querySelectorAll(".date-input input"));

function round2(value) {
  return Math.round(value * 100) / 100;
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

function setDateInputsFromDigits(ddmmyy, force = false) {
  if (!force && dateInputs.some((input) => input.value.trim())) {
    return;
  }
  ddmmyy.split("").forEach((digit, index) => {
    if (dateInputs[index]) dateInputs[index].value = digit;
  });
}

function setStatus(message) {
  statusEl.textContent = message || "";
}

function setErrors(messages) {
  errorsEl.innerHTML = "";
  if (!messages.length) return;
  const list = document.createElement("ul");
  for (const message of messages) {
    const item = document.createElement("li");
    item.textContent = message;
    list.appendChild(item);
  }
  errorsEl.appendChild(list);
}

function clearFieldErrors() {
  document.querySelectorAll(".error-field").forEach((el) => {
    el.classList.remove("error-field");
  });
}

function setFieldError(el) {
  if (el) el.classList.add("error-field");
}

function getDateDigits() {
  const digits = dateInputs.map((input) => input.value.trim()).join("");
  if (digits.length !== 6 || !/^\d{6}$/.test(digits)) {
    return null;
  }
  return digits;
}

function dateKeyFromDDMMYY(ddmmyy) {
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

function updateTotal() {
  let total = 0;
  document.querySelectorAll(".time-input").forEach((input) => {
    const value = Number(input.value.replace(",", "."));
    if (Number.isFinite(value)) {
      total += value;
    }
  });
  totalHoursEl.textContent = round2(total).toFixed(2);
}

function buildImputationSelect(selectedValue) {
  const select = document.createElement("select");
  select.className = "imputation-select";
  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = "Select";
  select.appendChild(empty);

  for (const item of state.imputations) {
    const option = document.createElement("option");
    option.value = String(item.code3);
    option.textContent = `${item.code3} ${item.short} ${item.label}`;
    if (selectedValue && Number(selectedValue) === item.code3) {
      option.selected = true;
    }
    select.appendChild(option);
  }
  return select;
}

function createLineRow(data = {}) {
  const row = document.createElement("tr");

  const projectTd = document.createElement("td");
  const projectInput = document.createElement("input");
  projectInput.type = "text";
  projectInput.maxLength = 6;
  projectInput.inputMode = "numeric";
  projectInput.className = "project-input";
  projectInput.value = data.projectCode6 || "";
  projectTd.appendChild(projectInput);

  const imputationTd = document.createElement("td");
  const imputationSelect = buildImputationSelect(data.imputationCode3);
  imputationTd.appendChild(imputationSelect);

  const timeTd = document.createElement("td");
  const timeInput = document.createElement("input");
  timeInput.type = "text";
  timeInput.inputMode = "decimal";
  timeInput.className = "time-input";
  timeInput.value = data.timeHours !== undefined ? String(data.timeHours) : "";
  timeTd.appendChild(timeInput);

  const removeTd = document.createElement("td");
  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.textContent = "Remove";
  removeBtn.className = "ghost";
  removeBtn.addEventListener("click", () => {
    row.remove();
    updateTotal();
  });
  removeTd.appendChild(removeBtn);

  [projectInput, imputationSelect, timeInput].forEach((input) => {
    input.addEventListener("input", updateTotal);
  });

  row.appendChild(projectTd);
  row.appendChild(imputationTd);
  row.appendChild(timeTd);
  row.appendChild(removeTd);

  return row;
}

function addLine(data) {
  linesBody.appendChild(createLineRow(data));
}

function resetLines() {
  linesBody.innerHTML = "";
  for (let i = 0; i < 5; i += 1) {
    addLine();
  }
}

function fillUsers() {
  userSelect.innerHTML = "<option value=\"\">Select worker</option>";
  state.users.forEach((user) => {
    const option = document.createElement("option");
    option.value = user._id;
    option.textContent = user.fullName;
    option.dataset.sap = user.sapNumber;
    userSelect.appendChild(option);
  });
}

function setSapFromSelection() {
  const selected = userSelect.selectedOptions[0];
  sapInput.value = selected?.dataset?.sap || "";
}

async function loadData() {
  const [usersRes, imputationsRes] = await Promise.all([
    fetch("/api/users"),
    fetch("/api/imputations")
  ]);

  state.users = usersRes.ok ? await usersRes.json() : [];
  state.imputations = imputationsRes.ok ? await imputationsRes.json() : [];

  fillUsers();
  resetLines();
}

function getSelectedShift() {
  const selected = document.querySelector("input[name=shift]:checked");
  return selected?.value || "";
}

function setSelectedShift(value) {
  document.querySelectorAll("input[name=shift]").forEach((input) => {
    input.checked = input.value === value;
  });
}

function getExtrasPayload() {
  const extras = {};
  document.querySelectorAll("[data-extra]").forEach((checkbox) => {
    const key = checkbox.dataset.extra;
    const input = document.querySelector(`[data-extra-input='${key}']`);
    if (checkbox.checked) {
      const value = input.value.trim();
      if (value !== "") {
        extras[key] = Number(value.replace(",", "."));
      }
    }
  });
  return extras;
}

function setExtras(data = {}) {
  document.querySelectorAll("[data-extra]").forEach((checkbox) => {
    const key = checkbox.dataset.extra;
    const input = document.querySelector(`[data-extra-input='${key}']`);
    const value = data[key];
    if (value !== undefined && value !== null) {
      checkbox.checked = true;
      input.disabled = false;
      input.value = String(value);
    } else {
      checkbox.checked = false;
      input.disabled = true;
      input.value = "";
    }
  });
}

function wireExtras() {
  document.querySelectorAll("[data-extra]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const key = checkbox.dataset.extra;
      const input = document.querySelector(`[data-extra-input='${key}']`);
      if (checkbox.checked) {
        input.disabled = false;
        input.focus();
      } else {
        input.disabled = true;
        input.value = "";
      }
    });
  });
}

function clearForm() {
  setDateInputsFromDigits(getCurrentCETDateDigits(), true);
  userSelect.value = "";
  sapInput.value = "";
  setSelectedShift("");
  setExtras({});
  resetLines();
  updateTotal();
  clearFieldErrors();
  setErrors([]);
  setStatus("");
  loadTimesheetIfReady();
}

async function loadTimesheetIfReady() {
  const dateDigits = getDateDigits();
  const userId = userSelect.value;
  if (!dateDigits || !userId) {
    return;
  }

  const dateKey = dateKeyFromDDMMYY(dateDigits);
  if (!dateKey) {
    return;
  }

  setStatus("Loading timesheet...");
  const response = await fetch(`/api/timesheets?userId=${userId}&dateKey=${dateKey}`);
  if (!response.ok) {
    if (response.status === 404) {
      setStatus("No existing timesheet for this date.");
      resetLines();
      setSelectedShift("");
      setExtras({});
      updateTotal();
      return;
    }
    setStatus("Failed to load timesheet.");
    return;
  }

  const data = await response.json();
  linesBody.innerHTML = "";
  data.lines.forEach((line) => addLine(line));
  while (linesBody.children.length < 5) {
    addLine();
  }
  setSelectedShift(data.shift);
  setExtras(data.extras || {});
  updateTotal();
  setStatus("Loaded existing timesheet.");
}

function validateLines() {
  const errors = [];
  const lines = [];

  document.querySelectorAll("#lines-body tr").forEach((row, index) => {
    const projectInput = row.querySelector(".project-input");
    const imputationSelect = row.querySelector(".imputation-select");
    const timeInput = row.querySelector(".time-input");

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
      setFieldError(projectInput);
      rowHasError = true;
    }

    if (!/^\d{3}$/.test(imputationCode3)) {
      errors.push(`Line ${index + 1}: select a valid imputation.`);
      setFieldError(imputationSelect);
      rowHasError = true;
    }

    const timeNumber = Number(timeValue.replace(",", "."));
    if (!/^\d+(?:\.\d{1,2})?$/.test(timeValue) || Number.isNaN(timeNumber)) {
      errors.push(`Line ${index + 1}: time must be a decimal (e.g. 8.00).`);
      setFieldError(timeInput);
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

async function handleSave() {
  clearFieldErrors();
  setErrors([]);
  setStatus("");

  const dateDigits = getDateDigits();
  const userId = userSelect.value;
  if (!userId) {
    setErrors(["Select a worker."]);
    return;
  }

  if (!dateDigits) {
    setErrors(["Enter a valid date (DDMMYY)."]);
    return;
  }

  const dateKey = dateKeyFromDDMMYY(dateDigits);
  if (!dateKey) {
    setErrors(["Date is not a real calendar date."]);
    return;
  }

  const shift = getSelectedShift();
  if (!shift) {
    setErrors(["Select a shift."]);
    return;
  }

  const { lines, errors } = validateLines();
  if (errors.length) {
    setErrors(errors);
    return;
  }

  const extras = getExtrasPayload();

  const response = await fetch("/api/timesheets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, dateKey, shift, lines, extras })
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    setErrors([data.error || "Failed to save."]);
    return;
  }

  const data = await response.json();
  clearForm();
  setStatus(`Saved. Total: ${data.totalHours.toFixed(2)} hours.`);
}

function wireDateInputs() {
  dateInputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      input.value = input.value.replace(/\D/g, "");
      if (input.value.length === 1 && index < dateInputs.length - 1) {
        dateInputs[index + 1].focus();
      }
      loadTimesheetIfReady();
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Backspace" && !input.value && index > 0) {
        dateInputs[index - 1].focus();
      }
    });
  });
}

userSelect.addEventListener("change", () => {
  setSapFromSelection();
  loadTimesheetIfReady();
});

addLineBtn.addEventListener("click", () => addLine());
saveBtn.addEventListener("click", handleSave);
clearBtn.addEventListener("click", clearForm);

wireDateInputs();
wireExtras();
setDateInputsFromDigits(getCurrentCETDateDigits());

loadData().catch(() => {
  setStatus("Failed to load initial data.");
});
