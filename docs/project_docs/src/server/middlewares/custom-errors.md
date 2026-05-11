# src/server/middlewares/custom-errors/

This directory contains the error handling system — a base error class, specific HTTP error handlers, and the error formatter.

---

## Architecture

```
BaseCustomError (base class)
  ├── Thrown by routes/middleware with a status code
  ├── Caught by specific error handlers (error400, error404, etc.)
  └── Formatted by _errorFormatter (final middleware)
```

---

## Files

### base-custom-error.ts
Defines `BaseCustomError` — extends `Error` with:
- `title` — human-readable error title
- `status` — HTTP status code
- `errors` — structured error details object

All custom errors in the app extend or instantiate this class.

### __error-index.ts
Barrel file that re-exports all error handlers for clean imports in `setup-post-route-middleware.ts`.

### _error-formatter.ts
The final error middleware. Takes a `BaseCustomError` and:
1. Calculates response time from `req.startTime`
2. Parses the stack trace
3. Builds a transaction report (request + response details)
4. Logs to Winston
5. Sends JSON or HTML response based on `Accept` header

### error-CSRF.ts
Handles CSRF token validation failures (invalid/missing token). Returns 403.

### error-global-catch-all.ts
Catches any error that isn't a `BaseCustomError` — wraps it in a 500 response.

### error-sequelize-constraint.ts / error-sequelize-validator.ts
Handle Sequelize-specific errors (historical — from PostgreSQL era). Still registered in case similar errors occur.

### error400 through error504
Each file handles one specific HTTP status code. Pattern:
```typescript
export const error404_NotFound = (err, req, res, next) => {
  if (err.status !== 404) return next(err);
  // Format and send 404 response
};
```

### _error-formatter-helpers/
Sub-directory with helper functions for the error formatter:
- `createTxReport` — builds the transaction report object
- `getResponseTimeMs` — calculates elapsed time
- `parseStack` — parses Error stack traces into structured frames
- `getImportantHeaders` — extracts relevant headers for logging
- `parseUserAgent` — parses browser/OS info from User-Agent
- `getRequestDetails` / `getResponseDetails` — structure request/response info
- `getErrorPagePath` — resolves the HTML error page file path
- `selectViewHTML` — chooses which error page to render
- `renderErrorResponse` — sends the final response
- `normalizeValue` / `sanitizeHeaders` — data cleaning utilities
