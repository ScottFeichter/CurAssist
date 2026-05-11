import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

// #region ===================== CONSTRAINTS ====================================

export const constraints = {
  /** Name is the only required field — record cannot be created without it */
  required: true,
};

// #endregion ------------------------------------------------------------------

// #region ===================== INCOMING (Spreadsheet → DB) ====================

/**
 * Validates and sanitizes an organization or service name from a spreadsheet.
 * Converts to Title Case. Required field — empty value is invalid.
 *
 * @param value - Raw cell value from spreadsheet
 * @returns SanitizeResult with title-cased name or errors
 */
export function sanitizeIncoming(value: any): SanitizeResult {
  const cleaned = sanitizeValue(value);

  if (!cleaned) {
    return { valid: false, value: '', errors: ['Name is required'] };
  }

  const titleCase = cleaned
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return { valid: true, value: titleCase, errors: [] };
}

// #endregion ------------------------------------------------------------------

// #region ===================== OUTGOING (DB → SFSG) ===========================

/**
 * Prepares a name value for the SFSG API call.
 * SFSG accepts names as-is. No additional transformation needed.
 *
 * @param value - Name value from MongoDB
 * @returns Name ready for SFSG API payload
 */
export function sanitizeOutgoing(value: string): string {
  return value || '';
}

// #endregion ------------------------------------------------------------------
