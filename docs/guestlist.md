# Guest List Maintenance

This project uses a **single source of truth** for invited guests: `content/guestlist.json`.

Use one of these workflows:

1. JSON (preferred) for direct edits
2. CSV import for family spreadsheets

After updating the source list, run a seed command to insert only missing guests into the RSVP store.

## Current RSVP Guest Flow (Already In Place)

1. Source of truth: `content/guestlist.json`
2. RSVP runtime storage:
   - Postgres `guests` table when `DATABASE_URL` is set
   - `.data/guests.json` when `DATABASE_URL` is not set
3. RSVP APIs/search read from the seeded guest store, not directly from `content/guestlist.json`.
4. Seeding only inserts missing normalized names and never overwrites existing RSVP answers.

## Prerequisites

1. Install dependencies:

```bash
npm install
```

This installs tooling used by the scripts, including:

- `tsx` (runs the CSV import TypeScript script locally)
- `csv-parse` (CSV parsing for imports)

## Quick Walkthroughs

## How to add 1 name (JSON)

1. Open `content/guestlist.json`.
2. Add one guest object under `guests`:

```json
{
  "guests": [
    {
      "fullName": "Godwill Ocheme",
      "email": "godwill@example.com",
      "phoneLast4": "1234"
    }
  ]
}
```

`email` and `phoneLast4` are optional; use empty string or omit if unknown.

3. Seed missing guests into storage:

```bash
npm run seed:guests
```

What this does:
- Reads `content/guestlist.json`
- Normalizes names for dedupe
- Inserts only missing guests
- Never overwrites existing RSVP responses

## How to add 100 names from a spreadsheet (CSV)

1. Export your spreadsheet as CSV.
2. Ensure headers include at least `fullName`.
3. Import CSV into `content/guestlist.json`:

```bash
npm run import:guests:csv
```

Default command target:
- Input CSV: `content/guestlist.csv`
- Output JSON: `content/guestlist.json`

For a different CSV file:

```bash
npx tsx scripts/import-guests-csv.ts ./path/to/your-guests.csv
```

4. Seed missing guests into storage:

```bash
npm run seed:guests
```

## JSON Format (Preferred)

File: `content/guestlist.json`

Each item:

```json
{
  "guests": [
    {
      "fullName": "Full Name",
      "email": "optional@example.com",
      "phoneLast4": "1234"
    }
  ]
}
```

Rules:
- `fullName` is required.
- `email` is optional.
- `phoneLast4` is optional (must be 4 digits if provided).

## CSV Format (Spreadsheet Import)

Minimum required column:
- `fullName`

Optional columns:
- `email`
- `phoneLast4`

Example:

```csv
fullName,email,phoneLast4
Godwill Ocheme,godwill@example.com,1234
```

## Commands

```bash
npm run seed:guests
```

- Reads `content/guestlist.json`
- Seeds to:
  - `guests` table when `DATABASE_URL` is set
  - `.data/guests.json` when `DATABASE_URL` is not set
- Inserts only missing normalized names

```bash
npm run import:guests:csv
```

- Reads `content/guestlist.csv`
- Parses CSV with `csv-parse`
- Appends only missing guests into `content/guestlist.json`
- Logs warnings for duplicate CSV rows

## Dedupe + Safety Rules

Implemented in scripts/storage logic:

1. Deduplicate by normalized full name:
   - lowercase
   - remove punctuation
   - collapse repeated spaces
2. Never overwrite existing RSVP responses.
3. Insert only missing guests.
4. If a duplicate row appears in the CSV input, skip it and log a warning.

## Where Is The File?

- Canonical guest list: `content/guestlist.json`
- CSV template/input: `content/guestlist.csv` (optional)
- Seed script: `scripts/seed-guests.ts`
- CSV import script: `scripts/import-guests-csv.ts`

## Troubleshooting

### I added names but they do not show up

1. Run:

```bash
npm run seed:guests
```

2. Confirm names exist in `content/guestlist.json`.
3. Check script output for "inserted" and "skipped existing" counts.

### Duplicates

- Duplicate names are detected using normalized full name.
- Existing records are not overwritten.
- Duplicate CSV rows are skipped with warnings.

### CSV parsing errors

- Confirm CSV has a `fullName` header.
- Ensure the file is comma-separated and has no malformed quotes.
- Retry with:

```bash
npx tsx scripts/import-guests-csv.ts ./path/to/file.csv
```

### Database not running

- If `DATABASE_URL` is not set or unavailable, seeding falls back to `.data/guests.json`.
- Set `DATABASE_URL` and rerun `npm run seed:guests` to seed Postgres.
