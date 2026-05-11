import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

export const constraints = { required: false };

/**
 * Sanitizes hours/schedule value. Optional, trimmed only.
 * Hours are typically handled as structured objects, not raw strings.
 * This sanitizer handles the rare case of a freeform hours string from a spreadsheet.
 * @param value - Raw cell value from spreadsheet
 */
export function sanitizeIncoming(value: any): SanitizeResult {
  const cleaned = sanitizeValue(value);
  return { valid: true, value: cleaned, errors: [] };
}

/**
 * Prepares hours for SFSG API. Pass-through.
 * Actual schedule transformation is handled in transformOrgToSFPayload.
 * @param value - Value from MongoDB
 */
export function sanitizeOutgoing(value: string): string {
  return value || '';
}
