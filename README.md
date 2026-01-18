# Equans Bon de prestation

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set MongoDB connection (optional):

```bash
export MONGODB_URI="mongodb://127.0.0.1:27017/equans_timesheet"
```

3. Seed base data (imputation codes + sample user):

```bash
npm run seed
```

4. Start the server:

```bash
npm run start
```

Open `http://localhost:3000` for the worker page.

## API

- `GET /api/users`
- `GET /api/imputations`
- `GET /api/timesheets?userId=...&dateKey=YYYY-MM-DD`
- `POST /api/timesheets`
- `GET /api/admin/timesheets?from=YYYY-MM-DD&to=YYYY-MM-DD&userId=...&shift=...`
- `GET /api/admin/project-lines?from=YYYY-MM-DD&to=YYYY-MM-DD&projectCode6=...`

## Notes

- Date input is DDMMYY in the UI and stored as `dateKey` (YYYY-MM-DD).
- Total is always computed on the server from line time hours.
