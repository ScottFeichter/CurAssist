# src/public/frontend/Scripts/submitService.js

Posts a standalone service to an existing org in the SF Service Guide.

---

## How It Works

```javascript
async function submitService(payload) {
  const { orgId, servicesBody } = transformServiceOnly(payload);
  const res = await fetch(`${SF_API}/resources/${orgId}/services`, { ... });
}
```

1. Calls `transformServiceOnly()` to get the SFSG org ID and formatted service body
2. POSTs to `/api/sf/resources/{orgId}/services`
3. Returns the created service data on success, throws on failure

Used when the form is in "Service" mode (spreadsheet service toggle) — the service is attached to an existing SFSG org identified by `service_belongs_to_org`.
