import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

export const constraints = { required: false };

/**
 * Sanitizes a state/province. Converts to uppercase (e.g. "ca" → "CA").
 * @param value - Raw cell value from spreadsheet
 */
export function sanitizeIncoming(value: any): SanitizeResult {
  const cleaned = sanitizeValue(value);
  if (!cleaned) return { valid: true, value: '', errors: [] };
  return { valid: true, value: cleaned.toUpperCase(), errors: [] };
}

/**
 * Prepares state for SFSG API. Pass-through (already uppercase).
 * @param value - Value from MongoDB
 */
export function sanitizeOutgoing(value: string): string {
  return value || '';
}
