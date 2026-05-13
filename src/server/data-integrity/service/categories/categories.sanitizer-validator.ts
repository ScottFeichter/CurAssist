import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

// #region ===================== CONSTRAINTS ====================================

export const constraints = { required: false };

// #endregion ------------------------------------------------------------------

// #region ===================== CONTROLLER ====================================

/**
 * Splits comma-separated string into a flat array.
 */
export function sanitizeIncoming(value: any): SanitizeResult {
  const cleaned = sanitizeValue(value);
  if (!cleaned) return { valid: true, value: [], errors: [] };
  const items = splitCommaList(cleaned);
  const errors = validate(items);
  if (errors.length) return { valid: false, value: items, errors };
  return { valid: true, value: items, errors: [] };
}

/**
 * Extracts names from SFSG category objects.
 */
export function sanitizeIncomingFromSFSG(value: any): string[] {
  if (!value || !Array.isArray(value)) return [];
  return value.map((item: any) => typeof item === 'string' ? item : item?.name).filter(Boolean);
}

/**
 * Returns flat array as-is — transform layer handles SFSG object conversion.
 */
export function sanitizeOutgoing(value: string[]): string[] {
  return value || [];
}

// #endregion ------------------------------------------------------------------

// #region ===================== VALIDATORS ====================================

function validate(items: string[]): string[] {
  return [];
}

// #endregion ------------------------------------------------------------------

// #region ===================== SANITIZERS =====================================

function splitCommaList(value: string): string[] {
  return value.split(',').map(item => item.trim()).filter(item => item);
}

// #endregion ------------------------------------------------------------------
