import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

// #region ===================== CONSTRAINTS ====================================

export const constraints = {
  required: true,
};

// #endregion ------------------------------------------------------------------

// #region ===================== CONTROLLER ====================================

/**
 * Validates and sanitizes an organization or service name from a spreadsheet.
 * Required field — empty value is invalid. Converts to Title Case.
 */
export function sanitizeIncoming(value: any): SanitizeResult {
  const cleaned = sanitizeValue(value);
  const errors = validate(cleaned);
  if (errors.length) return { valid: false, value: cleaned, errors };
  return { valid: true, value: toTitleCase(cleaned), errors: [] };
}

/**
 * Sanitizes a name imported from the SFSG API.
 * Trusts SFSG casing — just trims.
 */
export function sanitizeIncomingFromSFSG(value: any): string {
  return sanitizeValue(value);
}

/**
 * Prepares a name for the SFSG API.
 * Trims and applies Title Case in case of manually entered unsanitized data.
 */
export function sanitizeOutgoing(value: string): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  return toTitleCase(trimmed);
}

// #endregion ------------------------------------------------------------------

// #region ===================== VALIDATORS ====================================

/**
 * Validates a name value. Returns array of error messages (empty if valid).
 */
function validate(value: string): string[] {
  const errors: string[] = [];
  if (!value) errors.push('Name is required');
  return errors;
}

// #endregion ------------------------------------------------------------------

// #region ===================== SANITIZERS =====================================

/**
 * Converts a string to Title Case.
 */
function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// #endregion ------------------------------------------------------------------
