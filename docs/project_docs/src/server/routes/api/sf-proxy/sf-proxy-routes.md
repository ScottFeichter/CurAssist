# src/server/routes/api/sf-proxy/sf-proxy-routes.ts

This module proxies requests to the SF Service Guide API for server-side logging and observability.

---

## Why This Exists

The SFSG API has fully open CORS and requires no authentication. The browser could call it directly. This proxy exists solely so we can:
- Log request payloads in our server logs
- Log SFSG response status and body
- Debug submission issues without relying on browser console

---

## Line-by-Line Breakdown

```typescript
const SF_BASE = 'https://www.sfserviceguide.org/api';
```
The SFSG API base URL. All proxy requests are forwarded here.

### GET /v2/resources/:id

```typescript
sfProxyRouter.get('/v2/resources/:id', async (req, res) => {
  const url = `${SF_BASE}/v2/resources/${req.params.id}`;
  const sfRes = await fetch(url, { headers: { 'Accept': 'application/json', ... } });
  const data = await sfRes.json();
  res.status(sfRes.status).json(data);
});
```
Proxies a read request for a single org. The browser calls `/api/sf/v2/resources/123` → this forwards to `https://www.sfserviceguide.org/api/v2/resources/123` and returns the response.

Note: SFSG uses `/v2/` for read endpoints but unversioned `/api/` for write endpoints.

### POST /*

```typescript
sfProxyRouter.post('/*', async (req, res) => {
  const sfPath = (req.params as any)[0] || '';
  const url = `${SF_BASE}/${sfPath}`;
```
Catches all POST requests to `/api/sf/*`. The wildcard `*` captures the rest of the path. E.g. `/api/sf/resources/123/services` → `sfPath = 'resources/123/services'`.

```typescript
  const sfRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(req.body)
  });
```
Forwards the request body as-is to SFSG. Only `Content-Type: application/json` is needed — no auth headers.

```typescript
  const responseText = await sfRes.text();
  let data;
  try { data = JSON.parse(responseText); } catch { data = { raw: responseText.substring(0, 2000) }; }
```
Reads the response as text first, then tries to parse as JSON. If SFSG returns non-JSON (e.g. HTML error page on 500), captures the raw text (truncated to 2000 chars) for logging.

```typescript
  res.status(sfRes.status).json(data);
```
Passes the SFSG status code and response body back to the browser unchanged.

Error handling returns `502 Bad Gateway` if the fetch itself fails (network error, DNS failure, etc.).
