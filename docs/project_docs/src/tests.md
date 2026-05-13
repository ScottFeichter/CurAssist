# src/tests/

This directory contains all test files organized by type.

---

## Structure

```
tests/
  _helpers/
    testConfig.ts    — Test environment configuration (ports, URLs)
    testData.ts      — Sample org/bucket data for tests
    testSetup.ts     — mongodb-memory-server setup/teardown
    testUtils.ts     — Helper functions (create test org, get CSRF token, etc.)
  integration/
    buckets-routes.test.ts                    — Tests all bucket CRUD API routes
    create-bucket-spreadsheet-submit.test.ts  — Tests the spreadsheet import + submit flow
  middleware/
    jwt.service.test.ts                       — Tests JWT token creation and verification
  unit/
    bucket-sanitizers.test.ts                 — Tests all sanitizer functions
    hydrateTemplate.test.ts                   — Tests template hydration with various org shapes
    transform.test.ts                         — Tests the SFSG payload transformation logic
```

---

## Test Infrastructure

### mongodb-memory-server
Integration tests use an in-memory MongoDB instance (no Atlas connection needed). Each test file gets a fresh database that's cleared between tests.

### supertest
Makes HTTP requests to the Express app without starting a real server. Tests the full middleware chain including CSRF, parsing, and error handling.

### Test Flow
1. `jest.setup.ts` silences console output
2. `testSetup.ts` starts in-memory MongoDB and connects Mongoose
3. Each test creates test data, makes requests, asserts responses
4. After each test, the database is cleared
5. After all tests, MongoDB is stopped

### CSRF in Tests
Integration tests fetch a real CSRF token via `GET /api/csrf/restore` using a cookie-persisting supertest agent, then include it in POST requests.
