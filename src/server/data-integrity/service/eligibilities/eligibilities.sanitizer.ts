import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

// #region ===================== CONSTRAINTS ====================================

export const constraints = { required: false };

// #endregion ------------------------------------------------------------------

// #region ===================== INCOMING (Spreadsheet → DB) ====================

/**
 * Sanitizes service eligibilities from a spreadsheet.
 * Splits comma-separated string into a flat array. No top/sub distinction.
 *
 * @param value - Raw cell value from spreadsheet (e.g. "Adults, Seniors")
 */
export function sanitizeIncoming(value: any): SanitizeResult {
  const cleaned = sanitizeValue(value);
  if (!cleaned) return { valid: true, value: [], errors: [] };

  const items = cleaned.split(',').map(item => item.trim()).filter(item => item);
  return { valid: true, value: items, errors: [] };
}

// #endregion ------------------------------------------------------------------

// #region ===================== INCOMING FROM SFSG (SFSG → DB) =================

/**
 * Sanitizes eligibilities imported from the SFSG API.
 * SFSG returns [{ name, id, feature_rank }] — we extract names only.
 *
 * @param value - Eligibilities array from SFSG API response
 */
export function sanitizeIncomingFromSFSG(value: any): string[] {
  if (!value || !Array.isArray(value)) return [];
  return value.map((item: any) => typeof item === 'string' ? item : item?.name).filter(Boolean);
}

// #endregion ------------------------------------------------------------------

// #region ===================== OUTGOING (DB → SFSG) ===========================

/**
 * Prepares eligibilities for SFSG API.
 * Returns the flat array as-is — the transform layer handles converting
 * to SFSG objects with { name, id, feature_rank }.
 *
 * @param value - Eligibilities array from MongoDB
 */
export function sanitizeOutgoing(value: string[]): string[] {
  return value || [];
}

// #endregion ------------------------------------------------------------------
