# src/server/middlewares/custom-errors/_error-formatter-helpers/

These helper functions are used by `_error-formatter.ts` to build the transaction report and render the error response.

---

## Files (in execution order)

### 00_createTxReport.ts
Orchestrates the transaction report creation by calling the other helpers:
```typescript
export const createTxReport = (req, err) => {
  const responseTimeMs = getResponseTimeMs(req.startTime);
  const parsedStack = parseStack(err.stack);
  const importantHeaders = getImportantHeaders(req.headers);
  const requestDetails = getRequestDetails(req, importantHeaders);
  const responseDetails = getResponseDetails(err, responseTimeMs, parsedStack);
  return { REQUEST: requestDetails, RESPONSE: responseDetails };
};
```

### 01_getResponseTimeMs.ts
Calculates elapsed time since request start using `process.hrtime()`:
```typescript
const diff = process.hrtime(startTime);
return (diff[0] * 1e3 + diff[1] / 1e6).toFixed(2) + 'ms';
```

### 02_parseStack.ts
Parses an Error stack trace string into structured frames:
- Filters out `node_modules` frames
- Extracts function name and file location
- Strips the `process.cwd()` prefix for readability

### 03_getImportantHeaders.ts
Extracts relevant headers from the request for logging (content-type, authorization, user-agent, origin, referer). Excludes noisy headers like accept-encoding.

### 04_parseUserAgent.ts
Parses the User-Agent string to extract browser name, version, and OS. Used for debugging client-specific issues.

### 05_getRequestDetails.ts
Builds the REQUEST section of the transaction report:
```typescript
{ method, url, params, query, body, headers }
```

### 06_getResponseDetails.ts
Builds the RESPONSE section:
```typescript
{ name, title, status, message, time, errors, cause, trace }
```

### 10_getErrorPagePath.ts
Maps a status code to an HTML error page file path:
```typescript
status 404 → 'backendHTML/error-404.html'
status 500 → 'backendHTML/error-500.html'
unknown    → 'backendHTML/error-default.html'
```

### 11_selectViewHTML.ts
Returns the view filename based on status code. Falls back to `error-default.html` for unhandled codes.

### 20_renderErrorResponse.ts
Sends the final response:
```typescript
res.status(txReport.RESPONSE.status).render(errorPagePath, { txReport, script });
```
Renders the HTML error page via EJS with the transaction report data injected. Includes a `<script>` tag that calls `displayTxReport()` to show details in the browser.

### normalizeValue.ts
Utility that normalizes values for safe display (handles undefined, null, objects, arrays).

### sanitizeHeaders.ts
Strips sensitive header values (authorization tokens, cookies) before logging.

### _scratch.ts
Scratch/experimentation file — not used in production.
