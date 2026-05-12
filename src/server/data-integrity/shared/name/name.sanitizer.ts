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

// #region ===================== INCOMING FROM SFSG (SFSG → DB) =================

/**
 * Sanitizes a name value imported from the SFSG API.
 * Trusts SFSG casing as-is — only trims whitespace.
 *
 * @param value - Name from SFSG API response
 * @returns Trimmed name
 */
export function sanitizeIncomingFromSFSG(value: any): string {
  return sanitizeValue(value);
}

// #endregion ------------------------------------------------------------------

// #region ===================== OUTGOING (DB → SFSG) ===========================

/**
 * Prepares a name value for the SFSG API call.
 * Applies trim + Title Case in case the value was manually entered unsanitized.
 *
 * @param value - Name value from MongoDB
 * @returns Title-cased name ready for SFSG API payload
 */
export function sanitizeOutgoing(value: string): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// #endregion ------------------------------------------------------------------
