# Worker form layout (match the paper)

## Header section

- Date: 6 boxes in one line for DDMMYY.
- SAP n°: read-only input.
- Name: dropdown.

Behavior:

- When Name changes:
  - SAP field updates immediately.
  - Optionally: auto-load today's timesheet if date already set.

## Lines table

Columns:

- Project (6 digits) [input]
- Imputation (3 digits) [select]
- Time (decimal hours) [input]
- Remove row [button]

Start with 5 rows by default, but allow "Add line" button to append more.

Row rules:

- Empty row is ignored.
- If any field is filled in a row, require all 3 fields.
- Project validation: exactly 6 digits.
- Time input: allow decimals up to 2 digits.

Total:

- Show "TOTAL" at bottom right.
- Total updates live as user types.
- Total = sum of time column only.

## Time helper table (like paper)

Display on the right side of the lines table:
10 min = 0.17
20 min = 0.33
30 min = 0.50
40 min = 0.67
50 min = 0.83

## Shift

Show 4 options in one row:

- Day
- Early
- Late
- Night

Digitally: use radio buttons (only one allowed).
Shift is required.

## Extras section

4 rows:

- Vuil werk (checkbox + hours input)
- Supports (checkbox + hours input)
- Wachtvergoeding (checkbox + hours input)
- Km (checkbox + number input)

Behavior:

- If checkbox off -> input disabled and value treated as null/0.
- If checkbox on -> input enabled and validated (>= 0).

## Buttons

- Save
- Clear (optional)
- If existing timesheet loaded: show "Saved at ..." message after save.

## Error handling

- Inline error messages per field.
- On submit, scroll to first error.
