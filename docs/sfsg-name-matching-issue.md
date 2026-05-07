# SFSG Eligibility & Category Name Matching Issue

## Summary

SFSG silently drops any category or eligibility that does not have a valid `id`. The `id` is resolved by matching the **exact name** in our lookup table against SFSG's API. If the name doesn't match exactly, the item gets `id: null` and SFSG ignores it.

## Example

Spreadsheet input:
```
Categories: Childcare
Eligibilities: Age, Infants, Toddlers, Children
```

Results on SFSG:
| Value | Accepted? | Reason |
|---|---|---|
| Childcare | ✅ Yes | Exact match → id 102 |
| Children | ✅ Yes | Exact match → id 1007 (displayed as "Children (0-13 years old)") |
| Age | ❌ Dropped | No SFSG eligibility named "Age" — id is null |
| Infants | ❌ Dropped | SFSG name is "Infants (0-2 years old)" (id 1006) — not "Infants" |
| Toddlers | ❌ Dropped | SFSG name is "Toddler Age" (id 32) — not "Toddlers" |

## Root Cause

SFSG requires each category/eligibility object to include a valid numeric `id`. Items without an `id` are silently accepted in the request but never persisted. The `id` is looked up by exact name match against SFSG's taxonomy.

SFSG's naming conventions are inconsistent:
- Some use age ranges: `"Children (0-13 years old)"`, `"Infants (0-2 years old)"`
- Some use adjectives: `"Toddler Age"`, `"Elderly"`
- Some are plain: `"Men"`, `"Women"`, `"LGBTQ+"`
- There is no generic `"Age"` eligibility — only specific age-related entries

## Affected Names

Common shorthand names that volunteers might use but SFSG does not recognize:

| Volunteer Enters | SFSG Expects | SFSG ID |
|---|---|---|
| Age | *(no equivalent)* | — |
| Infants | Infants (0-2 years old) | 1006 |
| Toddlers | Toddler Age | 32 |
| Children | Children (0-13 years old) | 1007 |
| Preteens | Preteen | 33 |
| Seniors | I am a Senior | 1008 |
| Youth | Youth (below 21 years old) | 27 |
| Homeless | Experiencing Homelessness | 1054 |
| Domestic Violence | Domestic Violence Survivors | 1069 |
| Elementary School | Elementary School Student | 36 |

## Options

1. **SFSG updates their API** to accept items by name without requiring an id, or to do fuzzy/partial name matching
2. **SFSG adds common shorthand aliases** so "Infants" resolves to "Infants (0-2 years old)"
3. **CurAssist workaround** — we add alias mappings in our lookup table (e.g. "Infants" → id 1006) so the shorthand names resolve to the correct SFSG ids despite the name mismatch

## Current State

CurAssist stores whatever the volunteer enters. The data is correct in our DB. The issue only manifests when submitting to SFSG — items without a matching id are silently dropped. No error is returned.

## SFSG API Reference

- Categories list: `GET https://www.sfserviceguide.org/api/v2/categories`
- Eligibilities list: `GET https://www.sfserviceguide.org/api/v2/eligibilities`
