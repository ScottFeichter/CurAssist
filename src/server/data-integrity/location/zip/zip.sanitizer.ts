import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

// #region ===================== CONSTRAINTS ====================================

export const constraints = {
  required: false,
  /** Must be exactly 5 digits (after stripping optional -XXXX suffix) */
  pattern: /^\d{5}$/,
};

// #endregion ------------------------------------------------------------------

// #region ===================== INCOMING (Spreadsheet → DB) ====================

/**
 * Sanitizes a zip/postal code from a spreadsheet.
 * Accepts "94103" or "94103-1234" — strips the -XXXX suffix and stores only 5 digits.
 * Validates that the result is exactly 5 digits.
 *
 * @param value - Raw cell value from spreadsheet
 */
export function sanitizeIncoming(value: any): SanitizeResult {
  const cleaned = sanitizeValue(value);
  if (!cleaned) return { valid: true, value: '', errors: [] };

  // Strip optional -XXXX suffix
  const fiveDigit = cleaned.split('-')[0].trim();

  if (!constraints.pattern.test(fiveDigit)) {
    return { valid: false, value: cleaned, errors: [`Invalid zip: "${cleaned}" must be 5 digits (with optional -XXXX suffix)`] };
  }

  return { valid: true, value: fiveDigit, errors: [] };
}

// #endregion ------------------------------------------------------------------

// #region ===================== INCOMING FROM SFSG (SFSG → DB) =================

/**
 * Sanitizes a zip imported from the SFSG API.
 * Trusts SFSG as-is — no modification.
 *
 * @param value - Zip from SFSG API response
 */
export function sanitizeIncomingFromSFSG(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

// #endregion ------------------------------------------------------------------

// #region ===================== OUTGOING (DB → SFSG) ===========================

/**
 * Prepares zip for SFSG API.
 * Trims only — should already be 5 digits from incoming sanitization.
 *
 * @param value - Zip from MongoDB
 */
export function sanitizeOutgoing(value: string): string {
  if (!value) return '';
  return value.trim();
}

// #endregion ------------------------------------------------------------------
