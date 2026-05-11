import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

export const constraints = { required: false };

/**
 * Sanitizes a city name. Converts to Title Case.
 * @param value - Raw cell value from spreadsheet
 */
export function sanitizeIncoming(value: any): SanitizeResult {
  const cleaned = sanitizeValue(value);
  if (!cleaned) return { valid: true, value: '', errors: [] };

  const titleCase = cleaned
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return { valid: true, value: titleCase, errors: [] };
}

/**
 * Prepares city for SFSG API. Pass-through (already title-cased).
 * @param value - Value from MongoDB
 */
export function sanitizeOutgoing(value: string): string {
  return value || '';
}
