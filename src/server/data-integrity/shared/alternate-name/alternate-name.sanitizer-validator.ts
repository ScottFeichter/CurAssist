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
/**
 * Validates and sanitizes an alternate name (nickname) from a spreadsheet.
 * Trims. If ALL CAPS, converts to Title Case. Otherwise preserves casing.
 */
export function alternateNameSanitizeValidateIncomingFromSpreadsheet(value: any): SanitizeResult {
  log.enter("alternateNameSanitizeValidateIncomingFromSpreadsheet()", log.brack);
  const cleaned = sanitizeValue(value);
  const errors = validate(cleaned);
  if (errors.length) {
    log.retrn("alternateNameSanitizeValidateIncomingFromSpreadsheet()", log.kcarb);
    return { valid: false, value: cleaned, errors };
  }
  log.retrn("alternateNameSanitizeValidateIncomingFromSpreadsheet()", log.kcarb);
  return { valid: true, value: fixAllCaps(cleaned), errors: [] };
}

// -----------------------------------------------------------------------------
/**
 * Sanitizes an alternate name imported from the SFSG API.
 * Trusts SFSG casing — just trims.
 */
export function alternateNameSanitizeValidateIncomingFromSFSG(value: any): string {
  log.enter("alternateNameSanitizeValidateIncomingFromSFSG()", log.brack);
  log.retrn("alternateNameSanitizeValidateIncomingFromSFSG()", log.kcarb);
  return sanitizeValue(value);
}

// -----------------------------------------------------------------------------
/**
 * Prepares alternate name for SFSG API.
 * Trims. If ALL CAPS, converts to Title Case.
 */
export function alternateNameSanitizeValidateOutgoingToSFSG(value: string): string {
  log.enter("alternateNameSanitizeValidateOutgoingToSFSG()", log.brack);
  if (!value) {
    log.retrn("alternateNameSanitizeValidateOutgoingToSFSG()", log.kcarb);
    return '';
  }
  log.retrn("alternateNameSanitizeValidateOutgoingToSFSG()", log.kcarb);
  return fixAllCaps(value.trim());
}

// #endregion ------------------------------------------------------------------

// #region ===================== VALIDATORS ====================================

// -----------------------------------------------------------------------------
/**
 * Validates an alternate name. Currently no validation rules.
 */
function validate(value: string): string[] {
  return [];
}

// #endregion ------------------------------------------------------------------

// #region ===================== SANITIZERS =====================================

// -----------------------------------------------------------------------------
/**
 * If the value is ALL CAPS, converts to Title Case. Otherwise leaves as-is.
 */
function fixAllCaps(value: string): string {
  if (!value) return '';
  if (value === value.toUpperCase() && value !== value.toLowerCase()) {
    return value.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
  return value;
}

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
