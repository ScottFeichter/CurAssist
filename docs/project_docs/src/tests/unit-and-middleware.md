# src/tests/unit/

Unit tests that test individual functions in isolation (no HTTP, no database).

---

## bucket-sanitizers.test.ts

Tests all sanitizer functions from `bucket-sanitizers.ts`:
- `sanitizeName` — verifies title case conversion
- `sanitizeOrganizationPhones` — verifies phone formatting (10 digits → XXX-XXX-XXXX)
- `sanitizeState` — verifies uppercase conversion
- `sanitizeAddress` / `sanitizeCity` — verifies title case
- `sanitizePhoneName` — verifies sentence case
- `sanitizeServiceCategories` — verifies comma-split into array
- Edge cases: null, undefined, empty string, already formatted

## hydrateTemplate.test.ts

Tests the `hydrateTemplate()` function from `bucket-helpers.ts`:
- Verifies org name is injected into the correct input
- Verifies addresses are rendered as location rows
- Verifies phones are rendered as phone rows
- Verifies schedule times are injected into time inputs
- Verifies services are cloned and populated
- Verifies spreadsheet service fields are populated
- Verifies `data-org-id` is stamped on the body
- Tests with minimal org (only required fields)
- Tests with fully populated org (all fields)

## transform.test.ts

Tests the `transformNewOrg()` and `transformService()` functions from `transform.js`:
- Verifies field name mapping (organization_description → long_description)
- Verifies phone formatting (strips non-digits, adds service_type)
- Verifies category/eligibility resolution (names → objects with IDs)
- Verifies schedule transformation (day keys → schedule_days array)
- Verifies empty fields are omitted from output
- Verifies services get negative IDs

---

# src/tests/middleware/jwt.service.test.ts

Tests JWT token creation and verification:
- `generateToken` — creates a valid JWT with expected payload
- `verifyToken` — decodes a valid token and returns payload
- `verifyToken` — rejects expired tokens
- `verifyToken` — rejects tampered tokens
- `verifyToken` — rejects tokens signed with wrong secret
