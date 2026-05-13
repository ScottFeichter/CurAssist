# src/server/helpers/

This directory contains the server-side business logic, organized as one folder per module.

---

## Structure

```
helpers/
  helpers-index.ts                               ← Barrel file (re-exports everything)
  spreadsheet-parser/
    spreadsheet-parser.ts                        ← createBucketStructure(), parseSpreadsheet()
  generate-org-documents/
    generate-org-documents.ts                    ← generateOrgDocuments() (spreadsheet import engine)
  report-builder/
    report-builder.ts                            ← buildReportBuffer(), IRowResult, ISfsgResult
  category-eligibility-helpers/
    category-eligibility-helpers.ts              ← split/normalize functions
  transform-org-to-sf-payload/
    transform-org-to-sf-payload.ts               ← transformOrgToSFPayload() (DB → SFSG API shape)
  hydrate-template/
    hydrate-template.ts                          ← hydrateTemplate(), minutesToTime() (DB → HTML)
  buckets-map/
    buckets-map.ts                               ← Spreadsheet column → field name mappings
  lookup-tables/
    spreadsheet-incoming.ts                      ← topCategoryNames, topEligibilityNames (incoming from spreadsheet)
    sfsg-outgoing.ts                             ← Re-exports Sets (outgoing to SFSG, for top_level flag)
    sfsg-incoming.ts                             ← Re-exports Sets (incoming from SFSG, fallback)
```

---

## Module Responsibilities

| Module | What it does |
|--------|-------------|
| `spreadsheet-parser` | Creates bucket documents, parses xlsx/ods/csv buffers into row objects |
| `generate-org-documents` | Iterates spreadsheet rows, sanitizes fields, creates Org documents in MongoDB |
| `report-builder` | Appends status columns to the original workbook and returns an xlsx buffer |
| `category-eligibility-helpers` | Splits category/eligibility name arrays into top/sub based on lookup tables |
| `transform-org-to-sf-payload` | Converts an Org document into the exact JSON shape SFSG expects |
| `hydrate-template` | Reads the HTML template, injects org data via regex, returns populated HTML |
| `buckets-map` | Maps spreadsheet column headers to internal field identifiers |
| `lookup-tables` | Defines which names are "top-level" for each data direction |

---

## helpers-index.ts (Barrel)

This file re-exports from all modules so existing imports work unchanged:

```typescript
import { hydrateTemplate, generateOrgDocuments, ... } from '../helpers/helpers-index';
```

The lookup tables are NOT exported from the barrel — they're internal implementation details used only by `category-eligibility-helpers` and `transform-org-to-sf-payload`.

---

## Lookup Tables

| File | Direction | Purpose |
|------|-----------|---------|
| `spreadsheet-incoming.ts` | Spreadsheet → DB | Splitting comma-separated lists into top/sub arrays |
| `sfsg-outgoing.ts` | DB → SFSG | Setting `top_level` flag on category objects in API payloads |
| `sfsg-incoming.ts` | SFSG → DB | Fallback when SFSG response lacks `top_level` flag |

All three currently reference the same data. Separate files allow independent updates if definitions diverge.
