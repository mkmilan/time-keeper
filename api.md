# API overview (JSON)

Base: /api

## Users

GET /api/users

- Returns active users for dropdown.
  Response:
  [
  { "_id": "...", "fullName": "Milan Margetic", "sapNumber": "446111" }
  ]

## Imputation codes

GET /api/imputations

- Returns active imputation codes for dropdown.
  Response:
  [
  { "code3": 309, "short": "CO", "label": "Corrigeren" }
  ]

## Timesheets

### Get timesheet by user + date

GET /api/timesheets?userId=...&dateKey=YYYY-MM-DD

- Used to load existing entry for that day.

Response:
{
"\_id": "...",
"userId": "...",
"sapNumberSnapshot": "446111",
"dateKey": "2026-01-12",
"shift": "day",
"lines": [
{ "projectCode6": "058908", "imputationCode3": 309, "timeHours": 8.0 }
],
"extras": { "vuilWerkHours": 0.0, "supportsHours": 0.0, "wachtvergoedingHours": 0.0, "km": 0 },
"totalHours": 8.0
}

### Create (or upsert) a timesheet for the day

POST /api/timesheets
Request:
{
"userId": "...",
"dateKey": "2026-01-12",
"shift": "day",
"lines": [
{ "projectCode6": "058908", "imputationCode3": 309, "timeHours": 8.0 }
],
"extras": { "vuilWerkHours": 0, "supportsHours": 0, "wachtvergoedingHours": 0, "km": 0 }
}

Rules:

- Server fetches user -> sets sapNumberSnapshot.
- Server validates all fields.
- Server calculates totalHours from lines.
- Enforce unique (userId + dateKey).
- Recommended behavior: UPSERT (create if missing, update if exists).

Response:
{ "ok": true, "timesheetId": "...", "totalHours": 8.0 }

## Admin reporting (API-first, UI later)

### List timesheets with filters

GET /api/admin/timesheets?from=YYYY-MM-DD&to=YYYY-MM-DD&userId=...&shift=day
Response: array of timesheets (summary fields + totals)

### List by project (lines-based report)

GET /api/admin/project-lines?from=YYYY-MM-DD&to=YYYY-MM-DD&projectCode6=058908
Response:
[
{
"dateKey": "2026-01-12",
"userFullName": "Milan Margetic",
"shift": "day",
"projectCode6": "058908",
"imputationCode3": 309,
"timeHours": 8.0
}
]

Security note:

- Admin endpoints must be protected once auth is added.
