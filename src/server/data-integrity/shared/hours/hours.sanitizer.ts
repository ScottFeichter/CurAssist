import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

// #region ===================== CONSTRAINTS ====================================

export const constraints = {
  required: false,
};

// #endregion ------------------------------------------------------------------

// #region ===================== INCOMING (Spreadsheet → DB) ====================

/**
 * Sanitizes hours from a spreadsheet.
 * Hours in spreadsheets are freeform text (too many possible formats to parse).
 * If a value is present, it's stored as a string — the caller (generateOrgDocuments)
 * should append a note like "See spreadsheet for hours details" to the org's internal notes.
 *
 * Returns the raw trimmed value so the caller can detect "has hours data" and act accordingly.
 *
 * @param value - Raw cell value from spreadsheet Hours column
 */
export function sanitizeIncoming(value: any): SanitizeResult {
  const cleaned = sanitizeValue(value);
  return { valid: true, value: cleaned, errors: [] };
}

// #endregion ------------------------------------------------------------------

// #region ===================== INCOMING FROM SFSG (SFSG → DB) =================

/**
 * Sanitizes schedule data imported from the SFSG API.
 * SFSG returns { schedule_days: [{ day, opens_at, closes_at }] } — same format we store.
 * Trusts as-is, no modification.
 *
 * @param value - Schedule object from SFSG API response
 */
export function sanitizeIncomingFromSFSG(value: any): any {
  if (!value) return { schedule_days: [] };
  return value;
}

// #endregion ------------------------------------------------------------------

// #region ===================== OUTGOING (DB → SFSG) ===========================

/**
 * Prepares schedule for SFSG API.
 * SFSG expects { schedule_days: [{ day: "Monday", opens_at: 540, closes_at: 1020 }] }.
 * Our DB stores the same format — pass-through.
 * Actual transformation from form inputs (HH:MM) to minutes is handled in buckets-routes save.
 *
 * @param value - Schedule object from MongoDB
 */
export function sanitizeOutgoing(value: any): any {
  if (!value) return { schedule_days: [] };
  return value;
}

// #endregion ------------------------------------------------------------------
