import { extendedConsole as console } from '../../../streams/consoles/customConsoles';
import { log } from '../../../utils/logger/logger-setup/logger-wrapper';
import * as XLSX from 'xlsx';
import { Bucket } from '../../../database/models/bucket.model';
import { orgFieldMap, serviceFieldMap, organizationLocationFieldMap, organizationPhoneFieldMap, serviceLocationFieldMap, servicePhoneFieldMap } from '../buckets-map/buckets-map';

console.enter();

// #region ===================== KNOWN HEADERS ==================================

/** All recognized spreadsheet column headers (from all field maps). */
const knownHeaders: Set<string> = new Set([
  ...Object.values(orgFieldMap),
  ...Object.values(serviceFieldMap),
  ...Object.values(organizationLocationFieldMap),
  ...Object.values(organizationPhoneFieldMap),
  ...Object.values(serviceLocationFieldMap),
  ...Object.values(servicePhoneFieldMap),
]);

/** Required headers — upload is rejected if these are missing. */
const requiredHeaders: Set<string> = new Set([
  'Name',
]);

// #endregion ------------------------------------------------------------------

// #region ===================== HEADER VALIDATION ==============================

/** Result of header validation. */
export interface HeaderValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates spreadsheet headers against known column names.
 * - Trims whitespace from headers before matching.
 * - Matches case-insensitively (accepts "name" or "NAME" for "Name").
 * - Reports missing required headers as errors (rejects upload).
 * - Reports unrecognized headers as warnings (does not reject).
 *
 * @param rawHeaders - The first row of the spreadsheet
 * @returns HeaderValidationResult with errors and warnings
 */
export function validateHeaders(rawHeaders: string[]): HeaderValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Trim all headers
  const trimmedHeaders = rawHeaders.map(h => (h || '').trim());

  // Build a lowercase map of known headers for case-insensitive matching
  const knownLower = new Map<string, string>();
  for (const known of knownHeaders) {
    knownLower.set(known.toLowerCase(), known);
  }

  // Check required headers exist (case-insensitive)
  for (const required of requiredHeaders) {
    const found = trimmedHeaders.some(h => h.toLowerCase() === required.toLowerCase());
    if (!found) {
      errors.push(`Required column missing: "${required}"`);
    }
  }

  // Check for unrecognized headers
  for (const header of trimmedHeaders) {
    if (!header) continue; // skip empty columns
    if (!knownLower.has(header.toLowerCase())) {
      // Try to suggest a close match
      const suggestion = findClosestMatch(header, [...knownHeaders]);
      if (suggestion) {
        warnings.push(`Unrecognized column: "${header}" — did you mean "${suggestion}"?`);
      } else {
        warnings.push(`Unrecognized column: "${header}"`);
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Finds the closest matching known header using simple Levenshtein-like comparison.
 * Returns the match if it's within 3 edits, otherwise null.
 */
function findClosestMatch(input: string, candidates: string[]): string | null {
  const inputLower = input.toLowerCase();
  let bestMatch: string | null = null;
  let bestDistance = Infinity;

  for (const candidate of candidates) {
    const dist = levenshtein(inputLower, candidate.toLowerCase());
    if (dist < bestDistance && dist <= 3) {
      bestDistance = dist;
      bestMatch = candidate;
    }
  }

  return bestMatch;
}

/** Simple Levenshtein distance implementation. */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  return dp[m][n];
}

/**
 * Normalizes headers — trims whitespace. Accepts any casing.
 * Returns the normalized headers mapped to their canonical (known) form where possible.
 * @param rawHeaders - The first row of the spreadsheet
 * @returns Array of normalized header strings (canonical casing where matched, original otherwise)
 */
export function normalizeHeaders(rawHeaders: string[]): string[] {
  const knownLower = new Map<string, string>();
  for (const known of knownHeaders) {
    knownLower.set(known.toLowerCase(), known);
  }

  return rawHeaders.map(h => {
    const trimmed = (h || '').trim();
    const canonical = knownLower.get(trimmed.toLowerCase());
    return canonical || trimmed;
  });
}

// #endregion ------------------------------------------------------------------

// #region ===================== SPREADSHEET PARSING ============================

/**
 * Creates a new bucket document in MongoDB.
 * @param bucketName - The name of the bucket to create
 */
export async function createBucketStructure(bucketName: string): Promise<void> {
  log.enter('createBucketStructure()', log.brack);
  await Bucket.create({ name: bucketName });
  log.retrn('createBucketStructure()', log.kcarb);
}

/**
 * Parses a spreadsheet buffer and returns headers and row data.
 * First row is treated as headers. Headers are validated and normalized.
 * @param fileBuffer - The spreadsheet file buffer
 * @returns Parsed data including normalized headers, rows, workbook, and any header warnings
 */
export async function parseSpreadsheet(fileBuffer: Buffer): Promise<{ headers: string[], rows: any[], workbook: XLSX.WorkBook, headerWarnings: string[] }> {
  log.enter('parseSpreadsheet()', log.brack);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

  if (data.length < 2) {
    throw new Error('Spreadsheet must have at least a header row and one data row');
  }

  const rawHeaders = data[0] as string[];

  // Validate headers
  const validation = validateHeaders(rawHeaders);
  if (!validation.valid) {
    throw new Error(`Spreadsheet header validation failed: ${validation.errors.join('; ')}`);
  }

  // Normalize headers (trim + canonical casing)
  const headers = normalizeHeaders(rawHeaders);

  const rows = data.slice(1).map(row => {
    const obj: any = {};
    headers.forEach((header, index) => { obj[header] = row[index] || ''; });
    return obj;
  });

  log.retrn('parseSpreadsheet()', log.kcarb);
  return { headers, rows, workbook, headerWarnings: validation.warnings };
}

// #endregion ------------------------------------------------------------------

console.leave();
