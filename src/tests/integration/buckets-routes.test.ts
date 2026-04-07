// #region ===================== IMPORTS =======================================
import { connectTestDb, disconnectTestDb, clearTestDb } from '../_helpers/testConfig';
import { createTestApp, createAuthedAgent } from '../_helpers/testUtils';
import { mockOrg, mockBucket } from '../_helpers/testData';
import { Org } from '../../database/models/org.model';
import { Bucket } from '../../database/models/bucket.model';
import request from 'supertest';
// #endregion ------------------------------------------------------------------

// #region ====================== SETUP ========================================

const app = createTestApp();
let agent: ReturnType<typeof import('supertest').agent>;
let csrfToken: string;

beforeAll(async () => { await connectTestDb(); });
afterAll(async () => { await disconnectTestDb(); });
beforeEach(async () => {
  const authed = await createAuthedAgent(app);
  agent = authed.agent;
  csrfToken = authed.csrfToken;
});
afterEach(async () => { await clearTestDb(); });

// #endregion ------------------------------------------------------------------

// #region ====================== TESTS ========================================

describe('GET /api/buckets', () => {
  it('returns empty array when no buckets exist', async () => {
    const res = await agent.get('/api/buckets');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns list of bucket names', async () => {
    await Bucket.create(mockBucket);
    const res = await agent.get('/api/buckets');
    expect(res.status).toBe(200);
    expect(res.body).toContain('Test Bucket');
  });
});

describe('GET /api/buckets/:bucket/subdirs', () => {
  it('always returns the fixed three subdirectories', async () => {
    const res = await agent.get('/api/buckets/Test Bucket/subdirs');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(['incomplete', 'pending', 'complete']);
  });
});

describe('GET /api/buckets/:bucket/:subdir/files', () => {
  it('returns empty array when no orgs exist', async () => {
    const res = await agent.get('/api/buckets/Test Bucket/incomplete/files');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns orgs matching bucket and status', async () => {
    await Org.create(mockOrg);
    const res = await agent.get('/api/buckets/Test Bucket/incomplete/files');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Test Org');
    expect(res.body[0]._id).toBeDefined();
  });

  it('does not return orgs from a different status', async () => {
    await Org.create({ ...mockOrg, status: 'complete' });
    const res = await agent.get('/api/buckets/Test Bucket/incomplete/files');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });
});

describe('POST /api/buckets/save', () => {
  it('returns 400 if id or fields missing', async () => {
    const res = await agent.post('/api/buckets/save').set('XSRF-Token', csrfToken).send({});
    expect(res.status).toBe(400);
  });

  it('updates org name from fields', async () => {
    const org = await Org.create(mockOrg);
    const res = await agent.post('/api/buckets/save').set('XSRF-Token', csrfToken).send({
      id: org._id, fields: { organization_name: 'Updated Org Name' }
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const updated = await Org.findById(org._id);
    expect(updated?.name).toBe('Updated Org Name');
  });

  it('appends edited entry to history', async () => {
    const org = await Org.create(mockOrg);
    await agent.post('/api/buckets/save').set('XSRF-Token', csrfToken).send({
      id: org._id, fields: { organization_name: 'New Name' }
    });
    const updated = await Org.findById(org._id);
    expect(updated?.history.some(h => h.action === 'edited')).toBe(true);
  });
});

describe('POST /api/buckets/move', () => {
  it('returns 400 if required fields missing', async () => {
    const res = await agent.post('/api/buckets/move').set('XSRF-Token', csrfToken).send({});
    expect(res.status).toBe(400);
  });

  it('updates org status and bucket', async () => {
    const org = await Org.create(mockOrg);
    const res = await agent.post('/api/buckets/move').set('XSRF-Token', csrfToken).send({
      id: org._id, fromBucket: 'Test Bucket', fromSubdir: 'incomplete', toBucket: 'Test Bucket', toSubdir: 'pending'
    });
    expect(res.status).toBe(200);
    const updated = await Org.findById(org._id);
    expect(updated?.status).toBe('pending');
  });

  it('appends moved entry to history with detail', async () => {
    const org = await Org.create(mockOrg);
    await agent.post('/api/buckets/move').set('XSRF-Token', csrfToken).send({
      id: org._id, fromBucket: 'Test Bucket', fromSubdir: 'incomplete', toBucket: 'Test Bucket', toSubdir: 'pending'
    });
    const updated = await Org.findById(org._id);
    const moveEntry = updated?.history.find(h => h.action === 'moved');
    expect(moveEntry).toBeDefined();
    expect(moveEntry?.detail).toContain('incomplete');
    expect(moveEntry?.detail).toContain('pending');
  });
});

describe('POST /api/buckets/submit', () => {
  it('sets status to complete, writes sfsg_id, sets submittedAt', async () => {
    const org = await Org.create(mockOrg);
    const res = await agent.post('/api/buckets/submit').set('XSRF-Token', csrfToken).send({
      id: org._id, sfsg_id: 12345
    });
    expect(res.status).toBe(200);
    const updated = await Org.findById(org._id);
    expect(updated?.status).toBe('complete');
    expect(updated?.sfsg_id).toBe(12345);
    expect(updated?.submittedAt).toBeDefined();
  });

  it('appends submitted entry to history', async () => {
    const org = await Org.create(mockOrg);
    await agent.post('/api/buckets/submit').set('XSRF-Token', csrfToken).send({
      id: org._id, sfsg_id: 12345
    });
    const updated = await Org.findById(org._id);
    expect(updated?.history.some(h => h.action === 'submitted')).toBe(true);
  });
});

describe('DELETE /api/buckets/delete', () => {
  it('returns 400 if id missing', async () => {
    const res = await agent.delete('/api/buckets/delete').set('XSRF-Token', csrfToken).send({});
    expect(res.status).toBe(400);
  });

  it('deletes the org', async () => {
    const org = await Org.create(mockOrg);
    const res = await agent.delete('/api/buckets/delete').set('XSRF-Token', csrfToken).send({ id: org._id });
    expect(res.status).toBe(200);
    const found = await Org.findById(org._id);
    expect(found).toBeNull();
  });
});

describe('DELETE /api/buckets/:bucket', () => {
  it('deletes all orgs and the bucket document', async () => {
    await Bucket.create(mockBucket);
    await Org.create(mockOrg);
    await Org.create({ ...mockOrg, name: 'Second Org' });

    const res = await agent.delete('/api/buckets/Test Bucket').set('XSRF-Token', csrfToken);
    expect(res.status).toBe(200);

    const orgs = await Org.find({ bucket: 'Test Bucket' });
    const bucket = await Bucket.findOne({ name: 'Test Bucket' });
    expect(orgs).toHaveLength(0);
    expect(bucket).toBeNull();
  });
});

describe('POST /api/buckets/create-file', () => {
  it('creates a blank org', async () => {
    const res = await agent.post('/api/buckets/create-file').set('XSRF-Token', csrfToken).send({
      bucket: 'Test Bucket', subdir: 'incomplete', filename: 'New Org'
    });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('New Org');
    const org = await Org.findById(res.body._id);
    expect(org).not.toBeNull();
  });

  it('copies an existing org with auto-generated name when no filename given', async () => {
    const source = await Org.create(mockOrg);
    const res = await agent.post('/api/buckets/create-file').set('XSRF-Token', csrfToken).send({
      bucket: 'Test Bucket', subdir: 'incomplete', filename: '', fromId: source._id
    });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Copy of Test Org');
  });

  it('copies an existing org with user-provided name', async () => {
    const source = await Org.create(mockOrg);
    const res = await agent.post('/api/buckets/create-file').set('XSRF-Token', csrfToken).send({
      bucket: 'Test Bucket', subdir: 'incomplete', filename: 'My Custom Copy', fromId: source._id
    });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('My Custom Copy');
  });
});

// #endregion ------------------------------------------------------------------
