# CurAssist Test Coverage

## What Is Being Tested

### Unit Tests — `src/tests/unit/`

**`bucket-sanitizers.test.ts`** (35 tests)
Tests every sanitizer function in `src/server/helpers/bucket-sanitizers.ts` in isolation.
- `sanitizeName` — title case conversion, whitespace trimming, null/undefined handling
- `sanitizeOrganizationPhones` — 10-digit formatting, non-digit stripping, passthrough for non-10-digit
- `sanitizeState` — uppercase conversion
- `sanitizeAddress`, `sanitizeCity` — title case conversion
- `sanitizePhoneName` — sentence case conversion
- `sanitizeServiceCategories`, `sanitizeServiceEligibilitiesList` — comma-split to array, empty filtering
- All pass-through sanitizers (`sanitizeAlternateName`, `sanitizeWebsite`, `sanitizeEmail`, `sanitizeDescription`, `sanitizeInternalNotes`, `sanitizeZip`, `sanitizeOrganizationLegalStatus`, `sanitizeServiceShortDescription`, `sanitizeServiceCost`, `sanitizeServiceWaitTime`) — trim and return string, handle null

**`hydrateTemplate.test.ts`** (21 tests)
Tests the `hydrateTemplate()` function against the real combined HTML template.
- `data-org-id` stamped on body tag
- `importedFileFromSFSG` flag set correctly based on `sfId` presence
- All org scalar fields injected (name, alternate_name, website, email, description)
- Addresses injected as `location-row` divs with sequential numbers and name
- Phones injected as `phone-row` list items with sequential numbers
- Services injected into `orgServicesDiv` with unique IDs
- Multiple services get unique `service-org-N` IDs
- Sidebar nav links populated with service names
- Unnamed services use "Service N" as sidebar label
- Categories and eligibilities injected as pills
- Service scalar fields (description, fee, wait_time) injected
- Empty org (no addresses/phones/services) handled without error


Tests the core transformation logic used in `src/public/frontend/Scripts/transform.js`.
- `transformLocations` — maps collected location objects to SF API address format
- `transformPhones` — filters empty phone numbers, maps to SF API format
- `transformNotes` — wraps note strings into `{ note: string }` objects
- `transformHours` — skips days with no times, maps to SF API schedule_days format

---

### Integration Tests — `src/tests/integration/`

**`buckets-routes.test.ts`** (20 tests)
Tests all bucket API routes against an in-memory MongoDB instance via supertest.
Each test uses a real CSRF token fetched via `GET /api/csrf/restore` with a cookie-persisting agent.
The in-memory DB is cleared between every test.

| Route | Tests |
|---|---|
| `GET /api/buckets` | Returns empty array when no buckets exist; returns bucket names |
| `GET /api/buckets/:bucket/subdirs` | Always returns `['incomplete','pending','complete']` |
| `GET /api/buckets/:bucket/:subdir/files` | Returns empty array; returns matching orgs; excludes wrong status |
| `POST /api/buckets/save` | Returns 400 if missing fields; updates org name; appends history entry |
| `POST /api/buckets/move` | Returns 400 if missing fields; updates status; appends history with detail |
| `POST /api/buckets/submit` | Sets status to complete; writes sfId; sets submittedAt; appends history |
| `DELETE /api/buckets/delete` | Returns 400 if missing id; deletes org |
| `DELETE /api/buckets/:bucket` | Deletes all orgs and bucket document |
| `POST /api/buckets/create-file` | Creates blank org; copies with auto name; copies with user name |

---

## What Is NOT Being Tested

### Template Hydration
`hydrateTemplate()` is not tested. This means the following are not verified automatically:
- Org fields (name, email, website, etc.) appearing correctly in the rendered HTML
- Multiple services being cloned and injected into `orgServicesDiv`
- Sidebar service nav links being populated
- Categories and eligibilities rendering as pills
- Phone and address list injection

### Frontend / UI Behavior
No browser-level tests exist. The following known bugs are not caught by any automated test:
- **Add time picker not working** — requires browser DOM interaction
- **Inherit schedule in service not working** — requires browser DOM interaction
- **Add markdown note in organization not working** — requires browser DOM interaction

### Submit Flow
The full submit flow is not tested because it requires a live SFSG session:
- `POST /api/sf/*` proxy routes are not tested
- `submitNewOrg.js`, `submitService.js`, `transform.js` are only partially tested (transform logic only)
- The `POST /api/buckets/submit` route is tested (sfId write-back, status update) but not the SFSG API call itself

### Import Route
`POST /api/buckets/import-file` is not tested because it requires mocking the SFSG API. The following routes are also not tested:
- `POST /api/buckets/create-bucket-empty`
- `POST /api/buckets/create-bucket-spreadsheet`
- `POST /api/buckets/create-bucket-spreadsheet-submit` (requires mocking SFSG API and live session cookies)
- `importMultipleFiles` frontend flow

**Known normalization:** The SFSG API returns `addresses`, `phones`, `notes`, `categories`, and `eligibilities` as objects with extra fields. These are normalized to match the Mongoose schema on import via `normalizeSFSGStringArray()` and explicit field mapping.

### Save Route — Full Field Coverage
The save route integration test only verifies `organization_name` is updated. It does not verify that phones, addresses, service fields, categories, or eligibilities are correctly persisted.

---

## How to Run

```bash
npm test                  # all tests
npm run test:unit         # unit tests only
npm run test:integration  # integration tests only
npm run test:coverage     # all tests with coverage report
```

**Notes:**
- `NODE_ENV=test` is set automatically — Winston is silent, no log files written
- Tests use `mongodb-memory-server` — Atlas is never touched
- First run on a new machine downloads a MongoDB binary (~100MB)
