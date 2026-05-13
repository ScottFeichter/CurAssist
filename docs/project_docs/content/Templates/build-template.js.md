# content/Templates/build-template.js

This script combines multiple HTML component files into a single `orgServTemplate-combined.html` file. It's run during the build process (`npm run build`).

---

## What It Does

The org/service form template is split into separate component files for maintainability:
- `orgServTemplate-html.html` — the `<html>` wrapper
- `orgServTemplate-head.html` — `<head>` with styles and scripts
- `orgServTemplate-body-skeleton.html` — the body layout structure
- `orgServTemplate-body-Header.html` — the header/toggle buttons
- `orgServTemplate-navBar.html` — sidebar navigation
- `orgServTemplate-body-OrganizationDiv.html` — org fields section
- `orgServTemplate-body-OrgServicesDiv.html` — org services container
- `orgServTemplate-body-ServiceDiv-Spreadsheet.html` — spreadsheet service section
- `orgServTemplate-body-ServiceDiv-Organization.html` — org service template (cloned per service)
- `_timePicker.html` — time picker widget
- `_sharedServiceData.html` — shared category/eligibility data

This script reads all components, extracts their body content and styles, and assembles them into one file.

---

## Key Functions

### varifySharedData(html)
Converts `const` declarations to `var` inside `<script>` blocks for shared data (category/eligibility arrays). This prevents "already declared" errors when the same script appears in multiple service divs.

### bodyContent(filePath)
Extracts just the inner content of `<body>...</body>` from a full HTML document.

### componentStyles(filePath)
Extracts component-specific `<style>` blocks from the `<head>` (excluding base/minified styles).

---

## Output

Writes `orgServTemplate-combined.html` to the same directory. This combined file is what `hydrateTemplate()` reads at request time to inject org data into.
