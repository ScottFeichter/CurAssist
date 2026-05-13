# src/server/middlewares/custom-errors/error-global-catch-all.ts

Catches any error that wasn't handled by the specific status code handlers. This is the safety net — if an unexpected error type reaches here, it gets wrapped in a 500 response.

---

## Line-by-Line Breakdown

```typescript
if (err instanceof BaseCustomError) {
  return next(err);
}
```
If the error is already a `BaseCustomError`, it means it passed through all the specific handlers without being caught (shouldn't happen, but defensive). Passes it to the formatter.

```typescript
const unexpectedError = new BaseCustomError(err.message, {
  title: 'Internal Server Error',
  status: 500,
  cause: err
});
next(unexpectedError);
```
For non-`BaseCustomError` errors (e.g. a raw `TypeError`, an unhandled promise rejection, a third-party library error):
1. Logs the full error details (name, message, stack, URL, method)
2. Wraps it in a `BaseCustomError` with status 500
3. Preserves the original error as `cause` for debugging
4. Passes to the formatter for rendering

This ensures the client always gets a properly formatted error response, never a raw stack trace or unstructured error.
