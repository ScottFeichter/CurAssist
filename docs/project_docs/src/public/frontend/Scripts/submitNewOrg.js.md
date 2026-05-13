# src/public/frontend/Scripts/submitNewOrg.js

This module handles the three-step submission of a new organization to the SF Service Guide API.

---

## The Three Steps

### Step 1: Create Org
```javascript
POST /api/sf/resources
Body: { resources: [{ name, addresses, phones, notes, schedule, ... }] }
```
Creates the org with all fields SFSG accepts on create. Returns the new org's `id`.

### Step 2: Create Services
```javascript
POST /api/sf/resources/{orgId}/services
Body: { services: [{ id: -2, name, categories, eligibilities, ... }] }
```
Posts all services to the newly created org. Services get negative temporary IDs (SFSG convention for new items). SFSG assigns real IDs and returns them.

After creating services, also sends change_requests for service fields SFSG ignores on create (`short_description`, `internal_note`).

### Step 3: Change Request for Org
```javascript
POST /api/sf/resources/{orgId}/change_requests
Body: { change_request: { alternate_name, internal_note } }
```
Sets fields that SFSG silently ignores on the create endpoint. These go into "pending" status on SFSG's side.

---

## Return Value

Returns the SFSG-assigned org ID (number). This is stored in our database as `sfsg_id` after successful submission.

---

## Error Handling

If Step 1 fails, throws immediately (no org was created).
If Step 2 fails, throws with a message noting the org was created but services failed — the org exists on SFSG but is incomplete.
If Step 3 fails, logs but doesn't throw — the org and services exist, just the change request didn't go through.

---

## Usage

Called from:
- `submitFormData()` in `app.js` (single file submit)
- `processCreateBucket()` in `app.js` (batch direct submit loop)
