# src/server/data-integrity/

This module owns all field-level data validation and sanitization. Each field has its own file following the Single Responsibility Principle — controller orchestrates, validators check rules, sanitizers transform values.

---

## Architecture

Each field file (`.sanitizer-validator.ts`) contains:
1. **Constraints** — field config (required, maxLength, patterns)
2. **Controller** — three exported functions (one per data direction), orchestrates validate → sanitize → return
3. **Validators** — private functions that check rules, return error arrays
4. **Sanitizers** — private functions that transform values (title case, strip HTML, etc.)

---

## Function Naming Convention

Every exported controller function follows this pattern:
```
{fieldName}SanitizeValidate{Direction}
```

Examples:
- `nameSanitizeValidateIncomingFromSpreadsheet(value)` → returns `SanitizeResult`
- `nameSanitizeValidateIncomingFromSFSG(value)` → returns `string`
- `nameSanitizeValidateOutgoingToSFSG(value)` → returns `string`

---

## Directory Structure

```
data-integrity/
  sanitizer-validation-controller.ts    ← master controller, types, base utilities, legacy exports
  shared/                               ← fields used by both org and service
    name/name.sanitizer-validator.ts
    alternate-name/alternate-name.sanitizer-validator.ts
    website/website.sanitizer-validator.ts
    email/email.sanitizer-validator.ts
    description/description.sanitizer-validator.ts
    internal-notes/internal-notes.sanitizer-validator.ts
    markdown-notes/markdown-notes.sanitizer-validator.ts
    hours/hours.sanitizer-validator.ts
  location/                             ← address component fields
    location-name/location-name.sanitizer-validator.ts
    address/address.sanitizer-validator.ts
    city/city.sanitizer-validator.ts
    state/state.sanitizer-validator.ts
    zip/zip.sanitizer-validator.ts
  phone/                                ← phone component fields
    phone-number/phone-number.sanitizer-validator.ts
    phone-name/phone-name.sanitizer-validator.ts
  organization/                         ← org-only fields
    legal-status/legal-status.sanitizer-validator.ts
  service/                              ← service-only fields
    short-description/short-description.sanitizer-validator.ts
    application-process/application-process.sanitizer-validator.ts
    required-documents/required-documents.sanitizer-validator.ts
    interpretation-services/interpretation-services.sanitizer-validator.ts
    clinician-actions/clinician-actions.sanitizer-validator.ts
    cost/cost.sanitizer-validator.ts
    wait-time/wait-time.sanitizer-validator.ts
    categories/categories.sanitizer-validator.ts
    eligibilities/eligibilities.sanitizer-validator.ts
```

---

## sanitizer-validation-controller.ts

The master controller provides:

1. **Types** — `SanitizeResult`, `SpreadsheetValidationResult`, `RowValidationResult`
2. **Base utilities** — `sanitizeValue()` (null → '', trim), `sanitizeSpreadsheetData()` (bulk pre-clean)
3. **General validators** — `validateSpreadsheetData()` (checks rows exist), `validateRow()` (runs all field sanitizers, collects all errors)
4. **`incoming` object** — all incoming sanitizers keyed by field name (for programmatic access)
5. **`outgoing` object** — all outgoing sanitizers keyed by field name
6. **Legacy exports** — backward-compatible function names that call incoming sanitizers and return just the value

---

## File Template

Every `.sanitizer-validator.ts` file follows this structure:

```typescript
// #region ===================== IMPORTS =======================================
import { extendedConsole as console } from '../../../../streams/consoles/customConsoles';
import { log } from '../../../../utils/logger/logger-setup/logger-wrapper';
import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';
// #endregion ------------------------------------------------------------------

console.enter();

// #region ===================== CONSTRAINTS ====================================
export const constraints = { required: false, maxLength: 1000 };
// #endregion ------------------------------------------------------------------

// #region ===================== CONTROLLER ====================================

// -----------------------------------------------------------------------------
export function fieldSanitizeValidateIncomingFromSpreadsheet(value: any): SanitizeResult { ... }

// -----------------------------------------------------------------------------
export function fieldSanitizeValidateIncomingFromSFSG(value: any): string { ... }

// -----------------------------------------------------------------------------
export function fieldSanitizeValidateOutgoingToSFSG(value: string): string { ... }

// #endregion ------------------------------------------------------------------

// #region ===================== VALIDATORS ====================================
// -----------------------------------------------------------------------------
function validate(value: string): string[] { ... }
// #endregion ------------------------------------------------------------------

// #region ===================== SANITIZERS =====================================
// -----------------------------------------------------------------------------
function toTitleCase(value: string): string { ... }
// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================
// #endregion ------------------------------------------------------------------
```

---

## Data Directions

| Direction | Function suffix | Returns | Used by |
|-----------|----------------|---------|---------|
| Spreadsheet → DB | `IncomingFromSpreadsheet` | `SanitizeResult` (valid, value, errors) | `generateOrgDocuments()` |
| SFSG → DB | `IncomingFromSFSG` | `string` (trusted, just cleaned) | `import-file` route |
| DB → SFSG | `OutgoingToSFSG` | `string` (formatted for SFSG API) | `transformOrgToSFPayload()` |

---

## Adding a New Field

1. Create folder under appropriate section (shared/location/phone/organization/service)
2. Create `field-name.sanitizer-validator.ts` following the template above
3. Import in `sanitizer-validation-controller.ts` with alias
4. Add to `incoming`/`outgoing` objects
5. Add legacy export if needed
6. Update `docs/data-integrity-field-rules.md`

---

## See Also

- `docs/data-integrity-field-rules.md` — tracks all field rules by direction (the source of truth for what each field does)
