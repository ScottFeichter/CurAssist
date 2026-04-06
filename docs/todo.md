# CurAssist Todo

## In Progress

- Test the full submit flow end to end with a real SFSG session

---

## Bugs

These are frontend/DOM bugs not covered by the current test suite.
They require E2E tests (Playwright or Cypress) to catch automatically.

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
- Integration tests for import-file, create-bucket-empty, create-bucket-spreadsheet, create-bucket-spreadsheet-submit routes
