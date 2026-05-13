/**
 * Lookup tables for OUTGOING data to the SF Service Guide API.
 * Used when building SFSG API payloads — resolves category/eligibility names
 * to their SFSG numeric IDs and determines the top_level flag.
 *
 * NOTE: The browser-side Scripts/data/lookup-tables.js contains the full
 * categoryLookup and eligibilityLookup (name → ID) maps for the browser submit flow.
 * This server-side file uses the same topCategoryNames set for the top_level flag
 * in transformOrgToSFPayload(). ID resolution is not done server-side (passes id: null).
 */

import { topCategoryNames, topEligibilityNames } from './spreadsheet-incoming';

export { topCategoryNames, topEligibilityNames };
