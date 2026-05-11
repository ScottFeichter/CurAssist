# src/public/frontend/Scripts/submitUpdateOrg.js

Submits a change request to update an existing org in the SF Service Guide.

---

## How It Works

```javascript
async function submitUpdateOrg(payload, existingSfsgId) {
  const { orgBody } = transformNewOrg(payload);
  const resource = orgBody.resources[0];
  const changeRequestBody = { change_request: { ...resource } };
  const res = await fetch(`${SF_API}/resources/${existingSfsgId}/change_requests`, { ... });
  return existingSfsgId;
}
```

1. Transforms the payload using the same `transformNewOrg()` function
2. Wraps the resource fields in `{ change_request: { ... } }`
3. POSTs to `/api/sf/resources/{id}/change_requests`
4. Returns the existing sfsg_id (unchanged — it's an update, not a create)

---

## When It's Used

Triggered when submitting an org that already has an `sfsg_id` and the user chooses "Update Existing" in the warning modal. The change request goes into "pending" status on SFSG's side for review.
