# CurAssist Todo

## In Progress

- Test the full submit flow end to end with a real SFSG session
- Multiple services — currently only services[0] is hydrated and saved

---

## Bugs

- Add time picker not working
- Inherit schedule in service not working
- Add markdown note in organization not working

---

## Deferred

- When a file is moved don't auto-load the next file in the bucket
- Fix truncation at 100% zoom in the navbar
- When org name is changed update the record name in the file list
- User authentication — replace 'unknown' in history[].by with real user identity
- Bucket-level metadata (notes, source spreadsheet name, batch size)
- File-level soft locking (concurrency Option B)
- E2E tests (Playwright or Cypress)
- Unit tests for hydrateTemplate()
- Integration tests for import-file route (requires mocking SFSG API)
