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
export function phoneNameSanitizeValidateIncomingFromSpreadsheet(value: any): SanitizeResult {
  log.enter("phoneNameSanitizeValidateIncomingFromSpreadsheet()", log.brack);
  const cleaned = sanitizeValue(value);
  const errors = validate(cleaned);
  if (errors.length) { log.retrn("phoneNameSanitizeValidateIncomingFromSpreadsheet()", log.kcarb); return { valid: false, value: cleaned, errors }; }
  log.retrn("phoneNameSanitizeValidateIncomingFromSpreadsheet()", log.kcarb);
  return { valid: true, value: cleaned, errors: [] };
}

// -----------------------------------------------------------------------------
export function phoneNameSanitizeValidateIncomingFromSFSG(value: any): string {
  log.enter("phoneNameSanitizeValidateIncomingFromSFSG()", log.brack);
  log.retrn("phoneNameSanitizeValidateIncomingFromSFSG()", log.kcarb);
  if (value === null || value === undefined) return '';
  return String(value);
}

// -----------------------------------------------------------------------------
/**
 * SFSG requires service_type — defaults to "voice" if empty to prevent 500 error.
 */
export function phoneNameSanitizeValidateOutgoingToSFSG(value: string): string {
  log.enter("phoneNameSanitizeValidateOutgoingToSFSG()", log.brack);
  if (!value) { log.retrn("phoneNameSanitizeValidateOutgoingToSFSG()", log.kcarb); return 'voice'; }
  log.retrn("phoneNameSanitizeValidateOutgoingToSFSG()", log.kcarb);
  return value.trim() || 'voice';
}

// #endregion ------------------------------------------------------------------

// #region ===================== VALIDATORS ====================================

// -----------------------------------------------------------------------------
function validate(value: string): string[] { return []; }

// #endregion ------------------------------------------------------------------

// #region ===================== SANITIZERS =====================================

// No sanitization — phone name is pass-through (SFSG stores mixed case as-entered).

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
