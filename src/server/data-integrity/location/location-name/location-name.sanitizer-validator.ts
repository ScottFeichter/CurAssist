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
export function locationNameSanitizeValidateIncomingFromSpreadsheet(value: any): SanitizeResult {
  log.enter("locationNameSanitizeValidateIncomingFromSpreadsheet()", log.brack);
  const cleaned = sanitizeValue(value);
  if (!cleaned) { log.retrn("locationNameSanitizeValidateIncomingFromSpreadsheet()", log.kcarb); return { valid: true, value: '', errors: [] }; }
  const errors = validate(cleaned);
  if (errors.length) { log.retrn("locationNameSanitizeValidateIncomingFromSpreadsheet()", log.kcarb); return { valid: false, value: cleaned, errors }; }
  log.retrn("locationNameSanitizeValidateIncomingFromSpreadsheet()", log.kcarb);
  return { valid: true, value: toTitleCase(cleaned), errors: [] };
}

// -----------------------------------------------------------------------------
export function locationNameSanitizeValidateIncomingFromSFSG(value: any): string {
  log.enter("locationNameSanitizeValidateIncomingFromSFSG()", log.brack);
  log.retrn("locationNameSanitizeValidateIncomingFromSFSG()", log.kcarb);
  if (value === null || value === undefined) return '';
  return String(value);
}

// -----------------------------------------------------------------------------
export function locationNameSanitizeValidateOutgoingToSFSG(value: string): string {
  log.enter("locationNameSanitizeValidateOutgoingToSFSG()", log.brack);
  if (!value) { log.retrn("locationNameSanitizeValidateOutgoingToSFSG()", log.kcarb); return ''; }
  log.retrn("locationNameSanitizeValidateOutgoingToSFSG()", log.kcarb);
  return toTitleCase(value.trim());
}

// #endregion ------------------------------------------------------------------

// #region ===================== VALIDATORS ====================================

// -----------------------------------------------------------------------------
function validate(value: string): string[] {
  return [];
}

// #endregion ------------------------------------------------------------------

// #region ===================== SANITIZERS =====================================

// -----------------------------------------------------------------------------
function toTitleCase(value: string): string {
  return value.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
