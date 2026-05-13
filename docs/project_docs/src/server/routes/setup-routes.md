# src/server/routes/setup-routes.ts

This module mounts all routes on the Express app. It's called from `server.ts` after pre-route middleware.

---

## Structure

```
setupRoutes(SERVER)
  ├── Dev-only doc routes (/docs/*)
  ├── Info routes (all environments)
  ├── Test routes (/test, /test/express, /test/404)
  ├── CSRF restore (/api/csrf/restore)
  ├── API router (/api/*) → api-router.ts
  └── Catch-all (*) → 404
```

---

## Key Lines

```typescript
if (process.env.NODE_ENV !== 'production') {
  SERVER.use('/docs/typedocs', express.static(...));
  SERVER.get('/docs/readme', ...);
  ...
}
```
Documentation routes only available in development. Serves markdown files and TypeDoc HTML. Excluded from production to avoid exposing internal docs.

```typescript
SERVER.get('/docs/spreadsheet-format', (_req, res) => {
  res.sendFile(join(__dirname, '../../../docs/spreadsheet-format.html'));
});
```
The one info route available in all environments — tells users what spreadsheet columns are expected.

```typescript
SERVER.get('/api/csrf/restore', (req, res) => {
  const csrfToken = req.csrfToken();
  res.cookie('XSRF-TOKEN', csrfToken);
  res.status(200).json({ 'XSRF-Token': csrfToken });
});
```
Generates a fresh CSRF token and returns it in both a cookie and the response body. The frontend calls this on page load to get a token for subsequent POST requests.

- `req.csrfToken()` — method added by the `csurf` middleware, generates a new token
- `res.cookie('XSRF-TOKEN', ...)` — sets a readable cookie the frontend can extract
- The response JSON also includes it for direct use in headers

```typescript
SERVER.use('/api', apiRouter);
```
Mounts all API routes under `/api`. The `apiRouter` further delegates to sub-routers.

```typescript
SERVER.use('*', routeCatchAll);
```
Catches any request that didn't match a route above. Creates a 404 error and passes it to the error handlers.
