import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

// #region ===================== CONSTRAINTS ====================================

export const constraints = {
  required: false,
  maxLength: 3000,
};

// #endregion ------------------------------------------------------------------

// #region ===================== HELPERS ========================================

/**
 * Strips HTML tags from a string.
 */
function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '');
}

/**
 * Normalizes line breaks — converts \r\n and \r to \n, collapses 3+ newlines to 2.
 */
function normalizeLineBreaks(value: string): string {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n');
}

/**
 * Cleans a description value: strip HTML, normalize line breaks, trim.
 */
function cleanDescription(value: string): string {
  if (!value) return '';
  let cleaned = stripHtml(value);
  cleaned = normalizeLineBreaks(cleaned);
  cleaned = cleaned.trim();
  return cleaned;
}

// #endregion ------------------------------------------------------------------

// #region ===================== INCOMING (Spreadsheet → DB) ====================

/**
 * Validates and sanitizes a description from a spreadsheet.
 * Strips HTML tags, normalizes line breaks, trims.
 * Optional — empty is valid. Rejects if over 3000 characters after cleaning.
 *
 * @param value - Raw cell value from spreadsheet
 */
export function sanitizeIncoming(value: any): SanitizeResult {
  const raw = sanitizeValue(value);
  if (!raw) return { valid: true, value: '', errors: [] };

  const cleaned = cleanDescription(raw);

  if (cleaned.length > constraints.maxLength) {
    return { valid: false, value: cleaned, errors: [`Description exceeds ${constraints.maxLength} character limit (${cleaned.length} characters)`] };
  }

  return { valid: true, value: cleaned, errors: [] };
}

// #endregion ------------------------------------------------------------------

// #region ===================== INCOMING FROM SFSG (SFSG → DB) =================

/**
 * Sanitizes a description imported from the SFSG API.
 * Trusts SFSG as-is — no modification.
 *
 * @param value - Description from SFSG API response
 */
export function sanitizeIncomingFromSFSG(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

// #endregion ------------------------------------------------------------------

// #region ===================== OUTGOING (DB → SFSG) ===========================

/**
 * Prepares description for SFSG API.
 * Strips HTML, normalizes line breaks, trims.
 * SFSG expects plain text (no HTML).
 *
 * @param value - Description value from MongoDB
 */
export function sanitizeOutgoing(value: string): string {
  if (!value) return '';
  return cleanDescription(value);
}

// #endregion ------------------------------------------------------------------
