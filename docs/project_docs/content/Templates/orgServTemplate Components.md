# content/Templates/orgServTemplate Components/

This directory contains the individual HTML component files that are combined by `build-template.js` into `orgServTemplate-combined.html`.

## Files

| File | Purpose |
|------|---------|
| `orgServTemplate-html.html` | Outer `<html>` wrapper tag |
| `orgServTemplate-head.html` | `<head>` section with base styles, fonts, and scripts |
| `orgServTemplate-body-skeleton.html` | Body layout structure (edit--main container) |
| `orgServTemplate-body-Header.html` | Header with Organization/Service toggle buttons |
| `orgServTemplate-navBar.html` | Left sidebar navigation with service links |
| `orgServTemplate-body-OrganizationDiv.html` | Organization fields section (name, email, phones, addresses, hours, etc.) |
| `orgServTemplate-body-OrgServicesDiv.html` | Container for org-level services |
| `orgServTemplate-body-ServiceDiv-Spreadsheet.html` | Spreadsheet service section (shown in Service toggle mode) |
| `orgServTemplate-body-ServiceDiv-Organization.html` | Template for a single org service (cloned per service by hydrateTemplate) |
| `_timePicker.html` | Reusable time picker widget (7 days x start/end) |
| `_sharedServiceData.html` | Shared category/eligibility dropdown data |
| `_categoryExample.html` | Reference example for category pill markup |

These are never served directly — only the combined output is used at runtime.
