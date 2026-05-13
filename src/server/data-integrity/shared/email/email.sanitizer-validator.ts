// #region ===================== IMPORTS =======================================
import { extendedConsole as console } from '../../../../streams/consoles/customConsoles';
import { log } from '../../../../utils/logger/logger-setup/logger-wrapper';
import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';
// #endregion ------------------------------------------------------------------

console.enter();

// #region ===================== CONSTRAINTS ====================================

export const constraints = {
  required: false,
  pattern: /^[^\s@]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
};

// #endregion ------------------------------------------------------------------

// #region ===================== CONTROLLER ====================================

// -----------------------------------------------------------------------------
/**
 * Validates and sanitizes an email from a spreadsheet.
 * Trims, lowercases, validates format. Clears "none"/"N/A".
 */
export function emailSanitizeValidateIncomingFromSpreadsheet(value: any): SanitizeResult {
  log.enter("emailSanitizeValidateIncomingFromSpreadsheet()", log.brack);
  const cleaned = toLowerTrimmed(sanitizeValue(value));
  if (!cleaned) { log.retrn("emailSanitizeValidateIncomingFromSpreadsheet()", log.kcarb); return { valid: true, value: '', errors: [] }; }
  if (isNonValue(cleaned)) { log.retrn("emailSanitizeValidateIncomingFromSpreadsheet()", log.kcarb); return { valid: true, value: '', errors: [] }; }
  const errors = validate(cleaned);
  if (errors.length) { log.retrn("emailSanitizeValidateIncomingFromSpreadsheet()", log.kcarb); return { valid: false, value: cleaned, errors }; }
  log.retrn("emailSanitizeValidateIncomingFromSpreadsheet()", log.kcarb);
  return { valid: true, value: cleaned, errors: [] };
}

// -----------------------------------------------------------------------------
/**
 * Sanitizes an email imported from the SFSG API.
 * Trusts SFSG as-is — no modification.
 */
export function emailSanitizeValidateIncomingFromSFSG(value: any): string {
  log.enter("emailSanitizeValidateIncomingFromSFSG()", log.brack);
  log.retrn("emailSanitizeValidateIncomingFromSFSG()", log.kcarb);
  if (value === null || value === undefined) return '';
  return String(value);
}

// -----------------------------------------------------------------------------
/**
 * Prepares email for SFSG API. Trims and lowercases.
 */
export function emailSanitizeValidateOutgoingToSFSG(value: string): string {
  log.enter("emailSanitizeValidateOutgoingToSFSG()", log.brack);
  if (!value) { log.retrn("emailSanitizeValidateOutgoingToSFSG()", log.kcarb); return ''; }
  log.retrn("emailSanitizeValidateOutgoingToSFSG()", log.kcarb);
  return toLowerTrimmed(value);
}

// #endregion ------------------------------------------------------------------

// #region ===================== VALIDATORS ====================================

// -----------------------------------------------------------------------------
/**
 * Validates an email against the pattern.
 */
function validate(value: string): string[] {
  const errors: string[] = [];
  if (!constraints.pattern.test(value)) errors.push(`Invalid email: "${value}" does not match email format`);
  return errors;
}

// -----------------------------------------------------------------------------
/**
 * Checks if value is a non-email placeholder.
 */
function isNonValue(value: string): boolean {
  return ['none', 'n/a', 'na', '-', 'tbd', 'unknown'].includes(value);
}

// #endregion ------------------------------------------------------------------

// #region ===================== SANITIZERS =====================================

// -----------------------------------------------------------------------------
/**
 * Trims and lowercases a string.
 */
function toLowerTrimmed(value: string): string {
  return value.trim().toLowerCase();
}

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
