// #region ===================== IMPORTS =======================================
import { extendedConsole as console } from '../../../../streams/consoles/customConsoles';
import { log } from '../../../../utils/logger/logger-setup/logger-wrapper';
import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';
// #endregion ------------------------------------------------------------------

console.enter();

// #region ===================== CONSTRAINTS ====================================

export const constraints = {
  required: true,
};

// #endregion ------------------------------------------------------------------

// #region ===================== CONTROLLER ====================================

// -----------------------------------------------------------------------------
/**
 * Validates and sanitizes an organization or service name from a spreadsheet.
 * Required field — empty value is invalid. Converts to Title Case.
 */
export function nameSanitizeValidateIncomingFromSpreadsheet(value: any): SanitizeResult {
  log.enter("nameSanitizeValidateIncomingFromSpreadsheet()", log.brack);
  const cleaned = sanitizeValue(value);
  const errors = validate(cleaned);
  if (errors.length) {
    log.retrn("nameSanitizeValidateIncomingFromSpreadsheet()", log.kcarb);
    return { valid: false, value: cleaned, errors };
  }
  log.retrn("nameSanitizeValidateIncomingFromSpreadsheet()", log.kcarb);
  return { valid: true, value: toTitleCase(cleaned), errors: [] };
}

// -----------------------------------------------------------------------------
/**
 * Sanitizes a name imported from the SFSG API.
 * Trusts SFSG casing — just trims.
 */
export function nameSanitizeValidateIncomingFromSFSG(value: any): string {
  log.enter("nameSanitizeValidateIncomingFromSFSG()", log.brack);
  log.retrn("nameSanitizeValidateIncomingFromSFSG()", log.kcarb);
  return sanitizeValue(value);
}

// -----------------------------------------------------------------------------
/**
 * Prepares a name for the SFSG API.
 * Trims and applies Title Case in case of manually entered unsanitized data.
 */
export function nameSanitizeValidateOutgoingToSFSG(value: string): string {
  log.enter("nameSanitizeValidateOutgoingToSFSG()", log.brack);
  if (!value) {
    log.retrn("nameSanitizeValidateOutgoingToSFSG()", log.kcarb);
    return '';
  }
  const trimmed = value.trim();
  if (!trimmed) {
    log.retrn("nameSanitizeValidateOutgoingToSFSG()", log.kcarb);
    return '';
  }
  log.retrn("nameSanitizeValidateOutgoingToSFSG()", log.kcarb);
  return toTitleCase(trimmed);
}

// #endregion ------------------------------------------------------------------

// #region ===================== VALIDATORS ====================================

// -----------------------------------------------------------------------------
/**
 * Validates a name value. Returns array of error messages (empty if valid).
 */
function validate(value: string): string[] {
  const errors: string[] = [];
  if (!value) errors.push('Name is required');
  return errors;
}

// #endregion ------------------------------------------------------------------

// #region ===================== SANITIZERS =====================================

// -----------------------------------------------------------------------------
/**
 * Converts a string to Title Case.
 */
function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
