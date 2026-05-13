import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

// #region ===================== CONSTRAINTS ====================================

export const constraints = { required: false };

// #endregion ------------------------------------------------------------------

// #region ===================== CONTROLLER ====================================

/**
 * Validates and sanitizes an alternate name (nickname) from a spreadsheet.
 * Trims. If ALL CAPS, converts to Title Case. Otherwise preserves casing.
 */
export function sanitizeIncoming(value: any): SanitizeResult {
  const cleaned = sanitizeValue(value);
  const errors = validate(cleaned);
  if (errors.length) return { valid: false, value: cleaned, errors };
  return { valid: true, value: fixAllCaps(cleaned), errors: [] };
}

/**
 * Sanitizes an alternate name imported from the SFSG API.
 * Trusts SFSG casing — just trims.
 */
export function sanitizeIncomingFromSFSG(value: any): string {
  return sanitizeValue(value);
}

/**
 * Prepares alternate name for SFSG API.
 * Trims. If ALL CAPS, converts to Title Case.
 */
export function sanitizeOutgoing(value: string): string {
  if (!value) return '';
  return fixAllCaps(value.trim());
}

// #endregion ------------------------------------------------------------------

// #region ===================== VALIDATORS ====================================

/**
 * Validates an alternate name. Currently no validation rules (always valid).
 */
function validate(value: string): string[] {
  return [];
}

// #endregion ------------------------------------------------------------------

// #region ===================== SANITIZERS =====================================

/**
 * If the value is ALL CAPS, converts to Title Case. Otherwise leaves as-is.
 */
function fixAllCaps(value: string): string {
  if (!value) return '';
  if (value === value.toUpperCase() && value !== value.toLowerCase()) {
    return value
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  return value;
}

// #endregion ------------------------------------------------------------------
