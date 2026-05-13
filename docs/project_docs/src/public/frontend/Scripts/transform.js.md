# src/public/frontend/Scripts/transform.js

This module transforms collected form data into the exact JSON shape the SF Service Guide API expects. It's the browser-side equivalent of `transformOrgToSFPayload()` in `bucket-helpers.ts`.

---

## Constants

```javascript
const SF_API = '/api/sf';
```
All SFSG calls go through our proxy at `/api/sf/*` for server-side logging.

---

## Key Functions

### transformNewOrg(payload)
Main transform for creating a new org. Takes the collector output and returns:
- `orgBody` — `{ resources: [{ name, addresses, phones, notes, schedule, ... }] }`
- `services` — array of service objects ready for the services endpoint

Only includes fields that have values (empty strings are omitted to keep payloads clean).

### transformService(svc)
Transforms a single service's collected data into SFSG format:
- Maps field names (e.g. `service_description` → `long_description`)
- Transforms locations, phones, notes, hours
- Resolves category/eligibility names to IDs via lookup tables
- Sets `shouldInheritScheduleFromParent: false`

### transformServiceOnly(payload)
For the "submit service to existing org" flow. Extracts the `service_belongs_to_org` ID and wraps the service in `{ services: [...] }`.

---

## Helper Functions

| Function | Purpose |
|----------|---------|
| `transformCategories(top, sub)` | Merges arrays, resolves IDs from `categoryLookup`, adds `top_level` flag |
| `transformEligibilities(top, sub)` | Merges arrays, resolves IDs from `eligibilityLookup` |
| `transformHours(hours)` | Converts day-keyed object to `{ schedule_days: [...] }` |
| `transformLocations(locations)` | Maps collector location objects to SFSG address format |
| `transformNotes(notes)` | Wraps strings in `{ note: "..." }` objects |
| `transformPhones(phones)` | Strips non-digits, adds `service_type: 'voice'` default |
| `timeToHHMM(timeStr)` | Converts "HH:MM" to integer (e.g. "08:00" → 800) |

---

## SFSG Field Name Mapping

| Collector Field | SFSG Field |
|----------------|------------|
| `organization_name` | `name` |
| `organization_description` | `long_description` |
| `organization_website` | `website` |
| `service_description` | `long_description` |
| `service_website` | `url` |
| `service_cost` | `fee` |
| `service_internal_notes` | `internal_note` |
