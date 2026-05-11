# src/server/helpers/bucket-validators.ts

This module contains validator functions for spreadsheet data. Currently all validators are stubs that return `true` — they exist as scaffolding for future validation logic.

---

## Current State

Every validator follows this pattern:

```typescript
export function validateName(value: any): boolean {
  return true;
}
```

They accept any value and always return `true` (valid). The structure mirrors `bucket-sanitizers.ts` — one validator per field type.

---

## Purpose

These are placeholders for future validation rules such as:
- `validateEmail` — check for valid email format
- `validateWebsite` — check for valid URL
- `validateZip` — check for 5-digit or 9-digit zip
- `validateOrganizationPhones` — check for valid phone number length
- `validateName` — check for minimum length or disallowed characters

---

## validateSpreadsheetData

```typescript
export function validateSpreadsheetData(rows: any[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (rows.length === 0) {
    errors.push('Spreadsheet contains no data rows');
  }
  return { valid: errors.length === 0, errors };
}
```
The only validator with real logic — checks that the spreadsheet has at least one data row. Returns an object with `valid` boolean and an `errors` array for reporting.

---

## Usage

Not currently called in production code — the sanitizers handle data cleaning. These would be called before sanitization to reject invalid data early (e.g. return a 400 error to the client with specific field errors).
