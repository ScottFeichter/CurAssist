# CurAssist — Spreadsheet Format Guide

## Overview

When creating a bucket from a spreadsheet, the first row must contain column headers that match the names listed below. Each subsequent row represents one organization record. The spreadsheet can be `.xlsx`, `.xls`, `.csv`, or `.ods` format.

Headers are case-sensitive and must match exactly. Only the first sheet in the workbook is read.

Column order does not matter — headers are matched by name, not position. Unrecognized and blank columns are ignored. However, for best results, arrange columns in the order shown below and avoid unnecessary blank or extra columns.

There is no limit on the number of rows. However, very large spreadsheets (3,000+ rows) may experience slower processing or timeouts.

---

## Organization Fields

| Spreadsheet Header | Description | Required |
|---|---|---|
| Name | Organization name | Yes |
| Nickname | Alternate name | No |
| Website | Organization website URL | No |
| Email | Organization email | No |
| Description | Full description | No |
| Legal Status | Legal status | No |
| Internal Notes | Notes for editors (not displayed to users) | No |

---

## Organization Location Fields

| Spreadsheet Header | Description | Required |
|---|---|---|
| Location Name | Name of the location | No |
| Address | Street address | No |
| City | City | No |
| State | State (e.g. CA) | No |
| Zip | Postal code | No |

Each row supports one organization location. If Address is provided, City, State, and Zip should also be provided.

---

## Organization Phone Fields

| Spreadsheet Header | Description | Required |
|---|---|---|
| Phone | Phone number (10 digits, formatted automatically) | No |
| Phone Name | Label for the phone (e.g. "Main", "Fax") | No |

Each row supports one organization phone number.

---

## Categories & Eligibilities

These fields apply to the spreadsheet service view (the toggle). They do NOT apply to the organization itself — categories and eligibilities are service-level data only.

| Spreadsheet Header | Description | Required |
|---|---|---|
| Categories | Comma-separated category names | No |
| Eligibilities | Comma-separated eligibility names | No |

---

## Organization Service Fields

Each row can optionally include service data using "Service" prefixed headers. If a "Service Name" column has a value, a service is created under the organization.

| Spreadsheet Header | Description | Required |
|---|---|---|
| Service Name | Service name (triggers service creation if present) | No |
| Service Nickname | Service alternate name | No |
| Service Email | Service email | No |
| Service Website | Service website URL | No |
| Service Description | Full service description | No |
| Service Short Description | Brief service description | No |
| Service Application Process | How to apply | No |
| Service Required Documents | Documents needed | No |
| Service Interpretation Services | Languages or interpretation available | No |
| Service Clinician Actions | Clinician-specific actions | No |
| Service Cost | Service cost | No |
| Service Wait Time | Expected wait time | No |
| Service Internal Notes | Editor notes for the service | No |

---

## Service Location Fields

Service locations are merged into the organization's address list (SFSG stores all addresses on the org).

| Spreadsheet Header | Description | Required |
|---|---|---|
| Service Location Name | Name of the service location | No |
| Service Address | Service street address | No |
| Service City | Service city | No |
| Service State | Service state (e.g. CA) | No |
| Service Zip | Service postal code | No |

---

## Service Phone Fields

Service phones are merged into the organization's phone list (SFSG stores all phones on the org).

| Spreadsheet Header | Description | Required |
|---|---|---|
| Service Phone | Service phone number | No |
| Service Phone Name | Label for the service phone | No |

---

## Service Categories & Eligibilities

These apply to the organization service (org.services[0]), not the spreadsheet service toggle.

| Spreadsheet Header | Description | Required |
|---|---|---|
| Service Categories | Comma-separated category names | No |
| Service Eligibilities | Comma-separated eligibility names | No |

---

## Example

| Name | Address | City | State | Zip | Phone | Categories | Service Name | Service Address | Service City | Service State | Service Zip | Service Phone | Service Categories |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Bay Area Food Bank | 123 Main St | San Francisco | CA | 94110 | 415-555-1234 | Food | Food Pantry | 456 Oak Ave | San Francisco | CA | 94102 | 415-555-5678 | Food, Emergency |
| SF Youth Center | 789 Elm St | San Francisco | CA | 94103 | 415-555-9012 | Youth | | | | | | | |

- Row 1: Creates org with address + phone, plus a "Food Pantry" service with its own address + phone (all merged into org's lists for SFSG).
- Row 2: Creates org only — no service created because "Service Name" is empty. "Top Categories" goes to the spreadsheet service toggle.

---

## Auto-Formatting

| Field | Formatting Applied |
|---|---|
| Names | Converted to title case |
| State | Converted to uppercase |
| Phone | 10-digit numbers formatted with dashes |
| Address, City | Converted to title case |
| Categories, Eligibilities | Split on commas into individual items |

---

## Notes

- All addresses and phones end up on the org (SFSG stores them at the org level)
- "Service" prefixed location/phone headers are for user clarity — the data merges into the org's arrays
- Categories and eligibilities are service-level only — orgs don't have them in SFSG
