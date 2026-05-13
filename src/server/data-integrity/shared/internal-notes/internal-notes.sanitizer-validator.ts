import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

// #region ===================== CONSTRAINTS ====================================

export const constraints = { required: false, maxLength: 3000 };

// #endregion ------------------------------------------------------------------

// #region ===================== CONTROLLER ====================================

export function sanitizeIncoming(value: any): SanitizeResult {
  const cleaned = sanitizeValue(value);
  if (!cleaned) return { valid: true, value: '', errors: [] };
  const sanitized = cleanText(cleaned);
  const errors = validate(sanitized);
  if (errors.length) return { valid: false, value: sanitized, errors };
  return { valid: true, value: sanitized, errors: [] };
}

export function sanitizeIncomingFromSFSG(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

export function sanitizeOutgoing(value: string): string {
  if (!value) return '';
  return cleanText(value);
}

// #endregion ------------------------------------------------------------------

// #region ===================== VALIDATORS ====================================

function validate(value: string): string[] {
  const errors: string[] = [];
  if (value.length > constraints.maxLength) {
    errors.push(`Internal notes exceeds ${constraints.maxLength} character limit (${value.length} characters)`);
  }
  return errors;
}

// #endregion ------------------------------------------------------------------

// #region ===================== SANITIZERS =====================================

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '');
}

function normalizeLineBreaks(value: string): string {
  return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n{3,}/g, '\n\n');
}

function cleanText(value: string): string {
  return stripHtml(normalizeLineBreaks(value)).trim();
}

// #endregion ------------------------------------------------------------------
