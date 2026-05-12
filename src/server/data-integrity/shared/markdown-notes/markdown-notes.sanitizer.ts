import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

// #region ===================== CONSTRAINTS ====================================

export const constraints = {
  required: false,
  maxLength: 3000,
};

// #endregion ------------------------------------------------------------------

// #region ===================== HELPERS ========================================

/**
 * Normalizes line breaks — converts \r\n and \r to \n, collapses 3+ newlines to 2.
 */
function normalizeLineBreaks(value: string): string {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n');
}

// #endregion ------------------------------------------------------------------

// #region ===================== INCOMING (Spreadsheet → DB) ====================

/**
 * Validates and sanitizes markdown notes from a spreadsheet.
 * Normalizes line breaks and trims. Does NOT strip HTML (markdown may contain it intentionally).
 * Optional — empty is valid. Rejects if over 3000 characters.
 * Unlikely to appear in spreadsheets but handled for completeness.
 *
 * @param value - Raw cell value from spreadsheet
 */
export function sanitizeIncoming(value: any): SanitizeResult {
  const raw = sanitizeValue(value);
  if (!raw) return { valid: true, value: '', errors: [] };

  const cleaned = normalizeLineBreaks(raw).trim();

  if (cleaned.length > constraints.maxLength) {
    return { valid: false, value: cleaned, errors: [`Markdown notes exceeds ${constraints.maxLength} character limit (${cleaned.length} characters)`] };
  }

  return { valid: true, value: cleaned, errors: [] };
}

// #endregion ------------------------------------------------------------------

// #region ===================== INCOMING FROM SFSG (SFSG → DB) =================

/**
 * Sanitizes markdown notes imported from the SFSG API.
 * Trusts SFSG as-is — no modification.
 *
 * @param value - Note text from SFSG API response
 */
export function sanitizeIncomingFromSFSG(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

// #endregion ------------------------------------------------------------------

// #region ===================== OUTGOING (DB → SFSG) ===========================

/**
 * Prepares markdown notes for SFSG API.
 * SFSG expects plain text in notes[].note — strips HTML tags, normalizes line breaks, trims.
 *
 * @param value - Note text from MongoDB
 */
export function sanitizeOutgoing(value: string): string {
  if (!value) return '';
  let cleaned = value.replace(/<[^>]*>/g, '');
  cleaned = normalizeLineBreaks(cleaned);
  return cleaned.trim();
}

// #endregion ------------------------------------------------------------------
