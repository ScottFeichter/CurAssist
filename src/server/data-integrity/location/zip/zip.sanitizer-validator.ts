// #region ===================== IMPORTS =======================================
import { extendedConsole as console } from '../../../../streams/consoles/customConsoles';
import { log } from '../../../../utils/logger/logger-setup/logger-wrapper';
import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';
// #endregion ------------------------------------------------------------------

console.enter();

// #region ===================== CONSTRAINTS ====================================

export const constraints = { required: false, pattern: /^\d{5}$/ };

// #endregion ------------------------------------------------------------------

// #region ===================== CONTROLLER ====================================

// -----------------------------------------------------------------------------
export function zipSanitizeValidateIncomingFromSpreadsheet(value: any): SanitizeResult {
  log.enter("zipSanitizeValidateIncomingFromSpreadsheet()", log.brack);
  const cleaned = sanitizeValue(value);
  if (!cleaned) { log.retrn("zipSanitizeValidateIncomingFromSpreadsheet()", log.kcarb); return { valid: true, value: '', errors: [] }; }
  const fiveDigit = stripSuffix(cleaned);
  const errors = validate(fiveDigit, cleaned);
  if (errors.length) { log.retrn("zipSanitizeValidateIncomingFromSpreadsheet()", log.kcarb); return { valid: false, value: cleaned, errors }; }
  log.retrn("zipSanitizeValidateIncomingFromSpreadsheet()", log.kcarb);
  return { valid: true, value: fiveDigit, errors: [] };
}

// -----------------------------------------------------------------------------
export function zipSanitizeValidateIncomingFromSFSG(value: any): string {
  log.enter("zipSanitizeValidateIncomingFromSFSG()", log.brack);
  log.retrn("zipSanitizeValidateIncomingFromSFSG()", log.kcarb);
  if (value === null || value === undefined) return '';
  return String(value);
}

// -----------------------------------------------------------------------------
export function zipSanitizeValidateOutgoingToSFSG(value: string): string {
  log.enter("zipSanitizeValidateOutgoingToSFSG()", log.brack);
  if (!value) { log.retrn("zipSanitizeValidateOutgoingToSFSG()", log.kcarb); return ''; }
  log.retrn("zipSanitizeValidateOutgoingToSFSG()", log.kcarb);
  return value.trim();
}

// #endregion ------------------------------------------------------------------

// #region ===================== VALIDATORS ====================================

// -----------------------------------------------------------------------------
function validate(fiveDigit: string, original: string): string[] {
  const errors: string[] = [];
  if (!constraints.pattern.test(fiveDigit)) errors.push(`Invalid zip: "${original}" must be 5 digits (with optional -XXXX suffix)`);
  return errors;
}

// #endregion ------------------------------------------------------------------

// #region ===================== SANITIZERS =====================================

// -----------------------------------------------------------------------------
function stripSuffix(value: string): string { return value.split('-')[0].trim(); }

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
