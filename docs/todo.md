# CurAssist Todo

## In Progress

- **Spreadsheet import creates org+service instead of standalone service** — when a spreadsheet row is imported, it creates an Org document with the data embedded as `org.services[0]`. But spreadsheet rows should be usable as either an org OR a standalone service (user decides via the toggle). The service toggle currently shows redundant org data instead of populating service fields from the spreadsheet data. Needs a separate data model/hydration path for "spreadsheet service" mode.

---

## Bugs

- **Submit 500 error** — `POST /api/sf/resources` returns 500 when org has a populated `addresses` array. Working payload only ever sent `addresses: []`. Need to determine if SFSG accepts addresses on initial create or requires them via `change_requests` after org exists.

- Add time picker not working
- Inherit schedule in service not working
- Add markdown note in organization not working

---

## Recently Completed

- **SFSG ID moved to Organization heading** — relocated from header to inline with "New Organization" h4, flush right, now a small toggleable input instead of a span. Hydration and collector updated for input `.value`.
- **Create bucket checkboxes mutually exclusive** — "Create empty bucket" and "Submit directly to SF Service Guide" now uncheck each other.
- **Progress bar replaced with blinking "Working..."** — create bucket modal now uses a blinking text indicator instead of the non-functional progress bar. Direct submit loop still shows per-org status.
- **Modal Working indicators** — all async modal flows (move, copy, submit, import file, import duplicate resolve) now keep the modal open with a blinking "Working..." indicator until the result is ready. No more blank screen gaps.
- **Copy file modal** — unsquished "Copy Without Saving" button; success message now shows bucket and subdirectory on separate lines.
- **Delete modal line breaks** — added line breaks between sentences in both delete confirmation modals.
- **Import file success modal** — formatted with line breaks and increased padding.
- **Modal OK button colors** — non-submit OK buttons now use neutral blue (`cancel-btn`) instead of pink submit styling.
- **Delete bucket Enter key fix** — typing "delete" and pressing Enter now works correctly; global keydown handler no longer auto-clicks wrong button when focus is on an input.
- **Sidebar bucket list sync** — `init()` now clears and resets all dropdowns before repopulating, fixing duplicate/stale entries after bucket operations.

---

## Deferred

- When org name is changed update the record name in the file list
- User authentication — replace 'unknown' in history[].by with real user identity
- Bucket-level metadata (notes, source spreadsheet name, batch size)
- File-level soft locking (concurrency Option B)
- E2E tests (Playwright or Cypress) — would catch the bugs listed above
- Integration tests for import-file, create-bucket-empty, create-bucket-spreadsheet routes
