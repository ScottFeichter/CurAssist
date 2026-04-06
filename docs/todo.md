# CurAssist Todo

## In Progress

- **Spreadsheet import creates org+service instead of standalone service** — when a spreadsheet row is imported, it creates an Org document with the data embedded as `org.services[0]`. But spreadsheet rows should be usable as either an org OR a standalone service (user decides via the toggle). The service toggle currently shows redundant org data instead of populating service fields from the spreadsheet data. Needs a separate data model/hydration path for "spreadsheet service" mode.

---

## Bugs

- **Submit 500 error** — `POST /api/sf/resources` returns 500 when org has a populated `addresses` array. Working payload only ever sent `addresses: []`. Need to determine if SFSG accepts addresses on initial create or requires them via `change_requests` after org exists.

- **Template syntax errors in srcdoc** — browser reports `Unexpected token '}'` at line ~2269 and `Unexpected token ')'` at lines ~3345 and ~5626 in the hydrated iframe. Causes all JS in those script blocks to fail — EDIT/REMOVE buttons on hydrated rows don't work. Root cause not yet confirmed (multiline backtick template literals suspected).

- **EDIT button on hydrated location/phone rows not working** — wired at DOMContentLoaded but blocked by syntax errors above.

- **Edit button hover on location rows** — text invisible on hover (blue on blue). Phone row hover is fine.

- **Modal OK button colors** — some OK buttons use the same color as Submit buttons. Should use a neutral color unless in the submit workflow itself.

- When deleting a bucket, if you type "delete" and tab and press enter, a browser alert appears saying you must type "delete" exactly even though it's already there. Works fine with mouse click.

- Where I do things to buckets such as delete, the list of buckets gets out of whack and I have to refresh the browser.

- Add time picker not working
- Inherit schedule in service not working
- Add markdown note in organization not working

---

## Deferred

- When org name is changed update the record name in the file list
- User authentication — replace 'unknown' in history[].by with real user identity
- Bucket-level metadata (notes, source spreadsheet name, batch size)
- File-level soft locking (concurrency Option B)
- E2E tests (Playwright or Cypress) — would catch the bugs listed above
- Integration tests for import-file, create-bucket-empty, create-bucket-spreadsheet routes
