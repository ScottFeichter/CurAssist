import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

// #region ===================== CONSTRAINTS ====================================

export const constraints = { required: false, pattern: /^\d{5}$/ };

// #endregion ------------------------------------------------------------------

// #region ===================== CONTROLLER ====================================

export function sanitizeIncoming(value: any): SanitizeResult {
  const cleaned = sanitizeValue(value);
  if (!cleaned) return { valid: true, value: '', errors: [] };
  const fiveDigit = stripSuffix(cleaned);
  const errors = validate(fiveDigit, cleaned);
  if (errors.length) return { valid: false, value: cleaned, errors };
  return { valid: true, value: fiveDigit, errors: [] };
}

export function sanitizeIncomingFromSFSG(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

export function sanitizeOutgoing(value: string): string {
  if (!value) return '';
  return value.trim();
}

// #endregion ------------------------------------------------------------------

// #region ===================== VALIDATORS ====================================

function validate(fiveDigit: string, original: string): string[] {
  const errors: string[] = [];
  if (!constraints.pattern.test(fiveDigit)) {
    errors.push(`Invalid zip: "${original}" must be 5 digits (with optional -XXXX suffix)`);
  }
  return errors;
}

// #endregion ------------------------------------------------------------------

// #region ===================== SANITIZERS =====================================

/**
 * Strips the optional -XXXX suffix from a zip code.
 */
function stripSuffix(value: string): string {
  return value.split('-')[0].trim();
}

// #endregion ------------------------------------------------------------------
