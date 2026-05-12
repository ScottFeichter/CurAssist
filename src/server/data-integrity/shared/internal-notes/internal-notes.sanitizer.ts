import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

// #region ===================== CONSTRAINTS ====================================

export const constraints = {
  required: false,
  maxLength: 3000,
};

// #endregion ------------------------------------------------------------------

// #region ===================== HELPERS ========================================

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '');
}

function normalizeLineBreaks(value: string): string {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n');
}

function cleanText(value: string): string {
  if (!value) return '';
  let cleaned = stripHtml(value);
  cleaned = normalizeLineBreaks(cleaned);
  cleaned = cleaned.trim();
  return cleaned;
}

// #endregion ------------------------------------------------------------------

// #region ===================== INCOMING (Spreadsheet → DB) ====================

/**
 * Validates and sanitizes internal notes from a spreadsheet.
 * Strips HTML tags, normalizes line breaks, trims.
 * Optional — empty is valid. Rejects if over 3000 characters.
 *
 * @param value - Raw cell value from spreadsheet
 */
export function sanitizeIncoming(value: any): SanitizeResult {
  const raw = sanitizeValue(value);
  if (!raw) return { valid: true, value: '', errors: [] };

  const cleaned = cleanText(raw);

  if (cleaned.length > constraints.maxLength) {
    return { valid: false, value: cleaned, errors: [`Internal notes exceeds ${constraints.maxLength} character limit (${cleaned.length} characters)`] };
  }

  return { valid: true, value: cleaned, errors: [] };
}

// #endregion ------------------------------------------------------------------

// #region ===================== INCOMING FROM SFSG (SFSG → DB) =================

/**
 * Sanitizes internal notes imported from the SFSG API.
 * Trusts SFSG as-is — no modification.
 *
 * @param value - Internal note from SFSG API response
 */
export function sanitizeIncomingFromSFSG(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

// #endregion ------------------------------------------------------------------

// #region ===================== OUTGOING (DB → SFSG) ===========================

/**
 * Prepares internal notes for SFSG API.
 * Strips HTML, normalizes line breaks, trims. SFSG expects plain text.
 *
 * @param value - Internal notes value from MongoDB
 */
export function sanitizeOutgoing(value: string): string {
  if (!value) return '';
  return cleanText(value);
}

// #endregion ------------------------------------------------------------------
