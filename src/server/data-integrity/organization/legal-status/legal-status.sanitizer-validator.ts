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
export function legalStatusSanitizeValidateIncomingFromSpreadsheet(value: any): SanitizeResult {
  log.enter("legalStatusSanitizeValidateIncomingFromSpreadsheet()", log.brack);
  const cleaned = sanitizeValue(value);
  const errors = validate(cleaned);
  if (errors.length) { log.retrn("legalStatusSanitizeValidateIncomingFromSpreadsheet()", log.kcarb); return { valid: false, value: cleaned, errors }; }
  log.retrn("legalStatusSanitizeValidateIncomingFromSpreadsheet()", log.kcarb);
  return { valid: true, value: cleaned, errors: [] };
}

// -----------------------------------------------------------------------------
export function legalStatusSanitizeValidateIncomingFromSFSG(value: any): string {
  log.enter("legalStatusSanitizeValidateIncomingFromSFSG()", log.brack);
  log.retrn("legalStatusSanitizeValidateIncomingFromSFSG()", log.kcarb);
  if (value === null || value === undefined) return '';
  return String(value);
}

// -----------------------------------------------------------------------------
export function legalStatusSanitizeValidateOutgoingToSFSG(value: string): string {
  log.enter("legalStatusSanitizeValidateOutgoingToSFSG()", log.brack);
  if (!value) { log.retrn("legalStatusSanitizeValidateOutgoingToSFSG()", log.kcarb); return ''; }
  log.retrn("legalStatusSanitizeValidateOutgoingToSFSG()", log.kcarb);
  return value.trim();
}

// #endregion ------------------------------------------------------------------

// #region ===================== VALIDATORS ====================================

// -----------------------------------------------------------------------------
function validate(value: string): string[] { return []; }

// #endregion ------------------------------------------------------------------

// #region ===================== SANITIZERS =====================================

// No sanitization — legal status is preserved as-entered.

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
