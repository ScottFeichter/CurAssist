# src/tests/_helpers/

Shared test infrastructure used by all test files.

---

## testConfig.ts

Test environment configuration constants:
- `TEST_PORT` — port for the test server (different from dev to avoid conflicts)
- `TEST_BASE_URL` — base URL for supertest requests
- Any other test-specific settings

## testData.ts

Sample data factories for creating test documents:
- Sample org objects with all fields populated
- Sample bucket objects
- Minimal org objects (only required fields)
- Service sub-documents

Used by tests to create consistent, predictable test data without repeating object literals.

## testSetup.ts

MongoDB memory server lifecycle management:
- `beforeAll` — starts in-memory MongoDB, connects Mongoose
- `afterEach` — clears all collections (fresh state per test)
- `afterAll` — disconnects Mongoose, stops MongoDB

This file is imported by integration tests to get a clean database for each test.

## testUtils.ts

Helper functions for common test operations:
- `createTestOrg(overrides)` — creates an org in the test DB with optional field overrides
- `createTestBucket(name)` — creates a bucket in the test DB
- `getCsrfAgent()` — creates a supertest agent with a valid CSRF token (fetches from `/api/csrf/restore` with cookie persistence)
- Other utilities for setting up test scenarios
