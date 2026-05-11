import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';

// #region ===================== CONSTRAINTS ====================================

export const constraints = {
  /** Website is optional — empty string is valid */
  required: false,
  /** Accepted input patterns (case-insensitive) */
  validPatterns: [
    /^https?:\/\/.+\..+/,          // http://example.com or https://example.com
    /^www\..+\..+/,                 // www.example.com
    /^[a-z0-9]([a-z0-9-]*[a-z0-9])?\.[a-z]{2,}/i,  // example.com (bare domain)
  ],
};

// #endregion ------------------------------------------------------------------

// #region ===================== INCOMING (Spreadsheet → DB) ====================

/**
 * Validates and sanitizes a website value from a spreadsheet.
 *
 * Accepts:
 *   - https://www.example.com
 *   - http://www.example.com
 *   - https://example.com
 *   - www.example.com (prepends https://)
 *   - example.com (prepends https://)
 *
 * Rejects:
 *   - Random text that doesn't match a URL pattern
 *   - Values like "none", "N/A", single words without a dot
 *
 * @param value - Raw cell value from spreadsheet
 * @returns SanitizeResult with normalized URL or errors
 */
export function sanitizeIncoming(value: any): SanitizeResult {
  const cleaned = sanitizeValue(value);

  // Empty is valid (field is optional)
  if (!cleaned) return { valid: true, value: '', errors: [] };

  const lower = cleaned.toLowerCase();

  // Skip obvious non-URLs
  if (['none', 'n/a', 'na', '-', 'tbd', 'unknown'].includes(lower)) {
    return { valid: true, value: '', errors: [] };
  }

  // Check if it matches any valid pattern
  const matchesPattern = constraints.validPatterns.some(p => p.test(cleaned));
  if (!matchesPattern) {
    return { valid: false, value: cleaned, errors: [`Invalid website: "${cleaned}" does not match a recognized URL pattern`] };
  }

  // Normalize: ensure protocol prefix
  let normalized = cleaned;
  if (/^https?:\/\//i.test(normalized)) {
    // Already has protocol — keep as-is
  } else if (/^www\./i.test(normalized)) {
    // Has www but no protocol — prepend https://
    normalized = 'https://' + normalized;
  } else {
    // Bare domain — prepend https://
    normalized = 'https://' + normalized;
  }

  return { valid: true, value: normalized, errors: [] };
}

// #endregion ------------------------------------------------------------------

// #region ===================== OUTGOING (DB → SFSG) ===========================

/**
 * Prepares a website value for the SFSG API call.
 * SFSG expects a full URL with protocol (https:// or http://).
 * The incoming sanitizer already normalizes to this format,
 * so outgoing just passes through. If somehow a bare domain
 * is in the DB, it prepends https://.
 *
 * @param value - Website value from MongoDB
 * @returns URL ready for SFSG API payload
 */
export function sanitizeOutgoing(value: string): string {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  if (/^www\./i.test(value)) return 'https://' + value;
  return 'https://' + value;
}

// #endregion ------------------------------------------------------------------
