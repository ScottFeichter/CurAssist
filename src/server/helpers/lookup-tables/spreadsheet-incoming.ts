/**
 * Lookup tables for INCOMING data from spreadsheets.
 * Used to determine which category/eligibility names are "top-level" vs "sub"
 * when splitting comma-separated lists from spreadsheet cells into the correct arrays.
 */

/** Top-level category names — names in this set go to categories[], others go to sub_categories[] */
export const topCategoryNames = new Set([
  "Arts, Culture & Identity",
  "Childcare",
  "Family Support",
  "Health & Wellness",
  "Sports & Recreation",
  "Youth Workforce & Life Skills",
  "sfsg-domesticviolence",
  "sfsg-finance",
  "sfsg-food",
  "sfsg-health",
  "sfsg-housing",
  "sfsg-hygiene",
  "sfsg-internet",
  "sfsg-jobs",
  "sfsg-lgbtqa",
  "sfsg-longtermhousing",
  "sfsg-shelter",
  "sfsg-substanceuse",
  "Ucsf-foodinsecurity",
  "ucsf-immigration",
  "Ucsf-intimatepartnerviolence",
  "Ucsf-mentalhealth",
  "Ucsf-shelter",
  "Ucsf-substanceabuse",
]);

/** Top-level eligibility names — names in this set go to eligibilities[], others go to sub_eligibilities[] */
export const topEligibilityNames = new Set([
  "Age",
  "Children",
  "Education Level",
  "Elementary School",
  "Employment Status",
  "Ethnicity",
  "Family Status",
  "Financial Status",
  "Gender",
  "Health Concerns",
  "Housing Status",
  "Immigration Status",
  "Justice Involvement",
  "Middle School",
  "Preteens",
]);
