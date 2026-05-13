import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

// #region ===================== CONSTRAINTS ====================================

export const constraints = {
  required: false,
  maxLength: 1000,
};

// #endregion ------------------------------------------------------------------

// #region ===================== HELPERS ========================================

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '');
}

// #endregion ------------------------------------------------------------------

// #region ===================== INCOMING (Spreadsheet → DB) ====================

/**
 * Sanitizes service cost/fee from a spreadsheet.
 * Strips HTML tags and trims. Rejects if over 1000 characters.
 *
 * @param value - Raw cell value from spreadsheet
 */
export function sanitizeIncoming(value: any): SanitizeResult {
  const raw = sanitizeValue(value);
  if (!raw) return { valid: true, value: '', errors: [] };

  const cleaned = stripHtml(raw).trim();

  if (cleaned.length > constraints.maxLength) {
    return { valid: false, value: cleaned, errors: [`Cost exceeds ${constraints.maxLength} character limit (${cleaned.length} characters)`] };
  }

  return { valid: true, value: cleaned, errors: [] };
}

// #endregion ------------------------------------------------------------------

// #region ===================== INCOMING FROM SFSG (SFSG → DB) =================

/**
 * Sanitizes cost/fee imported from the SFSG API.
 * Trusts SFSG as-is — no modification.
 *
 * @param value - Fee from SFSG API response
 */
export function sanitizeIncomingFromSFSG(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

// #endregion ------------------------------------------------------------------

// #region ===================== OUTGOING (DB → SFSG) ===========================

/**
 * Prepares cost/fee for SFSG API.
 * Strips HTML and trims. SFSG expects plain text.
 *
 * @param value - Fee from MongoDB
 */
export function sanitizeOutgoing(value: string): string {
  if (!value) return '';
  return stripHtml(value).trim();
}

// #endregion ------------------------------------------------------------------
