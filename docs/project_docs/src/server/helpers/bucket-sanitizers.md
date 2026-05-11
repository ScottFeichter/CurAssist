# src/server/helpers/bucket-sanitizers.ts

This module contains sanitizer functions that clean and normalize spreadsheet data before storing it in MongoDB. Each function handles one field type.

---

## Core Pattern

Every sanitizer follows the same pattern:
1. Accept any value (could be string, number, null, undefined from spreadsheet)
2. Convert to trimmed string via `sanitizeValue()`
3. Apply field-specific formatting (title case, uppercase, phone formatting, etc.)
4. Return the cleaned string

---

## Line-by-Line Breakdown

### Base Sanitizer

```typescript
function sanitizeValue(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}
```
The foundation all others build on:
- `null`/`undefined` → empty string (spreadsheet cells can be empty)
- `String(value)` — handles numbers, booleans, etc. from spreadsheet parsing
- `.trim()` — removes leading/trailing whitespace

---

### Name Sanitizers

```typescript
export function sanitizeName(value: any): string {
  const cleaned = sanitizeValue(value);
  const titleCase = cleaned.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  return titleCase;
}
```
Converts to Title Case: `"SOME ORG NAME"` → `"Some Org Name"`. Applied to org names, addresses, and cities.

```typescript
export function sanitizeAlternateName(value: any): string {
  return sanitizeValue(value);
}
```
Just trims — alternate names (nicknames) keep their original casing.

---

### Location Sanitizers

```typescript
export function sanitizeState(value: any): string {
  return sanitizeValue(value).toUpperCase();
}
```
States are always uppercase: `"ca"` → `"CA"`.

```typescript
export function sanitizeAddress(value: any): string { ... }
export function sanitizeCity(value: any): string { ... }
```
Both use Title Case (same logic as `sanitizeName`).

---

### Phone Sanitizers

```typescript
export function sanitizeOrganizationPhones(value: any): string {
  const cleaned = sanitizeValue(value);
  const digits = cleaned.replace(/\D/g, '');
  const formatted = digits.length === 10
    ? `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`
    : cleaned;
  return formatted;
}
```
- `replace(/\D/g, '')` — strips all non-digit characters: `"(415) 771-6600"` → `"4157716600"`
- If exactly 10 digits, formats as `XXX-XXX-XXXX`
- Otherwise returns the original (might be international or malformed)

```typescript
export function sanitizePhoneName(value: any): string {
  const cleaned = sanitizeValue(value);
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase() : '';
}
```
Sentence case for phone labels: `"VOICE"` → `"Voice"`.

---

### List Sanitizers

```typescript
export function sanitizeServiceCategories(value: any): string[] {
  const cleaned = sanitizeValue(value);
  return cleaned ? cleaned.split(', ').map(item => item.trim()).filter(item => item) : [];
}
```
Splits a comma-separated string into an array: `"Health & Wellness, Childcare"` → `["Health & Wellness", "Childcare"]`. Returns empty array if input is empty.

`sanitizeServiceEligibilitiesList` uses the same logic.

---

### Pass-Through Sanitizers

Many sanitizers just call `sanitizeValue()` with no additional formatting:
- `sanitizeWebsite`, `sanitizeEmail`, `sanitizeDescription`, `sanitizeInternalNotes`, etc.

These exist as separate functions for:
1. **Future extensibility** — easy to add URL validation, email normalization, etc. later
2. **Consistency** — every field goes through a named sanitizer in `generateOrgDocuments()`
3. **Testability** — each can be unit tested independently

---

## Usage

These are imported by `bucket-helpers.ts` and called during `generateOrgDocuments()`:
```typescript
const name = sanitizeName(row[orgFieldMap.organization_name] || '');
const phone = sanitizeOrganizationPhones(row[organizationPhoneFieldMap.phone] || '');
```

They're also tested in `src/tests/unit/bucket-sanitizers.test.ts`.
