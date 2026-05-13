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
export function hoursSanitizeValidateIncomingFromSpreadsheet(value: any): SanitizeResult {
  log.enter("hoursSanitizeValidateIncomingFromSpreadsheet()", log.brack);
  const cleaned = sanitizeValue(value);
  const errors = validate(cleaned);
  if (errors.length) { log.retrn("hoursSanitizeValidateIncomingFromSpreadsheet()", log.kcarb); return { valid: false, value: cleaned, errors }; }
  log.retrn("hoursSanitizeValidateIncomingFromSpreadsheet()", log.kcarb);
  return { valid: true, value: cleaned, errors: [] };
}

// -----------------------------------------------------------------------------
export function hoursSanitizeValidateIncomingFromSFSG(value: any): any {
  log.enter("hoursSanitizeValidateIncomingFromSFSG()", log.brack);
  log.retrn("hoursSanitizeValidateIncomingFromSFSG()", log.kcarb);
  if (!value) return { schedule_days: [] };
  return value;
}

// -----------------------------------------------------------------------------
export function hoursSanitizeValidateOutgoingToSFSG(value: any): any {
  log.enter("hoursSanitizeValidateOutgoingToSFSG()", log.brack);
  log.retrn("hoursSanitizeValidateOutgoingToSFSG()", log.kcarb);
  if (!value) return { schedule_days: [] };
  return value;
}

// #endregion ------------------------------------------------------------------

// #region ===================== VALIDATORS ====================================

// -----------------------------------------------------------------------------
function validate(value: string): string[] { return []; }

// #endregion ------------------------------------------------------------------

// #region ===================== SANITIZERS =====================================

// No sanitization — hours are freeform (spreadsheet) or structured (SFSG/form).

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
