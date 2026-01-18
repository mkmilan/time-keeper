# Goal
Build a simple web app for workers to enter a daily "Bon de prestation" (timesheet) in electronic form, matching the paper layout.

# Core rules (confirmed)
- Date input: 6 digits in the UI (DDMMYY), stored as a real date in DB.
- Name: dropdown from DB (users).
- SAP number: auto-filled from selected user (read-only in UI).
- One timesheet per user per day (enforced).
- Lines: unlimited (UI starts with a few rows; user can add more).
- Per line:
  - Project code: 6 digits, free input for now
  - Imputation code: dropdown (301..312 list)
  - Time: numeric decimal hours (example: 8.00). Total is the sum of these times only.
- Shift: exactly one value (day / early / late / night).
- Extras: 4 optional items with numeric inputs (same decimal hours format, except km which is numeric distance).

# Time entry standard
- Time is entered as decimal hours with up to 2 decimals (example: 0.50, 8.00).
- Show a small helper table on the page (like on paper):
  - 10 min = 0.17
  - 20 min = 0.33
  - 30 min = 0.50
  - 40 min = 0.67
  - 50 min = 0.83
- Total = sum(line.time) only.
- UI should update total live as user types.
- Server should re-calculate total before saving (never trust client totals).

# Non-goals (for now)
- No advanced admin panel UI yet (only APIs + basic list pages if needed).
- No project dropdown/autocomplete yet (free input).
- No export (CSV/PDF) yet.

# Pages
1) Worker page: create/edit today's timesheet
2) Admin page (later): list/filter (by user, by project, by shift, by date range)
   - For now: build the API endpoints that will support it.

# Acceptance checklist
- Worker can select name -> SAP fills automatically.
- Worker can enter date DDMMYY and submit.
- Worker can add/remove lines.
- Imputation dropdown matches the provided codes and labels.
- Total updates live and matches server-stored total.
- Only one timesheet per user per date is allowed:
  - If exists, UI loads it for editing (or server rejects duplicate create and offers update path).
- Shift is required and only one can be selected.
- Extras are optional; saved only if provided.

# Tech stack
- Backend: Node.js + Express + MongoDB with Mongoose
- Frontend: plain HTML, CSS, and JavaScript
