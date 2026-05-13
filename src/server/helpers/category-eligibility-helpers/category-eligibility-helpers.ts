import { topCategoryNames, topEligibilityNames } from '../lookup-tables/spreadsheet-incoming';

/**
 * Normalizes a SFSG categories or eligibilities array to plain strings.
 * SFSG returns objects like { name, id, top_level, featured } — we store only the name.
 */
export function normalizeSFSGStringArray(items: any[]): string[] {
  return (items || []).map((item: any) => typeof item === 'string' ? item : item?.name).filter(Boolean);
}

// #region ===================== DORMANT — TOP/SUB SPLIT ========================
// The following split functions are commented out. They separated categories and
// eligibilities into "top" and "sub" arrays — a CurAssist-side concept that SFSG
// does not yet support. Keeping the code here in case we reimplement later.
//
// To reactivate: uncomment the functions and update generate-org-documents.ts,
// buckets-routes.ts, hydrate-template.ts, and the frontend collector/transform
// to use the split arrays again.

/*
export function splitCategoryNames(names: string[]): { categories: string[], sub_categories: string[] } {
  const categories: string[] = [];
  const sub_categories: string[] = [];
  for (const name of names) {
    if (topCategoryNames.has(name)) categories.push(name);
    if (!topCategoryNames.has(name)) sub_categories.push(name);
  }
  return { categories, sub_categories };
}

export function splitEligibilityNames(names: string[]): { eligibilities: string[], sub_eligibilities: string[] } {
  const eligibilities: string[] = [];
  const sub_eligibilities: string[] = [];
  for (const name of names) {
    if (topEligibilityNames.has(name)) eligibilities.push(name);
    if (!topEligibilityNames.has(name)) sub_eligibilities.push(name);
  }
  return { eligibilities, sub_eligibilities };
}

export function splitSFSGCategories(items: any[]): { categories: string[], sub_categories: string[] } {
  const categories: string[] = [];
  const sub_categories: string[] = [];
  for (const item of (items || [])) {
    const name = typeof item === 'string' ? item : item?.name;
    if (!name) continue;
    const isTop = typeof item === 'object' ? item.top_level : topCategoryNames.has(name);
    if (isTop) categories.push(name);
    if (!isTop) sub_categories.push(name);
    if (!isTop && topCategoryNames.has(name)) categories.push(name);
    if (isTop && !topCategoryNames.has(name)) sub_categories.push(name);
  }
  return { categories, sub_categories };
}

export function splitSFSGEligibilities(items: any[]): { eligibilities: string[], sub_eligibilities: string[] } {
  const eligibilities: string[] = [];
  const sub_eligibilities: string[] = [];
  for (const item of (items || [])) {
    const name = typeof item === 'string' ? item : item?.name;
    if (!name) continue;
    if (topEligibilityNames.has(name)) eligibilities.push(name);
    if (!topEligibilityNames.has(name)) sub_eligibilities.push(name);
  }
  return { eligibilities, sub_eligibilities };
}
*/

// Non-splitting versions for current use:

/**
 * Extracts category names from a SFSG categories array (flat, no split).
 */
export function extractSFSGCategories(items: any[]): string[] {
  return normalizeSFSGStringArray(items);
}

/**
 * Extracts eligibility names from a SFSG eligibilities array (flat, no split).
 */
export function extractSFSGEligibilities(items: any[]): string[] {
  return normalizeSFSGStringArray(items);
}

// #endregion ------------------------------------------------------------------

// Re-export the Sets for use by transform (still needed for top_level flag outgoing)
export { topCategoryNames, topEligibilityNames };
