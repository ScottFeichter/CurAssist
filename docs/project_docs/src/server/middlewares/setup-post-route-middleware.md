# src/server/middlewares/setup-post-route-middleware.ts

This module registers all error-handling middleware that runs AFTER route handlers. These catch errors thrown or passed via `next(error)` from routes.

---

## How Express Error Handling Works

Express identifies error handlers by their function signature — they have **4 parameters**: `(err, req, res, next)`. Regular middleware has 3. When a route calls `next(error)`, Express skips all regular middleware and jumps to the first error handler.

---

## Error Handler Order

```
1. Sequelize errors (database constraint/validation)
2. Client errors (4xx)
3. Server errors (5xx)
4. 404 Not Found (after all routes — nothing matched)
5. Global catch-all (unexpected errors)
6. Error formatter (final — formats and sends the response)
```

Order matters:
- More specific handlers first (Sequelize, specific HTTP codes)
- Generic handlers last (catch-all, formatter)
- Each handler either handles the error (sends a response) or calls `next(error)` to pass it down

---

## Line-by-Line Breakdown

```typescript
SERVER.use(errorSequelizeConstraint);
SERVER.use(errorSequelizeValidator);
```
Catches database errors (unique constraint violations, validation failures). Historical — from when the app used PostgreSQL/Sequelize. Still registered in case Mongoose throws similar errors.

```typescript
SERVER.use(error400_BadRequest);
SERVER.use(error401_Unauthorized);
SERVER.use(error402_PaymentRequired);
SERVER.use(error403_Forbidden);
SERVER.use(error408_RequestTimeout);
SERVER.use(error422_Validation);
```
Each checks if the error's status matches its code. If yes, formats and sends the response. If no, calls `next(error)` to pass it to the next handler.

```typescript
SERVER.use(error500_InternalServer);
SERVER.use(error501_NotImplemented);
SERVER.use(error502_BadGateway);
SERVER.use(error503_ServiceUnavailable);
SERVER.use(error504_GatewayTimeout);
```
Server error handlers — same pattern.

```typescript
SERVER.use(error404_NotFound);
```
Catches errors with status 404. Must be after all routes — if no route matched and the catch-all created a 404 error, this handles it.

```typescript
SERVER.use(error_globalCatchAll);
```
Catches any error that didn't match a specific handler above. Wraps it in a 500 response.

```typescript
SERVER.use(_errorFormatter);
```
The final middleware. Takes whatever error object has been built up and formats it into a consistent JSON/HTML response. Must be last — it always sends a response (never calls `next()`).

---

## Error Flow Example

```
Route throws: new BaseCustomError("Not Found", { status: 404 })
  → errorSequelizeConstraint: not a Sequelize error → next(error)
  → errorSequelizeValidator: not a Sequelize error → next(error)
  → error400_BadRequest: status !== 400 → next(error)
  → ... (skips 401, 402, 403, 408, 422, 500, 501, 502, 503, 504)
  → error404_NotFound: status === 404 → handles it
  → _errorFormatter: formats and sends response
```
