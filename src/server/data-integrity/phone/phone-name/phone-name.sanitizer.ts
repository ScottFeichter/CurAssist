import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

export const constraints = { required: false };

/**
 * Sanitizes a phone label/name (e.g. "Main", "Fax"). Converts to Sentence case.
 * @param value - Raw cell value from spreadsheet
 */
export function sanitizeIncoming(value: any): SanitizeResult {
  const cleaned = sanitizeValue(value);
  if (!cleaned) return { valid: true, value: '', errors: [] };

  const sentenceCase = cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
  return { valid: true, value: sentenceCase, errors: [] };
}

/**
 * Prepares phone name for SFSG API. Pass-through (already sentence-cased).
 * @param value - Value from MongoDB
 */
export function sanitizeOutgoing(value: string): string {
  return value || '';
}
