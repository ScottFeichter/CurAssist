import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

// #region ===================== CONSTRAINTS ====================================

export const constraints = { required: false };

// #endregion ------------------------------------------------------------------

// #region ===================== CONTROLLER ====================================

/**
 * Hours from spreadsheets are freeform text (too many formats to parse).
 * Returns the trimmed value — caller should note "See spreadsheet for hours details".
 */
export function sanitizeIncoming(value: any): SanitizeResult {
  const cleaned = sanitizeValue(value);
  const errors = validate(cleaned);
  if (errors.length) return { valid: false, value: cleaned, errors };
  return { valid: true, value: cleaned, errors: [] };
}

/**
 * SFSG returns { schedule_days: [...] } — same format we store. Trust as-is.
 */
export function sanitizeIncomingFromSFSG(value: any): any {
  if (!value) return { schedule_days: [] };
  return value;
}

/**
 * Pass-through — DB already stores in SFSG-compatible format.
 */
export function sanitizeOutgoing(value: any): any {
  if (!value) return { schedule_days: [] };
  return value;
}

// #endregion ------------------------------------------------------------------

// #region ===================== VALIDATORS ====================================

function validate(value: string): string[] {
  return [];
}

// #endregion ------------------------------------------------------------------

// #region ===================== SANITIZERS =====================================

// No sanitization needed — hours are either freeform (spreadsheet) or structured (SFSG/form).

// #endregion ------------------------------------------------------------------
