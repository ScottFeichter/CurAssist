# CurAssist — Spreadsheet Format Guide

## Overview

When creating a bucket from a spreadsheet, the first row must contain column headers that match the names listed below. Each subsequent row represents one organization record. The spreadsheet can be `.xlsx`, `.xls`, `.csv`, or `.ods` format.

Headers are case-sensitive and must match exactly.

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

## Location Fields

| Spreadsheet Header | Description | Required |
|---|---|---|
| Location Name | Name of the location | No |
| Address | Street address | No |
| City | City | No |
| State | State (e.g. CA) | No |
| Zip | Postal code | No |

Each row supports one location. All location fields are optional but if Address is provided, City, State, and Zip should also be provided.

---

## Phone Fields

| Spreadsheet Header | Description | Required |
|---|---|---|
| Phone | Phone number (10 digits, formatted automatically) | No |
| Phone Name | Label for the phone (e.g. "Main", "Fax") | No |

Each row supports one phone number.

---

## Service Fields

Each organization row can also include service data. If service fields are present, a service is created and embedded with the organization.

| Spreadsheet Header | Description | Required |
|---|---|---|
| Name | Service name (defaults to org name if blank) | No |
| Nickname | Service alternate name | No |
| Email | Service email | No |
| Website | Service website URL | No |
| Description | Full service description | No |
| Short Description | Brief service description | No |
| Application Process | How to apply | No |
| Required Documents | Documents needed | No |
| Interpretation Services | Languages or interpretation available | No |
| Clinician Actions | Clinician-specific actions | No |
| Cost | Service cost | No |
| Wait Time | Expected wait time | No |
| Internal Notes | Editor notes for the service | No |
| Top Categories | Comma-separated category names | No |
| Top Eligibilities | Comma-separated eligibility names | No |

Note: Service fields like Name, Email, and Website share the same header names as organization fields. The system maps the same column value to both the organization and service.

---

## Example

| Name | Address | City | State | Zip | Phone | Email | Description | Top Categories |
|---|---|---|---|---|---|---|---|---|
| Bay Area Food Bank | 123 Main St | San Francisco | CA | 94110 | 415-555-1234 | info@bafb.org | Provides food assistance | Food, Emergency |
| SF Youth Center | 456 Oak Ave | San Francisco | CA | 94102 | 415-555-5678 | hello@sfyc.org | Youth programs and services | Youth, Education |

---

## Notes

- Only the first sheet in the workbook is read
- Empty rows are skipped
- Phone numbers are auto-formatted (10 digits get dashes: 415-555-1234)
- Names are auto-converted to title case
- State is auto-converted to uppercase
- Categories and eligibilities should be comma-separated lists matching SF Service Guide values
