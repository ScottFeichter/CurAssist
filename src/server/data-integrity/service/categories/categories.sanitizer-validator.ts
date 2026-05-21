// #region ===================== IMPORTS =======================================
import { extendedConsole as console } from '../../../../streams/consoles/customConsoles';
import { log } from '../../../../utils/logger/logger-setup/logger-wrapper';
import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';
import { validCategoryNames } from '../../../helpers/lookup-tables/generated-lookups';
// #endregion ------------------------------------------------------------------

console.enter();

// #region ===================== CONSTRAINTS ====================================

export const constraints = { required: false };

// #endregion ------------------------------------------------------------------

// #region ===================== CONTROLLER ====================================

// -----------------------------------------------------------------------------
export function categoriesSanitizeValidateIncomingFromSpreadsheet(value: any): SanitizeResult {
  log.enter("categoriesSanitizeValidateIncomingFromSpreadsheet()", log.brack);
  const cleaned = sanitizeValue(value);
  if (!cleaned) { log.retrn("categoriesSanitizeValidateIncomingFromSpreadsheet()", log.kcarb); return { valid: true, value: [], errors: [] }; }
  const items = splitCommaList(cleaned);
  const errors = validate(items);
  if (errors.length) { log.retrn("categoriesSanitizeValidateIncomingFromSpreadsheet()", log.kcarb); return { valid: false, value: items, errors }; }
  log.retrn("categoriesSanitizeValidateIncomingFromSpreadsheet()", log.kcarb);
  return { valid: true, value: items, errors: [] };
}

// -----------------------------------------------------------------------------
export function categoriesSanitizeValidateIncomingFromSFSG(value: any): string[] {
  log.enter("categoriesSanitizeValidateIncomingFromSFSG()", log.brack);
  log.retrn("categoriesSanitizeValidateIncomingFromSFSG()", log.kcarb);
  if (!value || !Array.isArray(value)) return [];
  return value.map((item: any) => typeof item === 'string' ? item : item?.name).filter(Boolean);
}

// -----------------------------------------------------------------------------
export function categoriesSanitizeValidateOutgoingToSFSG(value: string[]): string[] {
  log.enter("categoriesSanitizeValidateOutgoingToSFSG()", log.brack);
  log.retrn("categoriesSanitizeValidateOutgoingToSFSG()", log.kcarb);
  return value || [];
}

// #endregion ------------------------------------------------------------------

// #region ===================== VALIDATORS ====================================

// -----------------------------------------------------------------------------
function validate(items: string[]): string[] {
  const invalid = items.filter(name => !validCategoryNames.has(name));
  if (!invalid.length) return [];
  return invalid.map(name => `Unknown category: "${name}"`);
}

// #endregion ------------------------------------------------------------------

// #region ===================== SANITIZERS =====================================

// -----------------------------------------------------------------------------
function splitCommaList(value: string): string[] { return value.split(',').map(item => item.trim()).filter(item => item); }

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
