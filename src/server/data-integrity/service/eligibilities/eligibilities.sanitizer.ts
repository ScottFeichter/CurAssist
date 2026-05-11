import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

export const constraints = { required: false };

/**
 * Sanitizes service eligibilities. Splits comma-separated string into array.
 * @param value - Raw cell value from spreadsheet (e.g. "Adults, Seniors")
 */
export function sanitizeIncoming(value: any): SanitizeResult {
  const cleaned = sanitizeValue(value);
  if (!cleaned) return { valid: true, value: [], errors: [] };

  const items = cleaned.split(',').map(item => item.trim()).filter(item => item);
  return { valid: true, value: items, errors: [] };
}

/**
 * Prepares eligibilities for SFSG API.
 * SFSG expects an array of objects: [{ name, id, feature_rank }].
 * This is handled by transformOrgToSFPayload — outgoing here just passes through.
 * @param value - Eligibilities array from MongoDB
 */
export function sanitizeOutgoing(value: string[]): string[] {
  return value || [];
}
