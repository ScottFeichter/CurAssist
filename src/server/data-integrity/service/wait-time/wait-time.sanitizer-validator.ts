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
export function waitTimeSanitizeValidateIncomingFromSpreadsheet(value: any): SanitizeResult {
  log.enter("waitTimeSanitizeValidateIncomingFromSpreadsheet()", log.brack);
  const cleaned = sanitizeValue(value);
  if (!cleaned) { log.retrn("waitTimeSanitizeValidateIncomingFromSpreadsheet()", log.kcarb); return { valid: true, value: '', errors: [] }; }
  const sanitized = stripHtml(cleaned).trim();
  const errors = validate(sanitized);
  if (errors.length) { log.retrn("waitTimeSanitizeValidateIncomingFromSpreadsheet()", log.kcarb); return { valid: false, value: sanitized, errors }; }
  log.retrn("waitTimeSanitizeValidateIncomingFromSpreadsheet()", log.kcarb);
  return { valid: true, value: sanitized, errors: [] };
}

// -----------------------------------------------------------------------------
export function waitTimeSanitizeValidateIncomingFromSFSG(value: any): string {
  log.enter("waitTimeSanitizeValidateIncomingFromSFSG()", log.brack);
  log.retrn("waitTimeSanitizeValidateIncomingFromSFSG()", log.kcarb);
  if (value === null || value === undefined) return '';
  return String(value);
}

// -----------------------------------------------------------------------------
export function waitTimeSanitizeValidateOutgoingToSFSG(value: string): string {
  log.enter("waitTimeSanitizeValidateOutgoingToSFSG()", log.brack);
  if (!value) { log.retrn("waitTimeSanitizeValidateOutgoingToSFSG()", log.kcarb); return ''; }
  log.retrn("waitTimeSanitizeValidateOutgoingToSFSG()", log.kcarb);
  return stripHtml(value).trim();
}

// #endregion ------------------------------------------------------------------

// #region ===================== VALIDATORS ====================================

// -----------------------------------------------------------------------------
function validate(value: string): string[] {
  const errors: string[] = [];
  if (value.length > constraints.maxLength) errors.push(`Wait time exceeds ${constraints.maxLength} character limit (${value.length} characters)`);
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
