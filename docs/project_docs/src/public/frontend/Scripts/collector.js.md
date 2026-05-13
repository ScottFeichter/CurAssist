# src/public/frontend/Scripts/collector.js

This module reads the iframe DOM and assembles a structured payload representing all form field values. It's the bridge between the visual HTML form and the data layer.

---

## Overview

The collector extracts data from the hydrated template iframe by reading:
- Input values (by element ID)
- Textarea content
- Location rows (from data attributes on child elements)
- Phone rows (from data attributes)
- Notes (from list item text content)
- Category/eligibility pills (from `.Select-value-label` elements)
- Time inputs (from `.day-group` elements)

---

## Key Functions

### collectFormData()
Entry point. Determines whether the form is in Organization or Service mode (based on which toggle button is active), then calls the appropriate collector.

Returns either:
- `{ organization: { ... } }` — org mode
- `{ service: { ... } }` — service mode (spreadsheet service toggle)

### collectOrganization(root)
Collects all org-level fields plus nested services from `orgServicesDiv`:
- Scalar fields via `val(root, id)` — reads input/textarea values by ID
- Locations via `collectLocations(root, 'organization_locations')` — reads data attributes from child divs
- Phones via `collectPhones(root, 'organization_phones')` — reads data attributes from child lis
- Hours via `collectHours(root)` — reads time inputs from `.day-group` elements
- Services via iterating `orgServicesDiv` children and calling `collectService()` on each

### collectService(root)
Collects all service-level fields from a given root element (can be the full document for spreadsheet service, or a service div element for org services).

### collectHours(root)
```javascript
const dayKeys = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'];
const groups = root.querySelectorAll('.day-group');
```
Reads 7 day groups, each with 2 time inputs (start/end). Returns an object keyed by day abbreviation with start/end time strings.

### collectLocations(root, id)
```javascript
return Array.from(container.children).map(div => ({
  location_name: div.dataset.name || '',
  address_1: div.dataset.addr1 || '',
  ...
}));
```
Reads location data from `data-*` attributes on child elements. The hydrated template stores address data in these attributes for easy extraction.

### collectPills(root, id)
```javascript
return Array.from(container.querySelectorAll('.Select-value-label')).map(el => el.textContent.trim());
```
Reads selected category/eligibility names from the pill UI components.

---

## Usage

Called by `app.js` in two contexts:
1. `saveFile()` — extracts fields to send to `/api/buckets/save`
2. `submitFormData()` — extracts fields to transform and send to SFSG
