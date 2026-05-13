# src/tests/integration/

Integration tests that exercise full API routes via supertest + in-memory MongoDB.

---

## buckets-routes.test.ts

Tests all bucket CRUD API endpoints:
- `GET /api/buckets` — lists buckets
- `GET /api/buckets/:bucket/subdirs` — returns fixed subdirs
- `GET /api/buckets/:bucket/:subdir/files` — lists orgs
- `GET /api/buckets/:bucket/:subdir/:id` — returns hydrated HTML
- `POST /api/buckets/save` — saves field values
- `POST /api/buckets/move` — moves org between statuses
- `POST /api/buckets/submit` — records SFSG submission
- `POST /api/buckets/create-file` — creates/copies org
- `POST /api/buckets/create-bucket-empty` — creates empty bucket
- `DELETE /api/buckets/delete` — deletes single org
- `DELETE /api/buckets/:bucket` — deletes bucket and all orgs

Each test:
1. Creates test data (bucket + orgs)
2. Makes an HTTP request via supertest
3. Asserts response status, body structure, and database state

## create-bucket-spreadsheet-submit.test.ts

Tests the spreadsheet import + direct submit flow:
- Uploads a test spreadsheet buffer
- Verifies bucket and org documents are created
- Verifies the response includes org list for browser-side submission
- Tests error cases (missing file, missing bucket name, duplicate bucket)

---

## Test Pattern

```typescript
describe('POST /api/buckets/save', () => {
  it('saves org fields', async () => {
    const org = await createTestOrg({ name: 'Test' });
    const res = await agent
      .post('/api/buckets/save')
      .set('XSRF-Token', csrfToken)
      .send({ id: org._id, fields: { organization_name: 'Updated' } });
    expect(res.status).toBe(200);
    const updated = await Org.findById(org._id);
    expect(updated.name).toBe('Updated');
  });
});
```
