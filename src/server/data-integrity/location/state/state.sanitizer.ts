import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

// #region ===================== CONSTRAINTS ====================================

export const constraints = { required: false };

/** Map of full state names to 2-letter codes */
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

/** Set of valid 2-letter state codes */
const validStateCodes = new Set(Object.values(stateNameToCode));

// #endregion ------------------------------------------------------------------

// #region ===================== INCOMING (Spreadsheet → DB) ====================

/**
 * Sanitizes a state/province from a spreadsheet.
 * Accepts 2-letter codes (any case) or full state names. Converts to uppercase 2-letter code.
 * Rejects if not a recognized state.
 *
 * @param value - Raw cell value from spreadsheet
 */
export function sanitizeIncoming(value: any): SanitizeResult {
  const cleaned = sanitizeValue(value);
  if (!cleaned) return { valid: true, value: '', errors: [] };

  const upper = cleaned.toUpperCase();

  // Check if it's already a valid 2-letter code
  if (upper.length === 2 && validStateCodes.has(upper)) {
    return { valid: true, value: upper, errors: [] };
  }

  // Check if it's a full state name
  const code = stateNameToCode[cleaned.toLowerCase()];
  if (code) {
    return { valid: true, value: code, errors: [] };
  }

  return { valid: false, value: cleaned, errors: [`Invalid state: "${cleaned}" is not a recognized US state code or name`] };
}

// #endregion ------------------------------------------------------------------

// #region ===================== INCOMING FROM SFSG (SFSG → DB) =================

/**
 * Sanitizes a state imported from the SFSG API.
 * Trusts SFSG as-is — no modification.
 *
 * @param value - State from SFSG API response
 */
export function sanitizeIncomingFromSFSG(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

// #endregion ------------------------------------------------------------------

// #region ===================== OUTGOING (DB → SFSG) ===========================

/**
 * Prepares state for SFSG API.
 * Trims and uppercases (matches SFSG format: "CA").
 *
 * @param value - State from MongoDB
 */
export function sanitizeOutgoing(value: string): string {
  if (!value) return '';
  return value.trim().toUpperCase();
}

// #endregion ------------------------------------------------------------------
