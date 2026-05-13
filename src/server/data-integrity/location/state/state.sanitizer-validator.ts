import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

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

export function sanitizeIncoming(value: any): SanitizeResult {
  const cleaned = sanitizeValue(value);
  if (!cleaned) return { valid: true, value: '', errors: [] };

  const resolved = resolveState(cleaned);
  if (!resolved) {
    const errors = validate(cleaned);
    return { valid: false, value: cleaned, errors };
  }
  return { valid: true, value: resolved, errors: [] };
}

export function sanitizeIncomingFromSFSG(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

export function sanitizeOutgoing(value: string): string {
  if (!value) return '';
  return value.trim().toUpperCase();
}

// #endregion ------------------------------------------------------------------

// #region ===================== VALIDATORS ====================================

function validate(value: string): string[] {
  return [`Invalid state: "${value}" is not a recognized US state code or name`];
}

// #endregion ------------------------------------------------------------------

// #region ===================== SANITIZERS =====================================

/**
 * Resolves a state value to a 2-letter code. Accepts codes or full names.
 * Returns null if unrecognized.
 */
function resolveState(value: string): string | null {
  const upper = value.toUpperCase();
  if (upper.length === 2 && validStateCodes.has(upper)) return upper;
  const code = stateNameToCode[value.toLowerCase()];
  return code || null;
}

// #endregion ------------------------------------------------------------------
