import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

export const constraints = {
  required: false,
};

/**
 * Sanitizes a phone number. Strips non-digits and formats as XXX-XXX-XXXX if 10 digits.
 * If not 10 digits, keeps the original cleaned value.
 * @param value - Raw cell value from spreadsheet
 */
export function sanitizeIncoming(value: any): SanitizeResult {
  const cleaned = sanitizeValue(value);
  if (!cleaned) return { valid: true, value: '', errors: [] };

  const digits = cleaned.replace(/\D/g, '');
  const formatted = digits.length === 10
    ? `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`
    : cleaned;

  return { valid: true, value: formatted, errors: [] };
}

/**
 * Prepares phone number for SFSG API.
 * SFSG expects digits only (no dashes). Strips formatting.
 * @param value - Value from MongoDB (formatted as XXX-XXX-XXXX)
 */
export function sanitizeOutgoing(value: string): string {
  if (!value) return '';
  return value.replace(/\D/g, '');
}
