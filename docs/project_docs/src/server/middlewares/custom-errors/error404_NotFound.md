# src/server/middlewares/custom-errors/error404_NotFound.ts

Handles 404 Not Found errors. Representative of all status-specific error handlers (error400, error401, etc.) — they all follow the same pattern.

---

## Line-by-Line Breakdown

```typescript
export const error404_NotFound = (err, req, res, next) => {
```
Four-parameter signature = Express error handler.

```typescript
  const is404Error = (
    (err as any).status === 404 ||
    (err as any).statusCode === 404 ||
    err.name === 'NotFoundError' ||
    (err as any).code === 'ENOENT' ||
    (err as any).type === 'resource.notfound' ||
    (err as any).reason === 'document_not_found' ||
    ...
  );
```
Checks multiple indicators that this is a 404 error. Different libraries/frameworks signal "not found" in different ways:
- `status: 404` — our own `BaseCustomError`
- `code: 'ENOENT'` — Node.js filesystem "file not found"
- `reason: 'document_not_found'` — database query returned nothing

```typescript
  if (is404Error) {
    if (err instanceof BaseCustomError && err.status === 404) {
      return next(err);  // Already formatted, pass to formatter
    } else {
      const error = new BaseCustomError("Not Found", { status: 404, ... });
      return next(error);  // Wrap in BaseCustomError, pass to formatter
    }
  }
  return next(err);  // Not a 404, pass to next handler
```
Three paths:
1. Already a `BaseCustomError` with 404 → pass through to formatter
2. Some other error type that indicates 404 → wrap in `BaseCustomError` and pass
3. Not a 404 at all → pass unchanged to the next handler in the chain

---

## All Status-Specific Handlers

Every `errorXXX_*.ts` file follows this exact pattern — only the status code and detection logic differ:

| File | Status | Detects |
|------|--------|---------|
| `error400_BadRequest.ts` | 400 | Malformed requests, validation failures |
| `error401_Unauthorized.ts` | 401 | Missing/invalid authentication |
| `error402_PaymentRequired.ts` | 402 | Payment issues |
| `error403_Forbidden.ts` | 403 | Authorization failures |
| `error404_NotFound.ts` | 404 | Resource not found |
| `error408_RequestTimeout.ts` | 408 | Request exceeded timeout |
| `error422_Validation.ts` | 422 | Data validation failures |
| `error500_InternalServer.ts` | 500 | Generic server errors |
| `error501_NotImplemented.ts` | 501 | Unimplemented features |
| `error502_BadGateway.ts` | 502 | Upstream service failures |
| `error503_ServiceUnavailable.ts` | 503 | Service temporarily down |
| `error504_GatewayTimeout.ts` | 504 | Upstream timeout |
| `error-sequelize-constraint.ts` | 409/500 | DB unique constraint violations |
| `error-sequelize-validator.ts` | 422 | DB schema validation errors |
