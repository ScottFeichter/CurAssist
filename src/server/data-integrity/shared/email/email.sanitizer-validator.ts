import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

// #region ===================== CONSTRAINTS ====================================

export const constraints = {
  required: false,
  pattern: /^[^\s@]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
};

// #endregion ------------------------------------------------------------------

// #region ===================== CONTROLLER ====================================

/**
 * Validates and sanitizes an email from a spreadsheet.
 * Trims, lowercases, validates format. Clears "none"/"N/A".
 */
export function sanitizeIncoming(value: any): SanitizeResult {
  const cleaned = toLowerTrimmed(sanitizeValue(value));
  if (!cleaned) return { valid: true, value: '', errors: [] };
  if (isNonValue(cleaned)) return { valid: true, value: '', errors: [] };

  const errors = validate(cleaned);
  if (errors.length) return { valid: false, value: cleaned, errors };
  return { valid: true, value: cleaned, errors: [] };
}

/**
 * Sanitizes an email imported from the SFSG API.
 * Trusts SFSG as-is — no modification.
 */
export function sanitizeIncomingFromSFSG(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

/**
 * Prepares email for SFSG API.
 * Trims and lowercases.
 */
export function sanitizeOutgoing(value: string): string {
  if (!value) return '';
  return toLowerTrimmed(value);
}

// #endregion ------------------------------------------------------------------

// #region ===================== VALIDATORS ====================================

/**
 * Validates an email against the pattern.
 */
function validate(value: string): string[] {
  const errors: string[] = [];
  if (!constraints.pattern.test(value)) {
    errors.push(`Invalid email: "${value}" does not match email format`);
  }
  return errors;
}

/**
 * Checks if value is a non-email placeholder.
 */
function isNonValue(value: string): boolean {
  return ['none', 'n/a', 'na', '-', 'tbd', 'unknown'].includes(value);
}

// #endregion ------------------------------------------------------------------

// #region ===================== SANITIZERS =====================================

/**
 * Trims and lowercases a string.
 */
function toLowerTrimmed(value: string): string {
  return value.trim().toLowerCase();
}

// #endregion ------------------------------------------------------------------
