import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

export const constraints = {
  required: false,
  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

/**
 * Validates and sanitizes an email address. Optional — empty is valid.
 * If provided, must contain @ and a domain with a dot.
 * @param value - Raw cell value from spreadsheet
 */
export function sanitizeIncoming(value: any): SanitizeResult {
  const cleaned = sanitizeValue(value).toLowerCase();

  if (!cleaned) return { valid: true, value: '', errors: [] };

  if (['none', 'n/a', 'na', '-', 'tbd'].includes(cleaned)) {
    return { valid: true, value: '', errors: [] };
  }

  if (!constraints.pattern.test(cleaned)) {
    return { valid: false, value: cleaned, errors: [`Invalid email: "${cleaned}" does not match email format`] };
  }

  return { valid: true, value: cleaned, errors: [] };
}

/**
 * Prepares email for SFSG API. Pass-through (already lowercase and validated).
 * @param value - Value from MongoDB
 */
export function sanitizeOutgoing(value: string): string {
  return value || '';
}
