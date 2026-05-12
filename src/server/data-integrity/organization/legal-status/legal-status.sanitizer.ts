import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

// #region ===================== CONSTRAINTS ====================================

export const constraints = { required: false };

// #endregion ------------------------------------------------------------------

// #region ===================== INCOMING (Spreadsheet → DB) ====================

/**
 * Sanitizes organization legal status from a spreadsheet.
 * Trims only — preserves original casing and formatting (e.g. "501(c)(3)", "Nonprofit").
 *
 * @param value - Raw cell value from spreadsheet
 */
export function sanitizeIncoming(value: any): SanitizeResult {
  const cleaned = sanitizeValue(value);
  return { valid: true, value: cleaned, errors: [] };
}

// #endregion ------------------------------------------------------------------

// #region ===================== INCOMING FROM SFSG (SFSG → DB) =================

/**
 * Sanitizes legal status imported from the SFSG API.
 * Trusts SFSG as-is — no modification.
 *
 * @param value - Legal status from SFSG API response
 */
export function sanitizeIncomingFromSFSG(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

// #endregion ------------------------------------------------------------------

// #region ===================== OUTGOING (DB → SFSG) ===========================

/**
 * Prepares legal status for SFSG API.
 * Trims only — SFSG accepts plain string as-is.
 *
 * @param value - Legal status from MongoDB
 */
export function sanitizeOutgoing(value: string): string {
  if (!value) return '';
  return value.trim();
}

// #endregion ------------------------------------------------------------------
