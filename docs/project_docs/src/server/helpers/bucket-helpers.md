# src/server/helpers/bucket-helpers.ts

This is the largest helper module — it contains the core business logic for spreadsheet import, template hydration, SFSG payload transformation, and report generation.

---

## Overview of Exported Functions

| Function | Purpose |
|----------|---------|
| `createBucketStructure` | Creates a Bucket document in MongoDB |
| `parseSpreadsheet` | Reads a spreadsheet buffer into row objects |
| `generateOrgDocuments` | Converts spreadsheet rows into Org documents in MongoDB |
| `buildReportBuffer` | Appends status columns to the original workbook for download |
| `hydrateTemplate` | Injects org data into the HTML template at request time |
| `transformOrgToSFPayload` | Converts an Org document to SFSG API payload shape |
| `splitCategoryNames` | Splits category names into top/sub arrays |
| `splitEligibilityNames` | Splits eligibility names into top/sub arrays |
| `splitSFSGCategories` | Splits SFSG category objects into top/sub |
| `splitSFSGEligibilities` | Splits SFSG eligibility objects into top/sub |
| `normalizeSFSGStringArray` | Extracts name strings from SFSG objects |

---

## Key Concepts

### Top vs Sub Categories/Eligibilities

SFSG has a two-level hierarchy for categories and eligibilities. The `topCategoryNames` and `topEligibilityNames` Sets define which names are "top-level" (broad groupings). Everything else is a sub-category/sub-eligibility. This distinction matters because the UI renders them in separate pill containers.

### Template Hydration

Instead of storing pre-populated HTML files, the app stores raw data in MongoDB and injects it into the HTML template on every request. `hydrateTemplate()` does this by:
1. Reading the combined template file
2. Using regex replacements and helper functions to inject values into inputs, textareas, phone lists, address lists, category pills, etc.
3. Returning the populated HTML string

### Minutes from Midnight

Schedule times are stored as integers (minutes from midnight) in the database but displayed as "HH:MM" strings in the UI. `minutesToTime()` converts back for display.

---

## Line-by-Line Breakdown

### createBucketStructure

```typescript
export async function createBucketStructure(bucketName: string): Promise<void> {
  await Bucket.create({ name: bucketName });
}
```
Creates a Bucket document. The `unique: true` index on `name` prevents duplicates at the DB level.

---

### parseSpreadsheet

```typescript
const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
```
Parses the binary spreadsheet buffer (supports .xlsx, .ods, .csv) into an in-memory workbook object.

```typescript
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
```
Gets the first sheet. Multi-sheet workbooks only use sheet 1.

```typescript
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
```
Converts the sheet to a 2D array. `{ header: 1 }` means "use row indices as keys" (returns arrays, not objects). Row 0 = headers, rows 1+ = data.

```typescript
const rows = data.slice(1).map(row => {
  const obj: any = {};
  headers.forEach((header, index) => { obj[header] = row[index] || ''; });
  return obj;
});
```
Converts each data row into an object keyed by header names. E.g. `{ "Name": "Org A", "Email": "a@b.com" }`.

Returns the workbook too — needed later for `buildReportBuffer()` to append status columns.

---

### generateOrgDocuments

This is the main import engine. For each spreadsheet row:

1. **Extracts org fields** using `orgFieldMap` to map spreadsheet column names to internal field names
2. **Sanitizes** each value (trim, title case names, format phones, etc.)
3. **Builds addresses and phones** from the location/phone field maps
4. **Builds services** from "Service X" prefixed columns (if present)
5. **Optionally creates a service from org data** (`createServiceFromOrg` flag — duplicates org info as a service)
6. **Builds the spreadsheetService** — always created from org-level data for the service toggle
7. **Creates the Org document** in MongoDB
8. **Reports success/failure** per row

The `progressCallback` is called after each row with a percentage — used for progress reporting to the client.

---

### buildReportBuffer

Takes the original workbook and appends columns showing import results:
- `DB Status` / `DB Detail` — whether the MongoDB insert succeeded
- `SFSG Status` / `SFSG Detail` / `SFSG Org ID` — (optional) whether SFSG submission succeeded
- `Bucket Name` / `Import Date` — metadata

Returns an xlsx buffer that the client downloads as a report file.

---

### hydrateTemplate

The most complex function. It:

1. **Reads the template** from disk (`orgServTemplate-combined.html`)
2. **Stamps the org ID** on the `<body>` tag so the frontend knows which org to save
3. **Sets the SFSG import flag** if the org was imported from SFSG (locks editing)
4. **Injects scalar fields** (name, email, website, etc.) into inputs/textareas
5. **Injects schedule** — converts minutes-from-midnight back to HH:MM and fills time inputs
6. **Injects notes** — populates the markdown notes `<ul>`
7. **Injects addresses** — builds location row HTML with edit/remove buttons
8. **Injects phones** — builds phone row HTML with edit/remove buttons
9. **Injects spreadsheet service** — fills the service toggle section
10. **Injects org services** — clones the service template block for each service, populates each one

The regex-based injection is fragile but works because the template HTML is controlled and predictable.

---

### transformOrgToSFPayload

Converts an Org document into the exact JSON shape the SFSG API expects:
- Wraps the org in `{ resources: [{ ... }] }`
- Maps services with negative IDs (SFSG convention for new services)
- Converts category/eligibility arrays to SFSG objects with `{ name, id, top_level, featured }`
- Strips empty fields

This mirrors the browser-side `transformNewOrg()` in `transform.js` — single source of truth for the server-side submit path.
