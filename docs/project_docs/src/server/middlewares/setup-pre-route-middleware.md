# src/server/middlewares/setup-pre-route-middleware.ts

This module registers all middleware that runs BEFORE route handlers. Order matters — Express processes middleware in registration order.

---

## Middleware Order

```
1. View Engine Setup
2. Timing (startTime, timeout)
3. Parsing (cookies, JSON body, URL-encoded, compression)
4. Logging (Morgan)
5. Security (CORS, Helmet, CSRF)
6. Rate Limiting
7. Authentication (restore session, refresh token, check expiry)
8. Static Files (frontend assets)
```

---

## Line-by-Line Breakdown

### View Engine

```typescript
SERVER.set('views', join(__dirname, '../../views'));
SERVER.set('view engine', 'html');
SERVER.engine('html', require('ejs').renderFile);
```
- Sets the views directory to `src/views/` (compiled: `dist/views/`)
- Registers `.html` files as a view engine using EJS to render them
- This allows `res.render('error-404')` to serve `views/backendHTML/error-404.html`

---

### Timing Middleware

```typescript
SERVER.use((req, _res, next) => {
  (req as any).startTime = process.hrtime();
  next();
});
```
Stamps a high-resolution timestamp on every request. Used later by the error formatter to calculate response time.

```typescript
SERVER.use((req, res, next) => {
  const noTimeoutRoutes = ['/api/buckets/create-bucket-spreadsheet', '/api/buckets/import'];
  if (noTimeoutRoutes.some(r => req.path.startsWith(r))) return next();
  timeout('5s')(req, res, next);
});
```
Applies a 5-second timeout to most routes. Long-running routes (spreadsheet import, SFSG import) skip the timeout because they may take 30+ seconds for large batches.

```typescript
SERVER.use((req, res, next) => {
  if (!req.timedout) next();
});
```
After the timeout middleware, checks if the request already timed out. If it did, stops processing (prevents "headers already sent" errors).

---

### Parsing Middleware

```typescript
SERVER.use(cookieParser());
```
Parses the `Cookie` header into `req.cookies` object. Required for CSRF token validation (token is stored in a cookie).

```typescript
SERVER.use(express.json({ limit: '10mb' }));
SERVER.use(express.urlencoded({ extended: true, limit: '10mb' }));
```
Parses JSON and URL-encoded request bodies. Note: there's also a `50mb` JSON parser in `server.ts` — the one registered first wins for a given request. The `50mb` one in `server.ts` runs before this one.

```typescript
SERVER.use(compression());
```
Gzip-compresses responses. Reduces bandwidth significantly for HTML templates and JSON responses.

---

### Logging

```typescript
SERVER.use(morganMiddleware);
```
Morgan logs every HTTP request in a structured format. Configured in `logger-morganMiddleware.ts` to write to Winston.

---

### Security

```typescript
SERVER.use(cors({
  origin: ['http://localhost:5555', 'http://127.0.0.1:5555', 'file://', 'http://localhost:5432'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'XSRF-Token'],
  credentials: true
}));
```
Restrictive CORS config (overrides the permissive `cors()` in `server.ts`):
- Only allows requests from listed origins
- `credentials: true` — allows cookies to be sent cross-origin (needed for CSRF)
- `XSRF-Token` in `allowedHeaders` — allows the CSRF token header

```typescript
SERVER.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
```
Helmet sets security headers. `crossOriginResourcePolicy: "cross-origin"` allows resources (images, scripts) to be loaded from other origins.

```typescript
const csrfProtection = csrf({
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'lax' : undefined,
    httpOnly: true
  },
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS']
});
```
CSRF protection config:
- Token stored in an `httpOnly` cookie (JavaScript can't read it directly)
- `secure: true` in production (cookie only sent over HTTPS)
- `sameSite: 'lax'` in production (cookie sent on same-site requests and top-level navigations)
- GET/HEAD/OPTIONS are exempt (they shouldn't modify state)

```typescript
SERVER.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api/sf')) return next();
  (csrfProtection as express.RequestHandler)(req, res, next);
});
```
Applies CSRF to all routes EXCEPT the SF proxy (`/api/sf/*`). The proxy just forwards to SFSG — no state modification on our server.

---

### Rate Limiting

```typescript
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300
});
SERVER.use(generalLimiter);
```
Limits each IP to 300 requests per 15-minute window. Prevents abuse/scraping. Returns `429 Too Many Requests` when exceeded.

---

### Authentication

```typescript
SERVER.use(restoreAuthentication);
SERVER.use(refreshAuthenticationToken);
SERVER.use(checkSessionExpiry);
```
Three middleware that handle JWT-based auth:
1. `restoreAuthentication` — reads JWT from cookie, attaches user to `req`
2. `refreshAuthenticationToken` — issues a new token if the current one is near expiry
3. `checkSessionExpiry` — rejects requests with expired sessions

(Currently minimal — auth is scaffolded but not enforced on routes.)

---

### Static Files

```typescript
SERVER.use(express.static(join(__dirname, '../../public/frontend')));
```
Serves the frontend UI files (index.html, app.js, styles.css, Scripts/) as static assets. When a browser requests `/app.js`, Express serves `dist/public/frontend/app.js` directly without hitting any route handler.
