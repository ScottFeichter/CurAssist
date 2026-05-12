import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

// #region ===================== CONSTRAINTS ====================================

export const constraints = { required: false };

// #endregion ------------------------------------------------------------------

// #region ===================== INCOMING (Spreadsheet → DB) ====================

/**
 * Sanitizes a phone label/service_type from a spreadsheet.
 * Trims only — SFSG stores these as mixed case, as-entered ("Broadway", "Dr. T.K.L", "Geary").
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
 * Sanitizes a phone name imported from the SFSG API.
 * Trusts SFSG as-is — no modification.
 *
 * @param value - service_type from SFSG API response
 */
export function sanitizeIncomingFromSFSG(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

// #endregion ------------------------------------------------------------------

// #region ===================== OUTGOING (DB → SFSG) ===========================

/**
 * Prepares phone name/service_type for SFSG API.
 * Trims only — SFSG accepts mixed case as-entered.
 * NOTE: service_type is REQUIRED by SFSG. If empty, defaults to "voice" to prevent 500 error.
 *
 * @param value - Phone name from MongoDB
 */
export function sanitizeOutgoing(value: string): string {
  if (!value) return 'voice';
  return value.trim() || 'voice';
}

// #endregion ------------------------------------------------------------------
