# src/public/frontend/Scripts/lookup-tables.js

This file contains lookup tables that map category and eligibility names to their SFSG numeric IDs. Used by `transform.js` to resolve names to IDs when building SFSG API payloads.

---

## Contents

- `categoryLookup` — `Record<string, number>` mapping category names to SFSG IDs
- `eligibilityLookup` — `Record<string, number>` mapping eligibility names to SFSG IDs
- `topCategoryNames` — `Set<string>` of top-level category names (used to determine `top_level: true/false`)
- `topEligibilityNames` — `Set<string>` of top-level eligibility names

These are hardcoded values extracted from the SFSG API. If SFSG adds/removes categories or eligibilities, these tables need to be updated manually.
