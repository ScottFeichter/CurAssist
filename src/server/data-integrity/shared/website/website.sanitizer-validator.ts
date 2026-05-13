// #region ===================== IMPORTS =======================================
import { extendedConsole as console } from '../../../../streams/consoles/customConsoles';
import { log } from '../../../../utils/logger/logger-setup/logger-wrapper';
import { SanitizeResult, sanitizeValue } from '../../sanitizer-validation-controller';
// #endregion ------------------------------------------------------------------

console.enter();

// #region ===================== CONSTRAINTS ====================================

export const constraints = {
  required: false,
  validPatterns: [
    /^https?:\/\/.+\..+/,
    /^www\..+\..+/,
    /^[a-z0-9]([a-z0-9-]*[a-z0-9])?\.[a-z]{2,}/i,
  ],
};

// #endregion ------------------------------------------------------------------

// #region ===================== CONTROLLER ====================================

// -----------------------------------------------------------------------------
/**
 * Validates and sanitizes a website from a spreadsheet.
 * Validates URL pattern, normalizes to lowercase https:// with trailing slash.
 */
export function websiteSanitizeValidateIncomingFromSpreadsheet(value: any): SanitizeResult {
  log.enter("websiteSanitizeValidateIncomingFromSpreadsheet()", log.brack);
  const cleaned = sanitizeValue(value);
  if (!cleaned) { log.retrn("websiteSanitizeValidateIncomingFromSpreadsheet()", log.kcarb); return { valid: true, value: '', errors: [] }; }
  if (isNonValue(cleaned)) { log.retrn("websiteSanitizeValidateIncomingFromSpreadsheet()", log.kcarb); return { valid: true, value: '', errors: [] }; }
  const errors = validate(cleaned);
  if (errors.length) { log.retrn("websiteSanitizeValidateIncomingFromSpreadsheet()", log.kcarb); return { valid: false, value: cleaned, errors }; }
  log.retrn("websiteSanitizeValidateIncomingFromSpreadsheet()", log.kcarb);
  return { valid: true, value: normalizeUrl(cleaned), errors: [] };
}

// -----------------------------------------------------------------------------
/**
 * Sanitizes a website imported from the SFSG API.
 * Trusts SFSG as-is — no modification.
 */
export function websiteSanitizeValidateIncomingFromSFSG(value: any): string {
  log.enter("websiteSanitizeValidateIncomingFromSFSG()", log.brack);
  log.retrn("websiteSanitizeValidateIncomingFromSFSG()", log.kcarb);
  if (value === null || value === undefined) return '';
  return String(value);
}

// -----------------------------------------------------------------------------
/**
 * Prepares website for SFSG API.
 * Ensures https:// prefix, lowercase, trailing slash.
 */
export function websiteSanitizeValidateOutgoingToSFSG(value: string): string {
  log.enter("websiteSanitizeValidateOutgoingToSFSG()", log.brack);
  if (!value) { log.retrn("websiteSanitizeValidateOutgoingToSFSG()", log.kcarb); return ''; }
  log.retrn("websiteSanitizeValidateOutgoingToSFSG()", log.kcarb);
  return normalizeUrl(value);
}

// #endregion ------------------------------------------------------------------

// #region ===================== VALIDATORS ====================================

// -----------------------------------------------------------------------------
/**
 * Validates a website value against known URL patterns.
 */
function validate(value: string): string[] {
  const errors: string[] = [];
  const matchesPattern = constraints.validPatterns.some(p => p.test(value));
  if (!matchesPattern) errors.push(`Invalid website: "${value}" does not match a recognized URL pattern`);
  return errors;
}

// -----------------------------------------------------------------------------
/**
 * Checks if value is a non-URL placeholder like "none", "N/A", etc.
 */
function isNonValue(value: string): boolean {
  return ['none', 'n/a', 'na', '-', 'tbd', 'unknown'].includes(value.toLowerCase());
}

// #endregion ------------------------------------------------------------------

// #region ===================== SANITIZERS =====================================

// -----------------------------------------------------------------------------
/**
 * Normalizes a URL: ensures https:// prefix, lowercases, adds trailing slash.
 */
function normalizeUrl(value: string): string {
  let url = value;
  if (/^https?:\/\//i.test(url)) { /* has protocol */ }
  else if (/^www\./i.test(url)) { url = 'https://' + url; }
  else { url = 'https://' + url; }
  url = url.toLowerCase();
  return ensureTrailingSlash(url);
}

// -----------------------------------------------------------------------------
/**
 * Ensures a URL has a trailing slash after the domain (if no path exists).
 */
function ensureTrailingSlash(url: string): string {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.pathname === '' || parsed.pathname === '/') return parsed.origin + '/' + (parsed.search || '') + (parsed.hash || '');
    return url;
  } catch {
    if (!url.endsWith('/') && !url.includes('/', url.indexOf('//') + 2)) return url + '/';
    return url;
  }
}

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
