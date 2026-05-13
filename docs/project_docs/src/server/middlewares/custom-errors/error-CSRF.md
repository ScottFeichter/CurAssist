# src/server/middlewares/custom-errors/error-CSRF.ts

Handles CSRF token validation failures. Registered immediately after the `csurf` middleware in `setup-pre-route-middleware.ts`.

---

## How It Works

```typescript
if (err.code === 'EBADCSRFTOKEN') {
```
The `csurf` middleware sets `err.code = 'EBADCSRFTOKEN'` when a POST request has an invalid or missing CSRF token.

When detected:
1. Creates a `BaseCustomError` with status 403 (Forbidden)
2. In development, includes debugging details (which cookie/header was provided)
3. Parses the stack trace to show only application frames (filters out `node_modules`)
4. Passes the error to `next()` for the error formatter to render

If the error is NOT a CSRF error, passes it through unchanged via `next(err)`.

---

## Common Trigger

This fires when the frontend makes a POST request without:
- `credentials: 'include'` in the fetch options (cookie not sent)
- The `XSRF-Token` header (token not included)
- A valid token (expired or tampered)
