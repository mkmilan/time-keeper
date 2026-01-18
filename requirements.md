# Functional requirements

## Worker entry

- User selects their name from a dropdown.
- SAP number auto-populates and cannot be edited by the worker.
- User enters date in format DDMMYY using 6 small inputs (or one input that behaves like 6 boxes).
- User enters work lines:
  - Project code (6 digits, required if line has any other field)
  - Imputation code (dropdown, required if line has any other field)
  - Time (decimal hours number, required if line has any other field)
- User can press "Add line" to create more lines beyond the initial set.
- Total sums the "Time" column only.

## Shift

- Shift is a single choice:
  - day
  - early
  - late
  - night

## Extras (optional)

- Vuil werk (hours)
- Supports (hours)
- Wachtvergoeding (hours)
- Km (number)

## Save behavior

- Exactly one timesheet per user per date.
- If a timesheet already exists for that user/date:
  - The app loads it for editing OR
  - The create endpoint rejects and UI switches to update (implementation choice).

# Validation rules

- Project code: must be exactly 6 digits.
- Imputation: must be one of the allowed codes.
- Time: decimal number >= 0 with up to 2 decimals.
- Shift: required.
- Date: must represent a valid calendar date.

# Tech constraints

- Frontend: plain HTML/CSS/JS (no frontend libraries).
- Backend: Node.js + Express.
- DB: MongoDB with Mongoose.
