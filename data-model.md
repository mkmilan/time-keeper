# MongoDB collections

## users

Purpose: dropdown of workers and SAP auto-fill.

Fields:

- \_id: ObjectId
- fullName: string (required)
- sapNumber: string (required)
- isAdmin: boolean (default false)
- isActive: boolean (default true)
- createdAt, updatedAt

Indexes:

- { fullName: 1 } (optional, for sorting/search)
- { sapNumber: 1 } (optional)

Example:
{
"\_id": "...",
"fullName": "Milan Margetic",
"sapNumber": "446111",
"isAdmin": false,
"isActive": true
}

## imputationCodes

Purpose: dropdown options for 3-digit codes (301..312).

Fields:

- \_id: ObjectId
- code3: number (required, unique)
- short: string (required)
- label: string (required)
- active: boolean (default true)

Index:

- unique { code3: 1 }

Seed defaults:
301 BP Buizenpark
302 LA Voorlassen
303 BU Buigen
304 MO Monteur
305 OV Oven
306 ST Stralen
307 SC Schilderen
308 HT Hydrotest
309 CO Corrigeren
310 KO Kotteren
311 QC Quality Control
312 VE Verpakking/Verzending

## projects (optional for now)

Purpose: future dropdown/autocomplete for the 6-digit project code.

Fields:

- \_id: ObjectId
- code6: string (required, unique)
- label: string (optional)
- active: boolean (default true)

## timesheets

Purpose: one document per user per day.

Fields:

- \_id: ObjectId
- userId: ObjectId (required, ref users)
- sapNumberSnapshot: string (required)
- date: Date (required, normalized to local day)
- dateKey: string (required) // YYYY-MM-DD for uniqueness
- shift: string enum ["day","early","late","night"] (required)

- lines: array of objects:

  - projectCode6: string (required, 6 digits)
  - imputationCode3: number (required)
  - timeHours: number (required) // decimal hours, up to 2 decimals

- extras:

  - vuilWerkHours: number (optional)
  - supportsHours: number (optional)
  - wachtvergoedingHours: number (optional)
  - km: number (optional)

- totalHours: number (required) // sum of lines[].timeHours rounded to 2 decimals
- createdAt, updatedAt

Indexes:

- unique compound index: { userId: 1, dateKey: 1 }
- { dateKey: 1, shift: 1 }
- { "lines.projectCode6": 1 }
- { "lines.imputationCode3": 1 }

Rounding rule:

- When calculating totals, round to 2 decimals (to avoid floating drift).
