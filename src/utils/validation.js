export const IMPUTATION_CODES = [
  301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312
];

export function isValidDateKey(dateKey) {
  if (typeof dateKey !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return false;
  }
  const [yearStr, monthStr, dayStr] = dateKey.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function dateFromKey(dateKey) {
  const [yearStr, monthStr, dayStr] = dateKey.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  return new Date(Date.UTC(year, month - 1, day));
}

export function round2(value) {
  return Math.round(value * 100) / 100;
}

export function parseNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) {
    return null;
  }
  return num;
}

export function isValidDecimalHours(value) {
  if (!Number.isFinite(value) || value < 0) {
    return false;
  }
  return /^\d+(?:\.\d{1,2})?$/.test(String(value));
}

export function isValidProjectCode(value) {
  return typeof value === "string" && /^\d{6}$/.test(value);
}

export function isValidImputation(value) {
  return Number.isInteger(value) && IMPUTATION_CODES.includes(value);
}
