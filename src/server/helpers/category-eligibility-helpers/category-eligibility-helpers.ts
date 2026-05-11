import { topCategoryNames, topEligibilityNames } from '../lookup-tables/spreadsheet-incoming';

/**
 * Normalizes a SFSG categories or eligibilities array to plain strings.
 * SFSG returns objects like { name, id, top_level, featured } — we store only the name.
 */
export function normalizeSFSGStringArray(items: any[]): string[] {
  return (items || []).map((item: any) => typeof item === 'string' ? item : item?.name).filter(Boolean);
}

/**
 * Splits a plain string array of category names into top and sub using topCategoryNames set.
 * For spreadsheet import where values are just name strings.
 */
export function splitCategoryNames(names: string[]): { categories: string[], sub_categories: string[] } {
  const categories: string[] = [];
  const sub_categories: string[] = [];
  for (const name of names) {
    if (topCategoryNames.has(name)) categories.push(name);
    if (!topCategoryNames.has(name)) sub_categories.push(name);
  }
  return { categories, sub_categories };
}

/**
 * Splits a plain string array of eligibility names into top and sub using topEligibilityNames set.
 * For spreadsheet import where values are just name strings.
 */
export function splitEligibilityNames(names: string[]): { eligibilities: string[], sub_eligibilities: string[] } {
  const eligibilities: string[] = [];
  const sub_eligibilities: string[] = [];
  for (const name of names) {
    if (topEligibilityNames.has(name)) eligibilities.push(name);
    if (!topEligibilityNames.has(name)) sub_eligibilities.push(name);
  }
  return { eligibilities, sub_eligibilities };
}

/**
 * Splits a SFSG categories array into top and sub based on the top_level flag.
 * Uses SFSG's top_level boolean. Items in topCategoryNames go in both arrays.
 */
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

/**
 * Splits a SFSG eligibilities array into top and sub based on topEligibilityNames set.
 * Names in the set go to eligibilities. Names not in the set go to sub_eligibilities.
 */
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
