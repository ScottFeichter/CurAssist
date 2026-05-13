// #region ===================== IMPORTS =======================================
import { extendedConsole as console } from '../../../../streams/consoles/customConsoles';
import { log } from '../../../../utils/logger/logger-setup/logger-wrapper';
import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';
// #endregion ------------------------------------------------------------------

console.enter();

// #region ===================== CONSTRAINTS ====================================

export const constraints = { required: false };

// #endregion ------------------------------------------------------------------

// #region ===================== CONTROLLER ====================================

// -----------------------------------------------------------------------------
export function phoneNumberSanitizeValidateIncomingFromSpreadsheet(value: any): SanitizeResult {
  log.enter("phoneNumberSanitizeValidateIncomingFromSpreadsheet()", log.brack);
  const cleaned = sanitizeValue(value);
  if (!cleaned) { log.retrn("phoneNumberSanitizeValidateIncomingFromSpreadsheet()", log.kcarb); return { valid: true, value: '', errors: [] }; }
  const digits = stripNonDigits(cleaned);
  const errors = validate(digits, cleaned);
  if (errors.length) { log.retrn("phoneNumberSanitizeValidateIncomingFromSpreadsheet()", log.kcarb); return { valid: false, value: cleaned, errors }; }
  log.retrn("phoneNumberSanitizeValidateIncomingFromSpreadsheet()", log.kcarb);
  return { valid: true, value: digits, errors: [] };
}

// -----------------------------------------------------------------------------
export function phoneNumberSanitizeValidateIncomingFromSFSG(value: any): string {
  log.enter("phoneNumberSanitizeValidateIncomingFromSFSG()", log.brack);
  log.retrn("phoneNumberSanitizeValidateIncomingFromSFSG()", log.kcarb);
  if (value === null || value === undefined) return '';
  return stripNonDigits(String(value));
}

// -----------------------------------------------------------------------------
export function phoneNumberSanitizeValidateOutgoingToSFSG(value: string): string {
  log.enter("phoneNumberSanitizeValidateOutgoingToSFSG()", log.brack);
  if (!value) { log.retrn("phoneNumberSanitizeValidateOutgoingToSFSG()", log.kcarb); return ''; }
  log.retrn("phoneNumberSanitizeValidateOutgoingToSFSG()", log.kcarb);
  return stripNonDigits(value);
}

// #endregion ------------------------------------------------------------------

// #region ===================== VALIDATORS ====================================

// -----------------------------------------------------------------------------
function validate(digits: string, original: string): string[] {
  const errors: string[] = [];
  if (digits.length !== 10) errors.push(`Invalid phone: "${original}" must be 10 digits (got ${digits.length})`);
  return errors;
}

// #endregion ------------------------------------------------------------------

// #region ===================== SANITIZERS =====================================

// -----------------------------------------------------------------------------
function stripNonDigits(value: string): string { return value.replace(/\D/g, ''); }

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
