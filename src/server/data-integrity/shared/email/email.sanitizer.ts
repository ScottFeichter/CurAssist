import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

// #region ===================== CONSTRAINTS ====================================

export const constraints = {
  required: false,
  /** Requires: something@domain.tld where domain is alphanumeric/dots/hyphens and TLD is 2+ letters */
  pattern: /^[^\s@]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
};

// #endregion ------------------------------------------------------------------

// #region ===================== INCOMING (Spreadsheet → DB) ====================

/**
 * Validates and sanitizes an email address from a spreadsheet.
 * Trims, lowercases, validates format. Clears "none"/"N/A"/etc.
 * Optional — empty is valid. If provided, must match email pattern.
 *
 * @param value - Raw cell value from spreadsheet
 */
export function sanitizeIncoming(value: any): SanitizeResult {
  const cleaned = sanitizeValue(value).toLowerCase();

  if (!cleaned) return { valid: true, value: '', errors: [] };

  if (['none', 'n/a', 'na', '-', 'tbd', 'unknown'].includes(cleaned)) {
    return { valid: true, value: '', errors: [] };
  }

  if (!constraints.pattern.test(cleaned)) {
    return { valid: false, value: cleaned, errors: [`Invalid email: "${cleaned}" does not match email format`] };
  }

  return { valid: true, value: cleaned, errors: [] };
}

// #endregion ------------------------------------------------------------------

// #region ===================== INCOMING FROM SFSG (SFSG → DB) =================

/**
 * Sanitizes an email imported from the SFSG API.
 * Trusts SFSG as-is — no modification.
 *
 * @param value - Email from SFSG API response
 */
export function sanitizeIncomingFromSFSG(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

// #endregion ------------------------------------------------------------------

// #region ===================== OUTGOING (DB → SFSG) ===========================

/**
 * Prepares email for SFSG API.
 * Trims and lowercases in case someone manually entered unsanitized data.
 *
 * @param value - Email value from MongoDB
 */
export function sanitizeOutgoing(value: string): string {
  if (!value) return '';
  return value.trim().toLowerCase();
}

// #endregion ------------------------------------------------------------------
