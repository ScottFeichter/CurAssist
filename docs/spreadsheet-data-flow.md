# Spreadsheet Import — Internal Data Flow

How spreadsheet columns map to the Org document during bucket creation via `generateOrgDocuments()`.

---

## Overview

When a spreadsheet is imported, each row creates one Org document. The data from each row is distributed across three areas of the document:

1. **Org** — top-level fields on the Org document (displayed in the Organization section of the form)
2. **spreadsheetService** ("toggle service") — embedded object on the Org document (displayed in the Service toggle of the form)
3. **services[0]** ("organization service") — first entry in the `org.services[]` array (displayed in the Organization Services sidebar; only created when "Service Name" header has a value)

Additionally, if the "Create service from organization" checkbox is checked during bucket creation, an extra entry is pushed to `org.services[]` using the org-level data.

---

## Fields Written to BOTH Org and Toggle Service (spreadsheetService)

These fields are read from the same spreadsheet column and stored in both places.

| Spreadsheet Header | Org field | Toggle Service field |
|---|---|---|
| Name | `name` | `name` |
| Nickname | `alternate_name` | `alternate_name` |
| Website | `website` | `url` |
| Email | `email` | `email` |
| Description | `long_description` | `long_description` |
| Internal Notes | `internal_note` | `internal_note` |
| Address / City / State / Zip | `addresses[]` | `addresses[]` |
| Location Name | `addresses[].name` | `addresses[].name` |
| Phone / Phone Name | `phones[]` | `phones[]` |

---

## Fields Written to Org ONLY

| Spreadsheet Header | Org field |
|---|---|
| Legal Status | `legal_status` |

---

## Fields Written to Toggle Service (spreadsheetService) ONLY

| Spreadsheet Header | Toggle Service field |
|---|---|
| Categories | `categories` |
| Eligibilities | `eligibilities` |

---

## Fields Written to Organization Service (services[0]) ONLY

These require a "Service Name" value to be present in the row. Without it, no service is created.

| Spreadsheet Header | Organization Service field |
|---|---|
| Service Name | `name` |
| Service Nickname | `alternate_name` |
| Service Email | `email` |
| Service Website | `url` |
| Service Cost | `fee` |
| Service Wait Time | `wait_time` |
| Service Application Process | `application_process` |
| Service Required Documents | `required_documents` |
| Service Interpretation Services | `interpretation_services` |
| Service Clinician Actions | `clinician_actions` |
| Service Internal Notes | `internal_note` |
| Service Categories | `categories` |
| Service Eligibilities | `eligibilities` |
| Service Address / City / State / Zip | `addresses[]` (also merged into org `addresses[]`) |
| Service Location Name | `addresses[].name` (also merged into org `addresses[]`) |
| Service Phone / Phone Name | `phones[]` (also merged into org `phones[]`) |

---

## "Create Service from Organization" Checkbox

When checked during bucket creation, an additional entry is pushed to `org.services[]` using org-level data:

| Source | services[] field |
|---|---|
| Name | `name` |
| Nickname | `alternate_name` |
| Website | `url` |
| Email | `email` |
| Internal Notes | `internal_note` |
| Categories | `categories` |
| Eligibilities | `eligibilities` |
| Address / City / State / Zip | `addresses[]` |
| Location Name | `addresses[].name` |
| Phone / Phone Name | `phones[]` |

This is the same as using the "Add Service from Org" button in the sidebar, but applied automatically at import time.

---

## Fields in buckets-map.ts NOT Currently Ingested

These keys exist in the field maps but are not read by `generateOrgDocuments()`:

| Map key | Spreadsheet Header | Reason |
|---|---|---|
| `organization_markdown_notes` | Markdown Notes | Not implemented |
| `organization_hours` | Hours | Not implemented |
| `service_short_description` | Service Short Description | Only read for organization service, not toggle service |
| `service_markdown_notes` | Service Markdown Notes | Not implemented |
| `service_hours` | Service Hours | Not implemented |
| `service_sub_categories` | Service Sub Categories | Not implemented |
| `service_sub_eligibilities` | Service Sub Eligibilities | Not implemented |
| `service_belongs_to_org` | Organization ID | Not read during generation (set manually by volunteer) |

---

## Hydration

`hydrateTemplate()` reads the stored Org document and injects values into the HTML template at request time. It reads from:

- Org top-level fields → Organization section inputs
- `org.spreadsheetService` → Toggle service inputs
- `org.services[]` → Organization Services sidebar sections

If a field was not stored during import, it will be empty in the form.
