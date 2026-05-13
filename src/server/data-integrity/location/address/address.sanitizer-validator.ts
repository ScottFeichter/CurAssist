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
export function addressSanitizeValidateIncomingFromSpreadsheet(value: any): SanitizeResult {
  log.enter("addressSanitizeValidateIncomingFromSpreadsheet()", log.brack);
  const cleaned = sanitizeValue(value);
  if (!cleaned) { log.retrn("addressSanitizeValidateIncomingFromSpreadsheet()", log.kcarb); return { valid: true, value: '', errors: [] }; }
  const errors = validate(cleaned);
  if (errors.length) { log.retrn("addressSanitizeValidateIncomingFromSpreadsheet()", log.kcarb); return { valid: false, value: cleaned, errors }; }
  log.retrn("addressSanitizeValidateIncomingFromSpreadsheet()", log.kcarb);
  return { valid: true, value: toTitleCase(cleaned), errors: [] };
}

// -----------------------------------------------------------------------------
export function addressSanitizeValidateIncomingFromSFSG(value: any): string {
  log.enter("addressSanitizeValidateIncomingFromSFSG()", log.brack);
  log.retrn("addressSanitizeValidateIncomingFromSFSG()", log.kcarb);
  if (value === null || value === undefined) return '';
  return String(value);
}

// -----------------------------------------------------------------------------
export function addressSanitizeValidateOutgoingToSFSG(value: string): string {
  log.enter("addressSanitizeValidateOutgoingToSFSG()", log.brack);
  if (!value) { log.retrn("addressSanitizeValidateOutgoingToSFSG()", log.kcarb); return ''; }
  log.retrn("addressSanitizeValidateOutgoingToSFSG()", log.kcarb);
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
