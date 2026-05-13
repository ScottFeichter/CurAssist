# src/public/frontend/app.js

This is the main frontend JavaScript file — the browser-side application controller. It manages the UI state, communicates with the backend API, and orchestrates all user interactions (bucket selection, file navigation, save, move, submit, import, delete).

---

## Overview

The app is a single-page interface with:
- Left sidebar: bucket/subdir/file navigation
- Center: iframe displaying the hydrated org template
- Right sidebar: action buttons
- Modals: for confirmations, imports, bucket creation

---

## Key State Variables

```javascript
let currentBucket = '';      // Selected bucket name
let currentSubdir = '';      // Selected subdirectory (incomplete/pending/complete)
let currentFiles = [];       // Array of { _id, name } objects in current view
let currentIndex = 0;        // Index of currently displayed file
let csrfToken = '';          // CSRF token for POST requests
let isDirty = false;         // Whether the iframe has unsaved changes
let _iframeObserver = null;  // MutationObserver watching for edits
```

---

## Core Functions

### init()
Fetches CSRF token, populates bucket dropdown. Called on page load.

### loadBucket() → loadSubdir() → loadFile(index)
Cascading navigation: selecting a bucket loads subdirs, selecting a subdir loads files, selecting a file loads it into the iframe.

### loadFile(index)
```javascript
const content = await fetch(`/api/buckets/${bucket}/${subdir}/${file._id}`).then(r => r.text());
iframe.srcdoc = content;
```
Fetches the hydrated HTML template for the org and injects it into the iframe via `srcdoc`.

### saveFile(silent)
1. Calls `collectFormData()` (from collector.js) to extract structured data from the iframe
2. POSTs `{ id, fields }` to `/api/buckets/save`
3. Clears the dirty flag on success

### moveFile() / confirmMove(shouldSave)
Opens a modal to select destination bucket/subdir, then POSTs to `/api/buckets/move`.

### submitFile() / confirmSubmit()
Triggers the SFSG submission flow:
1. Collects form data from iframe
2. Calls `submitNewOrg()` (from submitNewOrg.js) which POSTs to SFSG via the proxy
3. On success, POSTs to `/api/buckets/submit` to record the sfsg_id and move to complete

---

## Dirty Flag / Unsaved Changes

```javascript
function observeIframe(iframeDoc) {
  iframeDoc.addEventListener('input', markDirty);
  iframeDoc.addEventListener('change', markDirty);
  _iframeObserver = new MutationObserver(markDirty);
  _iframeObserver.observe(iframeDoc.body, { childList: true, subtree: true });
}
```
After loading a file, attaches listeners to detect any user edit. If dirty:
- `guardUnsaved()` shows a modal before navigating away (Save & Continue / Discard / Cancel)
- `beforeunload` event prevents accidental tab close

---

## CSRF Token Handling

```javascript
function getCsrfToken() {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}
```
Reads the CSRF token from the cookie set by `/api/csrf/restore`. Included in every POST request as the `XSRF-Token` header.

---

## Bucket Creation (processCreateBucket)

Three modes:
1. **Empty bucket** — just creates a Bucket document
2. **Spreadsheet import** — uploads file, creates orgs in MongoDB
3. **Direct submit** — uploads file, creates orgs, then loops through each org and submits to SFSG

The direct submit path:
1. POSTs spreadsheet to `/api/buckets/create-bucket-spreadsheet-submit`
2. Gets back list of created orgs
3. For each org: fetches hydrated HTML → parses with DOMParser → collects form data → calls `submitNewOrg()` → records result
4. Builds combined report via `/api/buckets/build-report`
5. Downloads the report xlsx

---

## Import Functions

- `importFile()` — imports a single org from SFSG by ID
- `importMultipleFiles()` — creates a bucket and imports a range/series of SFSG org IDs
- Duplicate handling: if an org name already exists in the bucket, shows a resolution modal (overwrite or rename)

---

## UI / Sidebar

Resizable sidebars with drag handles. Collapse/expand toggles. All state is managed via CSS classes and inline styles.
