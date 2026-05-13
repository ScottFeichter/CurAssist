import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

// #region ===================== CONSTRAINTS ====================================

export const constraints = { required: false };

// #endregion ------------------------------------------------------------------

// #region ===================== CONTROLLER ====================================

export function sanitizeIncoming(value: any): SanitizeResult {
  const cleaned = sanitizeValue(value);
  if (!cleaned) return { valid: true, value: '', errors: [] };
  const errors = validate(cleaned);
  if (errors.length) return { valid: false, value: cleaned, errors };
  return { valid: true, value: toTitleCase(cleaned), errors: [] };
}

export function sanitizeIncomingFromSFSG(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

export function sanitizeOutgoing(value: string): string {
  if (!value) return '';
  return toTitleCase(value.trim());
}

// #endregion ------------------------------------------------------------------

// #region ===================== VALIDATORS ====================================

function validate(value: string): string[] {
  return [];
}

// #endregion ------------------------------------------------------------------

// #region ===================== SANITIZERS =====================================

function toTitleCase(value: string): string {
  return value.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// #endregion ------------------------------------------------------------------
