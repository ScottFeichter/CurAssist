import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

// #region ===================== CONSTRAINTS ====================================

export const constraints = {
  required: false,
};

// #endregion ------------------------------------------------------------------

// #region ===================== INCOMING (Spreadsheet → DB) ====================

/**
 * Sanitizes a phone number from a spreadsheet.
 * Strips non-digits, validates exactly 10 digits, stores as digits only.
 * Rejects if not 10 digits after stripping.
 *
 * @param value - Raw cell value from spreadsheet
 */
export function sanitizeIncoming(value: any): SanitizeResult {
  const cleaned = sanitizeValue(value);
  if (!cleaned) return { valid: true, value: '', errors: [] };

  const digits = cleaned.replace(/\D/g, '');

  if (digits.length !== 10) {
    return { valid: false, value: cleaned, errors: [`Invalid phone: "${cleaned}" must be 10 digits (got ${digits.length})`] };
  }

  return { valid: true, value: digits, errors: [] };
}

// #endregion ------------------------------------------------------------------

// #region ===================== INCOMING FROM SFSG (SFSG → DB) =================

/**
 * Sanitizes a phone number imported from the SFSG API.
 * SFSG returns formatted "(415) 766-6092" — strip to digits for consistent storage.
 *
 * @param value - Phone number from SFSG API response
 */
export function sanitizeIncomingFromSFSG(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\D/g, '');
}

// #endregion ------------------------------------------------------------------

// #region ===================== OUTGOING (DB → SFSG) ===========================

/**
 * Prepares phone number for SFSG API.
 * SFSG create endpoint expects digits only: "4157716600".
 * Strips any formatting in case of manually entered data.
 *
 * @param value - Phone number from MongoDB
 */
export function sanitizeOutgoing(value: string): string {
  if (!value) return '';
  return value.replace(/\D/g, '');
}

// #endregion ------------------------------------------------------------------
