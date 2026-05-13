# src/views/backendHTML/

This directory contains HTML error pages and test pages served by the Express view engine.

---

## Files

| File | Purpose |
|------|---------|
| `_root.html` | Dev test page with links to all endpoints and documentation |
| `demo-test-express.html` | Express routing test page |
| `demo-api-csrf-restore.html` | CSRF token restoration demo |
| `demo-api-demousers.html` | Demo users API test page |
| `demo-test-database.html` | Database connectivity test page |
| `error-400.html` | 400 Bad Request error page |
| `error-401.html` | 401 Unauthorized error page |
| `error-402.html` | 402 Payment Required error page |
| `error-403.html` | 403 Forbidden error page |
| `error-404.html` | 404 Not Found error page |
| `error-408.html` | 408 Request Timeout error page |
| `error-422.html` | 422 Validation Error page |
| `error-500.html` | 500 Internal Server Error page |
| `error-501.html` | 501 Not Implemented error page |
| `error-502.html` | 502 Bad Gateway error page |
| `error-503.html` | 503 Service Unavailable error page |
| `error-504.html` | 504 Gateway Timeout error page |
| `error-default.html` | Fallback error page for unhandled status codes |

Error pages are rendered by the error formatter when the client accepts HTML. They display the error status, message, and (in development) stack trace details.
