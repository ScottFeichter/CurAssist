import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

// #region ===================== CONSTRAINTS ====================================

export const constraints = { required: false };

// #endregion ------------------------------------------------------------------

// #region ===================== CONTROLLER ====================================

export function sanitizeIncoming(value: any): SanitizeResult {
  const cleaned = sanitizeValue(value);
  if (!cleaned) return { valid: true, value: '', errors: [] };
  const digits = stripNonDigits(cleaned);
  const errors = validate(digits, cleaned);
  if (errors.length) return { valid: false, value: cleaned, errors };
  return { valid: true, value: digits, errors: [] };
}

export function sanitizeIncomingFromSFSG(value: any): string {
  if (value === null || value === undefined) return '';
  return stripNonDigits(String(value));
}

export function sanitizeOutgoing(value: string): string {
  if (!value) return '';
  return stripNonDigits(value);
}

// #endregion ------------------------------------------------------------------

// #region ===================== VALIDATORS ====================================

function validate(digits: string, original: string): string[] {
  const errors: string[] = [];
  if (digits.length !== 10) {
    errors.push(`Invalid phone: "${original}" must be 10 digits (got ${digits.length})`);
  }
  return errors;
}

// #endregion ------------------------------------------------------------------

// #region ===================== SANITIZERS =====================================

function stripNonDigits(value: string): string {
  return value.replace(/\D/g, '');
}

// #endregion ------------------------------------------------------------------
