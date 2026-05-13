// #region ===================== IMPORTS =======================================
import { connectTestDb, disconnectTestDb, clearTestDb } from '../_helpers/testConfig';
import { createTestApp, createAuthedAgent } from '../_helpers/testUtils';
import { mockOrg, mockBucket } from '../_helpers/testData';
import { Org } from '../../database/models/org.model';
import { Bucket } from '../../database/models/bucket.model';
import * as XLSX from 'xlsx';
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

// ── GET /:bucket/:subdir/:id — hydrated template ─────────────────────────────

describe('GET /api/buckets/:bucket/:subdir/:id', () => {
  it('returns HTML containing the org name', async () => {
    const org = await Org.create(mockOrg);
    const res = await agent.get(`/api/buckets/Test Bucket/incomplete/${org._id}`);
    expect(res.status).toBe(200);
    expect(res.text).toContain('Test Org');
    expect(res.text).toContain('<!DOCTYPE html>');
  });

  it('stamps data-org-id on the body', async () => {
    const org = await Org.create(mockOrg);
    const res = await agent.get(`/api/buckets/Test Bucket/incomplete/${org._id}`);
    expect(res.text).toContain(`data-org-id="${org._id}"`);
  });

  it('returns 404 for non-existent org', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await agent.get(`/api/buckets/Test Bucket/incomplete/${fakeId}`);
    expect(res.status).toBe(404);
  });
});

// ── POST /api/buckets/create-bucket-empty ────────────────────────────────────

describe('POST /api/buckets/create-bucket-empty', () => {
  it('creates a bucket document', async () => {
    const res = await agent.post('/api/buckets/create-bucket-empty')
      .set('XSRF-Token', csrfToken)
      .send({ bucketName: 'New Empty Bucket' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const bucket = await Bucket.findOne({ name: 'New Empty Bucket' });
    expect(bucket).not.toBeNull();
  });

  it('returns 400 if bucketName missing', async () => {
    const res = await agent.post('/api/buckets/create-bucket-empty')
      .set('XSRF-Token', csrfToken)
      .send({});
    expect(res.status).toBe(400);
  });

  it('returns 409 if bucket already exists', async () => {
    await Bucket.create({ name: 'Existing Bucket' });
    const res = await agent.post('/api/buckets/create-bucket-empty')
      .set('XSRF-Token', csrfToken)
      .send({ bucketName: 'Existing Bucket' });
    expect(res.status).toBe(409);
  });
});

// ── POST /api/buckets/create-bucket-spreadsheet ──────────────────────────────

describe('POST /api/buckets/create-bucket-spreadsheet', () => {
  function makeXlsxBuffer(rows: Record<string, string>[]): Buffer {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
  }

  it('creates bucket and orgs from spreadsheet', async () => {
    const buf = makeXlsxBuffer([
      { Name: 'Org One', Address: '100 Main', City: 'SF', State: 'CA', Zip: '94103' },
    ]);
    const res = await agent.post('/api/buckets/create-bucket-spreadsheet')
      .set('XSRF-Token', csrfToken)
      .field('bucketName', 'Spreadsheet Bucket')
      .attach('spreadsheet', buf, 'test.xlsx');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.succeeded).toBe(1);
    const orgs = await Org.find({ bucket: 'Spreadsheet Bucket' });
    expect(orgs).toHaveLength(1);
  });

  it('returns 400 if no file uploaded', async () => {
    const res = await agent.post('/api/buckets/create-bucket-spreadsheet')
      .set('XSRF-Token', csrfToken)
      .field('bucketName', 'No File Bucket');
    expect(res.status).toBe(400);
  });

  it('returns 400 if bucketName missing', async () => {
    const buf = makeXlsxBuffer([{ Name: 'Org' }]);
    const res = await agent.post('/api/buckets/create-bucket-spreadsheet')
      .set('XSRF-Token', csrfToken)
      .attach('spreadsheet', buf, 'test.xlsx');
    expect(res.status).toBe(400);
  });

  it('returns a base64 report in the response', async () => {
    const buf = makeXlsxBuffer([{ Name: 'Org One' }]);
    const res = await agent.post('/api/buckets/create-bucket-spreadsheet')
      .set('XSRF-Token', csrfToken)
      .field('bucketName', 'Report Bucket')
      .attach('spreadsheet', buf, 'test.xlsx');
    expect(res.body.report).toBeDefined();
    expect(res.body.reportFilename).toContain('Report_Bucket');
  });
});

// ── POST /api/buckets/build-report ───────────────────────────────────────────

describe('POST /api/buckets/build-report', () => {
  it('returns a base64 xlsx report', async () => {
    const ws = XLSX.utils.aoa_to_sheet([['Name'], ['Org A']]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const workbookBase64 = Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })).toString('base64');

    const res = await agent.post('/api/buckets/build-report')
      .set('XSRF-Token', csrfToken)
      .send({
        workbookBase64,
        dbResults: [{ row: 0, status: 'Success', detail: '' }],
        sfsgResults: [{ row: 0, status: 'Success', detail: '', sfsgId: 999 }],
        bucketName: 'Report Test'
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.report).toBeDefined();
    expect(res.body.reportFilename).toContain('Report_Test');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await agent.post('/api/buckets/build-report')
      .set('XSRF-Token', csrfToken)
      .send({});
    expect(res.status).toBe(400);
  });
});

// ── POST /api/buckets/save — complex fields ──────────────────────────────────

describe('POST /api/buckets/save — complex fields', () => {
  it('saves phones array', async () => {
    const org = await Org.create(mockOrg);
    await agent.post('/api/buckets/save').set('XSRF-Token', csrfToken).send({
      id: org._id,
      fields: { organization_phones: [{ phone_number: '415-555-9999', phone_name: 'Fax' }] }
    });
    const updated = await Org.findById(org._id);
    expect(updated?.phones[0].number).toBe('415-555-9999');
    expect(updated?.phones[0].service_type).toBe('Fax');
  });

  it('saves addresses array', async () => {
    const org = await Org.create(mockOrg);
    await agent.post('/api/buckets/save').set('XSRF-Token', csrfToken).send({
      id: org._id,
      fields: { organization_locations: [{ address_1: '999 New St', city: 'Oakland', state: 'CA', zip: '94601' }] }
    });
    const updated = await Org.findById(org._id);
    expect(updated?.addresses[0].address_1).toBe('999 New St');
    expect(updated?.addresses[0].city).toBe('Oakland');
  });

  it('saves organization hours', async () => {
    const org = await Org.create(mockOrg);
    await agent.post('/api/buckets/save').set('XSRF-Token', csrfToken).send({
      id: org._id,
      fields: {
        organization_hours: {
          M: { start: { time: '09:00' }, end: { time: '17:00' } },
          T: { start: { time: '' }, end: { time: '' } },
          W: { start: { time: '' }, end: { time: '' } },
          Th: { start: { time: '' }, end: { time: '' } },
          F: { start: { time: '' }, end: { time: '' } },
          Sa: { start: { time: '' }, end: { time: '' } },
          Su: { start: { time: '' }, end: { time: '' } },
        }
      }
    });
    const updated = await Org.findById(org._id);
    expect(updated?.schedule.schedule_days).toHaveLength(1);
    expect(updated?.schedule.schedule_days[0].day).toBe('Monday');
    expect(updated?.schedule.schedule_days[0].opens_at).toBe(540);
    expect(updated?.schedule.schedule_days[0].closes_at).toBe(1020);
  });

  it('saves nested services', async () => {
    const org = await Org.create(mockOrg);
    await agent.post('/api/buckets/save').set('XSRF-Token', csrfToken).send({
      id: org._id,
      fields: {
        services: {
          service_1: {
            service_name: 'Updated Service',
            service_description: 'New description',
            service_top_categories: ['Food'],
            service_sub_categories: [],
            service_top_eligibilities: [],
            service_sub_eligibilities: [],
            service_phones: [],
            service_locations: [],
            service_hours: { M: { start: { time: '' }, end: { time: '' } }, T: { start: { time: '' }, end: { time: '' } }, W: { start: { time: '' }, end: { time: '' } }, Th: { start: { time: '' }, end: { time: '' } }, F: { start: { time: '' }, end: { time: '' } }, Sa: { start: { time: '' }, end: { time: '' } }, Su: { start: { time: '' }, end: { time: '' } } },
          }
        }
      }
    });
    const updated = await Org.findById(org._id);
    expect(updated?.services[0].name).toBe('Updated Service');
    expect(updated?.services[0].long_description).toBe('New description');
  });

  it('saves spreadsheetService fields', async () => {
    const org = await Org.create(mockOrg);
    await agent.post('/api/buckets/save').set('XSRF-Token', csrfToken).send({
      id: org._id,
      fields: {
        service_belongs_to_org: '12345',
        service_name: 'Spreadsheet Svc',
        service_description: 'SS description',
      }
    });
    const updated = await Org.findById(org._id);
    expect(updated?.spreadsheetService?.name).toBe('Spreadsheet Svc');
    expect(updated?.spreadsheetService?.long_description).toBe('SS description');
    expect(updated?.spreadsheetService?.service_belongs_to_org).toBe('12345');
  });

  it('returns 404 for non-existent org', async () => {
    const res = await agent.post('/api/buckets/save').set('XSRF-Token', csrfToken).send({
      id: '507f1f77bcf86cd799439011', fields: { organization_name: 'X' }
    });
    expect(res.status).toBe(404);
  });
});

// ── POST /api/buckets/import-file-resolve ────────────────────────────────────

describe('POST /api/buckets/import-file-resolve', () => {
  it('creates org with overwrite action (deletes existing)', async () => {
    const existing = await Org.create(mockOrg);
    const resource = { id: 999, name: 'Imported Org', addresses: [], phones: [], notes: [], services: [], schedule: { schedule_days: [] } };

    const res = await agent.post('/api/buckets/import-file-resolve')
      .set('XSRF-Token', csrfToken)
      .send({ bucket: 'Test Bucket', subdir: 'incomplete', existingId: existing._id, action: 'overwrite', resource });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const deleted = await Org.findById(existing._id);
    expect(deleted).toBeNull();
    const newOrg = await Org.findOne({ name: 'Imported Org' });
    expect(newOrg).not.toBeNull();
  });

  it('creates org with rename action', async () => {
    const resource = { id: 888, name: 'Original Name', addresses: [], phones: [], notes: [], services: [], schedule: { schedule_days: [] } };

    const res = await agent.post('/api/buckets/import-file-resolve')
      .set('XSRF-Token', csrfToken)
      .send({ bucket: 'Test Bucket', subdir: 'incomplete', existingId: null, action: 'rename', newName: 'Renamed Org', resource });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Renamed Org');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await agent.post('/api/buckets/import-file-resolve')
      .set('XSRF-Token', csrfToken)
      .send({});
    expect(res.status).toBe(400);
  });
});

// ── Edge cases ───────────────────────────────────────────────────────────────

describe('Edge cases', () => {
  it('POST /api/buckets/submit returns 400 if id missing', async () => {
    const res = await agent.post('/api/buckets/submit')
      .set('XSRF-Token', csrfToken)
      .send({});
    expect(res.status).toBe(400);
  });

  it('POST /api/buckets/submit returns 404 for non-existent org', async () => {
    const res = await agent.post('/api/buckets/submit')
      .set('XSRF-Token', csrfToken)
      .send({ id: '507f1f77bcf86cd799439011' });
    expect(res.status).toBe(404);
  });

  it('POST /api/buckets/create-file returns 400 if bucket and subdir missing', async () => {
    const res = await agent.post('/api/buckets/create-file')
      .set('XSRF-Token', csrfToken)
      .send({});
    expect(res.status).toBe(400);
  });

  it('POST /api/buckets/create-file returns 404 if source org not found', async () => {
    const res = await agent.post('/api/buckets/create-file')
      .set('XSRF-Token', csrfToken)
      .send({ bucket: 'Test Bucket', subdir: 'incomplete', fromId: '507f1f77bcf86cd799439011' });
    expect(res.status).toBe(404);
  });

  it('POST /api/buckets/move returns 404 for non-existent org', async () => {
    const res = await agent.post('/api/buckets/move')
      .set('XSRF-Token', csrfToken)
      .send({ id: '507f1f77bcf86cd799439011', toBucket: 'X', toSubdir: 'pending' });
    expect(res.status).toBe(404);
  });
});

// #endregion ------------------------------------------------------------------
