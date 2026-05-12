import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

// #region ===================== CONSTRAINTS ====================================

export const constraints = { required: false };

// #endregion ------------------------------------------------------------------

// #region ===================== HELPERS ========================================

/**
 * If the value is ALL CAPS, converts to Title Case. Otherwise leaves as-is.
 */
function fixAllCaps(value: string): string {
  if (!value) return '';
  if (value === value.toUpperCase() && value !== value.toLowerCase()) {
    return value
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  return value;
}

// #endregion ------------------------------------------------------------------

// #region ===================== INCOMING (Spreadsheet → DB) ====================

/**
 * Sanitizes an alternate name (nickname) from a spreadsheet.
 * Trims whitespace. If ALL CAPS, converts to Title Case. Otherwise preserves casing.
 *
 * @param value - Raw cell value from spreadsheet
 */
export function sanitizeIncoming(value: any): SanitizeResult {
  const cleaned = sanitizeValue(value);
  const fixed = fixAllCaps(cleaned);
  return { valid: true, value: fixed, errors: [] };
}

// #endregion ------------------------------------------------------------------

// #region ===================== INCOMING FROM SFSG (SFSG → DB) =================

/**
 * Sanitizes an alternate name imported from the SFSG API.
 * Trusts SFSG casing — just trims.
 *
 * @param value - Value from SFSG API response
 */
export function sanitizeIncomingFromSFSG(value: any): string {
  return sanitizeValue(value);
}

// #endregion ------------------------------------------------------------------

// #region ===================== OUTGOING (DB → SFSG) ===========================

/**
 * Prepares alternate name for SFSG API.
 * Trims whitespace. If ALL CAPS, converts to Title Case. Otherwise preserves casing.
 *
 * @param value - Value from MongoDB
 */
export function sanitizeOutgoing(value: string): string {
  if (!value) return '';
  const trimmed = value.trim();
  return fixAllCaps(trimmed);
}

// #endregion ------------------------------------------------------------------
