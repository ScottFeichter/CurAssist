# src/server/helpers/buckets-map.ts

This module defines the mapping between spreadsheet column headers and internal field identifiers. It's the Rosetta Stone that connects spreadsheet data to the org document structure.

---

## How the Maps Work

Each map is a `Record<string, string>` where:
- **Key** (left side) = internal field identifier used in code
- **Value** (right side) = exact spreadsheet column header name

When importing a spreadsheet, `generateOrgDocuments()` uses these maps to look up values:
```typescript
const name = row[orgFieldMap.organization_name];
// equivalent to: row['Name']
```

---

## orgFieldMap

Maps organization-level fields:

| Key | Spreadsheet Column | Notes |
|-----|-------------------|-------|
| `organization_name` | `'Name'` | |
| `organization_alternate_name` | `'Nickname'` | |
| `organization_website` | `'Website'` | |
| `organization_email` | `'Email'` | |
| `organization_description` | `'Description'` | |
| `organization_legal_status` | `'Legal Status'` | |
| `organization_internal_notes` | `'Internal Notes'` | |
| `organization_locations` | `'Locations'` | Placeholder — actual data uses `organizationLocationFieldMap` |
| `organization_phones` | `'Phone'` | Placeholder — actual data uses `organizationPhoneFieldMap` |
| `organization_top_categories` | `'Categories'` | Comma-separated list |
| `organization_top_eligibilities` | `'Eligibilities'` | Comma-separated list |

---

## serviceFieldMap

Maps service-level fields (spreadsheet headers prefixed with "Service"):

| Key | Spreadsheet Column |
|-----|-------------------|
| `service_name` | `'Service Name'` |
| `service_alternate_name` | `'Service Alternate Name'` |
| `service_email` | `'Service Email'` |
| `service_description` | `'Service Description'` |
| `service_top_categories` | `'Service Categories'` |
| `service_belongs_to_org` | `'Organization ID'` |
| ... | ... |

---

## organizationLocationFieldMap

Maps address components for the organization:

| Key | Spreadsheet Column |
|-----|-------------------|
| `location_name` | `'Location Name'` |
| `address` | `'Address'` |
| `city` | `'City'` |
| `state` | `'State'` |
| `zip` | `'Zip'` |

---

## serviceLocationFieldMap

Same structure but for service-level addresses (prefixed headers):

| Key | Spreadsheet Column |
|-----|-------------------|
| `location_name` | `'Service Location Name'` |
| `address` | `'Service Address'` |
| `city` | `'Service City'` |
| `state` | `'Service State'` |
| `zip` | `'Service Zip'` |

---

## organizationPhoneFieldMap / servicePhoneFieldMap

| Key | Org Column | Service Column |
|-----|-----------|----------------|
| `phone_name` | `'Phone Name'` | `'Service Phone Name'` |
| `phone` | `'Phone'` | `'Service Phone'` |

---

## Why Separate Maps?

The spreadsheet has a flat structure (one row per org) but the data model is nested (org → addresses[], phones[], services[]). The maps bridge this gap:

1. `orgFieldMap` handles simple scalar fields
2. `organizationLocationFieldMap` handles the multi-column address that becomes one `addresses[]` entry
3. `organizationPhoneFieldMap` handles the multi-column phone that becomes one `phones[]` entry
4. `serviceFieldMap` + `serviceLocationFieldMap` + `servicePhoneFieldMap` handle the same for the service section

---

## Changing Spreadsheet Column Names

If the spreadsheet format changes, update the **values** (right side) in these maps. The keys (left side) are used throughout the codebase and should not change.
