# src/server/routes/setups/catchAll-unmatched-routes.ts

This module defines the route catch-all — the last route registered, which handles any request that didn't match a defined route.

---

## Line-by-Line Breakdown

```typescript
export const routeCatchAll = (req: Request, res: Response, next: NextFunction) => {
```
A standard Express middleware function (3 params = regular middleware, not error handler).

```typescript
  const notFoundError = new BaseCustomError("Not Found", {
    title: "Resource Not Found",
    status: 404,
    errors: {
      message: "The requested resource couldn't be found",
      path: req.originalUrl,
      method: req.method
    }
  });
```
Creates a structured error object using the project's custom error class:
- `status: 404` — tells the error handlers which HTTP status to send
- `path: req.originalUrl` — includes the URL that was requested (for debugging)
- `method: req.method` — includes GET/POST/etc.

```typescript
  next(notFoundError);
```
Passes the error to the next middleware. Since this is an error object, Express skips regular middleware and jumps to the error handlers in `setup-post-route-middleware.ts`.

---

## Why Not Just `res.status(404).send()`?

By creating a `BaseCustomError` and passing it through the error handler chain, the response gets:
- Consistent formatting (same structure as all other errors)
- Logging (error handlers log to Winston)
- Proper HTML error page (if the client accepts HTML)

This keeps error handling centralized rather than scattered across routes.

---

## Registration

In `setup-routes.ts`:
```typescript
SERVER.use('*', routeCatchAll);
```
The `*` wildcard matches any path. Since it's registered last, it only fires if no previous route matched.
