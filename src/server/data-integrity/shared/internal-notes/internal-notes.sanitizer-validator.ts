// #region ===================== IMPORTS =======================================
import { extendedConsole as console } from '../../../../streams/consoles/customConsoles';
import { log } from '../../../../utils/logger/logger-setup/logger-wrapper';
import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';
// #endregion ------------------------------------------------------------------

console.enter();

// #region ===================== CONSTRAINTS ====================================

export const constraints = { required: false, maxLength: 3000 };

// #endregion ------------------------------------------------------------------

// #region ===================== CONTROLLER ====================================

// -----------------------------------------------------------------------------
export function internalNotesSanitizeValidateIncomingFromSpreadsheet(value: any): SanitizeResult {
  log.enter("internalNotesSanitizeValidateIncomingFromSpreadsheet()", log.brack);
  const cleaned = sanitizeValue(value);
  if (!cleaned) { log.retrn("internalNotesSanitizeValidateIncomingFromSpreadsheet()", log.kcarb); return { valid: true, value: '', errors: [] }; }
  const sanitized = cleanText(cleaned);
  const errors = validate(sanitized);
  if (errors.length) { log.retrn("internalNotesSanitizeValidateIncomingFromSpreadsheet()", log.kcarb); return { valid: false, value: sanitized, errors }; }
  log.retrn("internalNotesSanitizeValidateIncomingFromSpreadsheet()", log.kcarb);
  return { valid: true, value: sanitized, errors: [] };
}

// -----------------------------------------------------------------------------
export function internalNotesSanitizeValidateIncomingFromSFSG(value: any): string {
  log.enter("internalNotesSanitizeValidateIncomingFromSFSG()", log.brack);
  log.retrn("internalNotesSanitizeValidateIncomingFromSFSG()", log.kcarb);
  if (value === null || value === undefined) return '';
  return String(value);
}

// -----------------------------------------------------------------------------
export function internalNotesSanitizeValidateOutgoingToSFSG(value: string): string {
  log.enter("internalNotesSanitizeValidateOutgoingToSFSG()", log.brack);
  if (!value) { log.retrn("internalNotesSanitizeValidateOutgoingToSFSG()", log.kcarb); return ''; }
  log.retrn("internalNotesSanitizeValidateOutgoingToSFSG()", log.kcarb);
  return cleanText(value);
}

// #endregion ------------------------------------------------------------------

// #region ===================== VALIDATORS ====================================

// -----------------------------------------------------------------------------
function validate(value: string): string[] {
  const errors: string[] = [];
  if (value.length > constraints.maxLength) errors.push(`Internal notes exceeds ${constraints.maxLength} character limit (${value.length} characters)`);
  return errors;
}

// #endregion ------------------------------------------------------------------

// #region ===================== SANITIZERS =====================================

// -----------------------------------------------------------------------------
function stripHtml(value: string): string { return value.replace(/<[^>]*>/g, ''); }

// -----------------------------------------------------------------------------
function normalizeLineBreaks(value: string): string { return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n{3,}/g, '\n\n'); }

// -----------------------------------------------------------------------------
function cleanText(value: string): string { return stripHtml(normalizeLineBreaks(value)).trim(); }

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
