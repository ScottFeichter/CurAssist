/**
 * Lookup tables for INCOMING data from spreadsheets.
 *
 * DORMANT — top/sub split is no longer used. Categories and eligibilities are
 * now validated against the SFSG API via generated-lookups.ts (built by
 * scripts/build-lookup-tables.js). Keeping these commented out in case we
 * reimplement top/sub classification later.
 */

// /** Top-level category names — names in this set go to categories[], others go to sub_categories[] */
// export const topCategoryNames = new Set([
//   "Arts, Culture & Identity",
//   "Childcare",
//   "Family Support",
//   "Health & Wellness",
//   "Sports & Recreation",
//   "Youth Workforce & Life Skills",
//   "sfsg-domesticviolence",
//   "sfsg-finance",
//   "sfsg-food",
//   "sfsg-health",
//   "sfsg-housing",
//   "sfsg-hygiene",
//   "sfsg-internet",
//   "sfsg-jobs",
//   "sfsg-lgbtqa",
//   "sfsg-longtermhousing",
//   "sfsg-shelter",
//   "sfsg-substanceuse",
//   "Ucsf-foodinsecurity",
//   "ucsf-immigration",
//   "Ucsf-intimatepartnerviolence",
//   "Ucsf-mentalhealth",
//   "Ucsf-shelter",
//   "Ucsf-substanceabuse",
// ]);

// /** Top-level eligibility names — names in this set go to eligibilities[], others go to sub_eligibilities[] */
// export const topEligibilityNames = new Set([
//   "Age",
//   "Children",
//   "Education Level",
//   "Elementary School",
//   "Employment Status",
//   "Ethnicity",
//   "Family Status",
//   "Financial Status",
//   "Gender",
//   "Health Concerns",
//   "Housing Status",
//   "Immigration Status",
//   "Justice Involvement",
//   "Middle School",
//   "Preteens",
// ]);

// Placeholder exports to avoid breaking existing imports until they're cleaned up
export const topCategoryNames = new Set<string>();
export const topEligibilityNames = new Set<string>();
