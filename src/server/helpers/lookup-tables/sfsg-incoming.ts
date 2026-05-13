/**
 * Lookup tables for INCOMING data from the SF Service Guide API.
 * Used as a fallback when importing orgs from SFSG — if the SFSG response
 * lacks a top_level flag on a category/eligibility, we use these sets to determine placement.
 *
 * Currently re-exports the same data as spreadsheet-incoming since the
 * top-level definitions are the same regardless of data source.
 */

import { topCategoryNames, topEligibilityNames } from './spreadsheet-incoming';

export { topCategoryNames, topEligibilityNames };
