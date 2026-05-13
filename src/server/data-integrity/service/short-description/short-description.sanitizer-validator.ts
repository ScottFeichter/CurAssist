// #region ===================== IMPORTS =======================================
import { extendedConsole as console } from '../../../../streams/consoles/customConsoles';
import { log } from '../../../../utils/logger/logger-setup/logger-wrapper';
import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';
// #endregion ------------------------------------------------------------------

console.enter();

// #region ===================== CONSTRAINTS ====================================

export const constraints = { required: false, maxLength: 1000 };

// #endregion ------------------------------------------------------------------

// #region ===================== CONTROLLER ====================================

// -----------------------------------------------------------------------------
export function shortDescriptionSanitizeValidateIncomingFromSpreadsheet(value: any): SanitizeResult {
  log.enter("shortDescriptionSanitizeValidateIncomingFromSpreadsheet()", log.brack);
  const cleaned = sanitizeValue(value);
  if (!cleaned) { log.retrn("shortDescriptionSanitizeValidateIncomingFromSpreadsheet()", log.kcarb); return { valid: true, value: '', errors: [] }; }
  const sanitized = stripHtml(cleaned).trim();
  const errors = validate(sanitized);
  if (errors.length) { log.retrn("shortDescriptionSanitizeValidateIncomingFromSpreadsheet()", log.kcarb); return { valid: false, value: sanitized, errors }; }
  log.retrn("shortDescriptionSanitizeValidateIncomingFromSpreadsheet()", log.kcarb);
  return { valid: true, value: sanitized, errors: [] };
}

// -----------------------------------------------------------------------------
export function shortDescriptionSanitizeValidateIncomingFromSFSG(value: any): string {
  log.enter("shortDescriptionSanitizeValidateIncomingFromSFSG()", log.brack);
  log.retrn("shortDescriptionSanitizeValidateIncomingFromSFSG()", log.kcarb);
  if (value === null || value === undefined) return '';
  return String(value);
}

// -----------------------------------------------------------------------------
export function shortDescriptionSanitizeValidateOutgoingToSFSG(value: string): string {
  log.enter("shortDescriptionSanitizeValidateOutgoingToSFSG()", log.brack);
  if (!value) { log.retrn("shortDescriptionSanitizeValidateOutgoingToSFSG()", log.kcarb); return ''; }
  log.retrn("shortDescriptionSanitizeValidateOutgoingToSFSG()", log.kcarb);
  return stripHtml(value).trim();
}

// #endregion ------------------------------------------------------------------

// #region ===================== VALIDATORS ====================================

// -----------------------------------------------------------------------------
function validate(value: string): string[] {
  const errors: string[] = [];
  if (value.length > constraints.maxLength) errors.push(`Short description exceeds ${constraints.maxLength} character limit (${value.length} characters)`);
  return errors;
}

// #endregion ------------------------------------------------------------------

// #region ===================== SANITIZERS =====================================

// -----------------------------------------------------------------------------
function stripHtml(value: string): string { return value.replace(/<[^>]*>/g, ''); }

// -----------------------------------------------------------------------------
function normalizeLineBreaks(value: string): string { return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n{3,}/g, '\n\n'); }

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
