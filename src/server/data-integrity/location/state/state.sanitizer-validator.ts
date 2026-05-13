// #region ===================== IMPORTS =======================================
import { extendedConsole as console } from '../../../../streams/consoles/customConsoles';
import { log } from '../../../../utils/logger/logger-setup/logger-wrapper';
import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';
// #endregion ------------------------------------------------------------------

console.enter();

// #region ===================== CONSTRAINTS ====================================

export const constraints = { required: false };

const stateNameToCode: Record<string, string> = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
  'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
  'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
  'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
  'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
  'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
  'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
  'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
  'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
  'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
  'wisconsin': 'WI', 'wyoming': 'WY',
  'district of columbia': 'DC', 'puerto rico': 'PR', 'guam': 'GU',
  'american samoa': 'AS', 'u.s. virgin islands': 'VI', 'northern mariana islands': 'MP',
};

const validStateCodes = new Set(Object.values(stateNameToCode));

// #endregion ------------------------------------------------------------------

// #region ===================== CONTROLLER ====================================

// -----------------------------------------------------------------------------
/**
 * Validates and sanitizes a state from a spreadsheet.
 * Accepts 2-letter codes or full names. Converts to uppercase 2-letter code.
 */
export function stateSanitizeValidateIncomingFromSpreadsheet(value: any): SanitizeResult {
  log.enter("stateSanitizeValidateIncomingFromSpreadsheet()", log.brack);
  const cleaned = sanitizeValue(value);
  if (!cleaned) { log.retrn("stateSanitizeValidateIncomingFromSpreadsheet()", log.kcarb); return { valid: true, value: '', errors: [] }; }
  const resolved = resolveState(cleaned);
  if (!resolved) {
    const errors = validate(cleaned);
    log.retrn("stateSanitizeValidateIncomingFromSpreadsheet()", log.kcarb);
    return { valid: false, value: cleaned, errors };
  }
  log.retrn("stateSanitizeValidateIncomingFromSpreadsheet()", log.kcarb);
  return { valid: true, value: resolved, errors: [] };
}

// -----------------------------------------------------------------------------
/**
 * Sanitizes a state imported from the SFSG API. Trusts as-is.
 */
export function stateSanitizeValidateIncomingFromSFSG(value: any): string {
  log.enter("stateSanitizeValidateIncomingFromSFSG()", log.brack);
  log.retrn("stateSanitizeValidateIncomingFromSFSG()", log.kcarb);
  if (value === null || value === undefined) return '';
  return String(value);
}

// -----------------------------------------------------------------------------
/**
 * Prepares state for SFSG API. Trims and uppercases.
 */
export function stateSanitizeValidateOutgoingToSFSG(value: string): string {
  log.enter("stateSanitizeValidateOutgoingToSFSG()", log.brack);
  if (!value) { log.retrn("stateSanitizeValidateOutgoingToSFSG()", log.kcarb); return ''; }
  log.retrn("stateSanitizeValidateOutgoingToSFSG()", log.kcarb);
  return value.trim().toUpperCase();
}

// #endregion ------------------------------------------------------------------

// #region ===================== VALIDATORS ====================================

// -----------------------------------------------------------------------------
function validate(value: string): string[] {
  return [`Invalid state: "${value}" is not a recognized US state code or name`];
}

// #endregion ------------------------------------------------------------------

// #region ===================== SANITIZERS =====================================

// -----------------------------------------------------------------------------
function resolveState(value: string): string | null {
  const upper = value.toUpperCase();
  if (upper.length === 2 && validStateCodes.has(upper)) return upper;
  const code = stateNameToCode[value.toLowerCase()];
  return code || null;
}

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
