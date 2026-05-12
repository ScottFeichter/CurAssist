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

// #region ===================== HELPERS ========================================

/**
 * Ensures a URL has a trailing slash after the domain (if no path exists).
 * SFSG stores URLs with trailing slash: "https://kaiming.org/"
 */
function ensureTrailingSlash(url: string): string {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.pathname === '' || parsed.pathname === '/') {
      return parsed.origin + '/' + (parsed.search || '') + (parsed.hash || '');
    }
    return url;
  } catch {
    // If URL parsing fails, just add slash if not present after domain
    if (!url.endsWith('/') && !url.includes('/', url.indexOf('//') + 2)) {
      return url + '/';
    }
    return url;
  }
}

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
 * Normalizes to lowercase with trailing slash to match SFSG format.
 *
 * @param value - Raw cell value from spreadsheet
 * @returns SanitizeResult with normalized URL or errors
 */
export function sanitizeIncoming(value: any): SanitizeResult {
  const cleaned = sanitizeValue(value);

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
    normalized = 'https://' + normalized;
  } else {
    normalized = 'https://' + normalized;
  }

  // Lowercase and ensure trailing slash (match SFSG format)
  normalized = normalized.toLowerCase();
  normalized = ensureTrailingSlash(normalized);

  return { valid: true, value: normalized, errors: [] };
}

// #endregion ------------------------------------------------------------------

// #region ===================== INCOMING FROM SFSG (SFSG → DB) =================

/**
 * Sanitizes a website value imported from the SFSG API.
 * Trusts SFSG as-is — no trimming, no modification.
 *
 * @param value - Website from SFSG API response
 * @returns Value exactly as SFSG provided it
 */
export function sanitizeIncomingFromSFSG(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

// #endregion ------------------------------------------------------------------

// #region ===================== OUTGOING (DB → SFSG) ===========================

/**
 * Prepares a website value for the SFSG API call.
 * SFSG expects lowercase URL with protocol and trailing slash.
 * Ensures https:// prefix, lowercases, adds trailing slash if needed.
 *
 * @param value - Website value from MongoDB
 * @returns URL ready for SFSG API payload
 */
export function sanitizeOutgoing(value: string): string {
  if (!value) return '';

  let url = value;

  // Ensure protocol
  if (/^https?:\/\//i.test(url)) {
    // has protocol
  } else if (/^www\./i.test(url)) {
    url = 'https://' + url;
  } else {
    url = 'https://' + url;
  }

  // Lowercase and trailing slash
  url = url.toLowerCase();
  url = ensureTrailingSlash(url);

  return url;
}

// #endregion ------------------------------------------------------------------
