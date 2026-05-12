# src/server/data-integrity/

This module owns all field-level data validation and sanitization. It replaces the old `bucket-sanitizers.ts` and `bucket-validators.ts` with a modular per-field architecture.

---

## Architecture

Each field has its own file that handles:
1. **Incoming** (Spreadsheet → MongoDB) — validates and cleans raw spreadsheet values
2. **Outgoing** (MongoDB → SFSG) — transforms stored values into SFSG API format
3. **Constraints** — documents whether the field is required, valid patterns, etc.

```
data-integrity/
  sanitizer-validation-controller.ts       ← orchestrator, base utilities, validators, legacy exports
  shared/                       ← fields used by both org and service
    name/name.sanitizer.ts
    alternate-name/alternate-name.sanitizer.ts
    website/website.sanitizer.ts
    email/email.sanitizer.ts
    description/description.sanitizer.ts
    internal-notes/internal-notes.sanitizer.ts
    markdown-notes/markdown-notes.sanitizer.ts
    hours/hours.sanitizer.ts
  location/                     ← address components
    location-name/location-name.sanitizer.ts
    address/address.sanitizer.ts
    city/city.sanitizer.ts
    state/state.sanitizer.ts
    zip/zip.sanitizer.ts
  phone/                        ← phone components
    phone-number/phone-number.sanitizer.ts
    phone-name/phone-name.sanitizer.ts
  organization/                 ← org-only fields
    legal-status/legal-status.sanitizer.ts
  service/                      ← service-only fields
    short-description/short-description.sanitizer.ts
    application-process/application-process.sanitizer.ts
    required-documents/required-documents.sanitizer.ts
    interpretation-services/interpretation-services.sanitizer.ts
    clinician-actions/clinician-actions.sanitizer.ts
    cost/cost.sanitizer.ts
    wait-time/wait-time.sanitizer.ts
    categories/categories.sanitizer.ts
    eligibilities/eligibilities.sanitizer.ts
```

---

## SanitizeResult Interface

Every `sanitizeIncoming` function returns:

```typescript
interface SanitizeResult {
  valid: boolean;    // whether the value passed validation
  value: any;        // the cleaned/transformed value (even if invalid, for reporting)
  errors: string[];  // human-readable error messages (empty if valid)
}
```

This allows `generateOrgDocuments()` to:
- Collect ALL errors for a row (not stop at the first)
- Decide whether to create the record (all required fields valid + no invalid provided fields)
- Report all problems in the import report

---

## sanitizer-validation-controller.ts

The controller provides:

1. **Base utilities** — `sanitizeValue()` (null → '', trim), `sanitizeSpreadsheetData()` (bulk pre-clean)
2. **Validators** — `validateSpreadsheetData()` (checks rows exist), `validateRow()` (runs all field sanitizers, collects all errors)
3. **`incoming` object** — all incoming sanitizers keyed by field name
4. **`outgoing` object** — all outgoing sanitizers keyed by field name
5. **Legacy exports** — backward-compatible function names that call incoming sanitizers and return just the value

---

## Field Behaviors

| Field | Required | Incoming Transform | Outgoing Transform |
|-------|----------|-------------------|-------------------|
| name | ✅ Yes | Title Case | Pass-through |
| website | No | Validate URL pattern, prepend https:// if missing | Ensure https:// prefix |
| email | No | Validate @ and domain, lowercase | Pass-through |
| address | No | Title Case | Pass-through |
| city | No | Title Case | Pass-through |
| state | No | Uppercase | Pass-through |
| phone-number | No | Strip non-digits, format XXX-XXX-XXXX | Strip to digits only |
| phone-name | No | Sentence Case | Pass-through |
| categories | No | Split on comma → array | Pass-through (transform handles SFSG objects) |
| eligibilities | No | Split on comma → array | Pass-through (transform handles SFSG objects) |
| All others | No | Trim only | Pass-through |

---

## Adding a New Field

1. Create a folder under the appropriate section (shared/location/phone/organization/service)
2. Create `field-name.sanitizer.ts` with `constraints`, `sanitizeIncoming`, `sanitizeIncomingFromSFSG`, `sanitizeOutgoing`
3. Import in `sanitizer-validation-controller.ts` and add to `incoming`/`outgoing` objects
4. Add a legacy export if needed for backward compatibility
5. Update `docs/data-integrity-field-rules.md` with the rules for all three directions
