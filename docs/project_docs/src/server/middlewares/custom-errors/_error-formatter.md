# src/server/middlewares/custom-errors/_error-formatter.ts

The final error middleware in the chain. It takes a `BaseCustomError` and sends the formatted response to the client.

---

## Line-by-Line Breakdown

```typescript
export const _errorFormatter = ((err, req, res, _next) => {
```
Four-parameter signature marks this as an Express error handler. It's the last middleware — it always sends a response (never calls `next()`).

```typescript
  const txReport = createTxReport(req, err);
```
Builds a transaction report containing full request details (method, URL, headers, body) and response details (status, message, timing, stack trace).

```typescript
  const errorPagePath = getErrorPagePath(err.status);
```
Resolves the HTML error page file path based on the status code (e.g. status 404 → `views/backendHTML/error-404.html`).

```typescript
  res.on('finish', () => {
    log.error("Transaction Report", txReport);
  });
```
Logs the full transaction report to Winston AFTER the response is sent. Using the `finish` event ensures logging doesn't delay the response.

```typescript
  renderErrorResponse(res, txReport, errorPagePath);
```
Sets the status code and renders the error page HTML with the transaction report data injected via EJS. The page includes a `<script>` that calls `displayTxReport()` to show error details in the browser (development only).
