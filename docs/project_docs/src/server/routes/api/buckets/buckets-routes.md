# src/server/routes/api/buckets/buckets-routes.ts

This is the main API route file — it defines all bucket and org CRUD endpoints. This is where most of the application's HTTP logic lives.

---

## Overview

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/` | List all bucket names |
| GET | `/:bucket/subdirs` | Return fixed subdirectory list |
| GET | `/:bucket/:subdir/files` | List orgs in a bucket/status |
| GET | `/:bucket/:subdir/:id` | Get hydrated template HTML for an org |
| POST | `/save` | Save org field values from the form |
| POST | `/move` | Move org between buckets/statuses |
| POST | `/submit` | Record SFSG submission, move to complete |
| POST | `/create-file` | Create blank org or copy existing |
| POST | `/import-file` | Import org from SFSG by ID |
| POST | `/import-file-resolve` | Resolve duplicate on import (overwrite/rename) |
| POST | `/create-bucket-empty` | Create named empty bucket |
| POST | `/create-bucket-spreadsheet` | Create bucket from spreadsheet |
| POST | `/create-bucket-spreadsheet-submit` | Create bucket + return orgs for SFSG submission |
| POST | `/build-report` | Build combined import report xlsx |
| DELETE | `/delete` | Delete a single org |
| DELETE | `/:bucket` | Delete entire bucket and all orgs |

---

## Key Patterns

### Multer for File Uploads

```typescript
const upload = multer({ storage: multer.memoryStorage() });
```
Configures multer to store uploaded files in memory (as a Buffer) rather than writing to disk. Used for spreadsheet uploads:
```typescript
bucketsRouter.post('/create-bucket-spreadsheet', upload.single('spreadsheet'), ...)
```
`upload.single('spreadsheet')` extracts the file from the multipart form data and puts it on `req.file`.

### Error Delegation

Every route wraps its logic in try/catch and calls `next(error)` on failure:
```typescript
} catch (error) {
  next(error);
}
```
This passes errors to the post-route error handlers rather than crashing or sending raw error messages.

### timeToMinutes Helper

```typescript
function timeToMinutes(timeStr: string): number {
  const [hh, mm] = timeStr.split(':').map(Number);
  return (hh || 0) * 60 + (mm || 0);
}
```
Converts "HH:MM" strings from the form's time inputs to minutes-from-midnight for database storage. E.g. "09:30" → 570.

---

## Route Details

### GET / (List Buckets)

```typescript
const buckets = await Bucket.find().sort({ createdAt: -1 }).select('name');
res.json(buckets.map(b => b.name));
```
Returns bucket names sorted newest-first. `.select('name')` only fetches the name field (optimization).

### GET /:bucket/:subdir/:id (Hydrate Template)

```typescript
const org = await Org.findById(req.params.id);
const html = await hydrateTemplate(org);
res.send(html);
```
Fetches the org from MongoDB, injects its data into the HTML template, and sends the populated HTML. This is what the iframe displays.

### POST /save (Save Form Data)

The most complex route. Receives the collector output from the frontend and maps it back to the org document:
- Scalar fields (name, email, etc.) → direct assignment
- Phones array → filter empty, map to `{ number, service_type }`
- Addresses array → map to `{ address_1, city, state_province, postal_code }`
- Hours object → convert day keys (M, T, W...) to `{ day, opens_at, closes_at }`
- Spreadsheet service → update the embedded `spreadsheetService` sub-document
- Org services → rebuild the entire `services[]` array from the form data

`org.markModified('field')` tells Mongoose that a nested object changed (Mongoose can't detect changes inside mixed-type fields automatically).

### POST /submit

```typescript
org.sfsg_id = sfsg_id;
org.status = 'complete';
org.submittedAt = new Date();
org.history.push({ action: 'submitted', ... });
```
Called after the browser successfully submits to SFSG. Records the SFSG-assigned ID, moves to complete, and logs the submission in history.

### POST /import-file

Fetches an org from the SFSG API and creates a local copy:
1. Calls `https://www.sfserviceguide.org/api/v2/resources/:id`
2. Maps the SFSG response to our Org schema
3. Checks for duplicate names in the same bucket (returns 409 if found)
4. Creates the Org document

### POST /create-bucket-spreadsheet-submit

Combines bucket creation with SFSG submission preparation:
1. Creates the bucket and org documents (same as `create-bucket-spreadsheet`)
2. Returns the list of created orgs so the browser can loop through and submit each one to SFSG
3. Returns the workbook as base64 so the browser can send it back with SFSG results for the combined report

### DELETE /:bucket

```typescript
await Org.deleteMany({ bucket });
await Bucket.deleteOne({ name: bucket });
```
Deletes all orgs in the bucket, then the bucket document itself. Cascading delete.
