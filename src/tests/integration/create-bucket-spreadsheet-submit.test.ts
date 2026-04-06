// #region ===================== IMPORTS =======================================
import { connectTestDb, disconnectTestDb, clearTestDb } from '../_helpers/testConfig';
import { createTestApp, createAuthedAgent } from '../_helpers/testUtils';
import { Org } from '../../database/models/org.model';
import { Bucket } from '../../database/models/bucket.model';
import * as XLSX from 'xlsx';
// #endregion ------------------------------------------------------------------

// #region ====================== HELPERS ======================================

/** Builds a minimal xlsx buffer with the given rows and headers. */
function makeXlsxBuffer(rows: Record<string, string>[]): Buffer {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
}

const testRows = [
  { Name: 'Org Alpha', Address: '100 Main St', City: 'San Francisco', State: 'CA', Zip: '94103', Phone: '4155550001', 'Phone Name': 'Main' },
  { Name: 'Org Beta',  Address: '200 Oak Ave',  City: 'San Francisco', State: 'CA', Zip: '94104', Phone: '4155550002', 'Phone Name': 'Main' },
];

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

describe('POST /api/buckets/create-bucket-spreadsheet-submit', () => {

  it('returns 400 if no file uploaded', async () => {
    const res = await agent
      .post('/api/buckets/create-bucket-spreadsheet-submit')
      .set('XSRF-Token', csrfToken)
      .field('bucketName', 'Test Batch');
    expect(res.status).toBe(400);
  });

  it('returns 400 if bucketName missing', async () => {
    const buf = makeXlsxBuffer(testRows);
    const res = await agent
      .post('/api/buckets/create-bucket-spreadsheet-submit')
      .set('XSRF-Token', csrfToken)
      .attach('spreadsheet', buf, 'test.xlsx');
    expect(res.status).toBe(400);
  });

  it('returns success with bucketName and orgs array', async () => {
    const buf = makeXlsxBuffer(testRows);
    const res = await agent
      .post('/api/buckets/create-bucket-spreadsheet-submit')
      .set('XSRF-Token', csrfToken)
      .field('bucketName', 'Test Batch')
      .attach('spreadsheet', buf, 'test.xlsx');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.bucketName).toBe('Test Batch');
    expect(Array.isArray(res.body.orgs)).toBe(true);
  });

  it('returns one entry per spreadsheet row', async () => {
    const buf = makeXlsxBuffer(testRows);
    const res = await agent
      .post('/api/buckets/create-bucket-spreadsheet-submit')
      .set('XSRF-Token', csrfToken)
      .field('bucketName', 'Test Batch')
      .attach('spreadsheet', buf, 'test.xlsx');
    expect(res.body.orgs).toHaveLength(testRows.length);
  });

  it('each org entry has _id and name', async () => {
    const buf = makeXlsxBuffer(testRows);
    const res = await agent
      .post('/api/buckets/create-bucket-spreadsheet-submit')
      .set('XSRF-Token', csrfToken)
      .field('bucketName', 'Test Batch')
      .attach('spreadsheet', buf, 'test.xlsx');
    for (const org of res.body.orgs) {
      expect(org._id).toBeDefined();
      expect(typeof org.name).toBe('string');
    }
  });

  it('org names match spreadsheet Name column', async () => {
    const buf = makeXlsxBuffer(testRows);
    const res = await agent
      .post('/api/buckets/create-bucket-spreadsheet-submit')
      .set('XSRF-Token', csrfToken)
      .field('bucketName', 'Test Batch')
      .attach('spreadsheet', buf, 'test.xlsx');
    const names = res.body.orgs.map((o: any) => o.name);
    expect(names).toContain('Org Alpha');
    expect(names).toContain('Org Beta');
  });

  it('creates a Bucket document in the DB', async () => {
    const buf = makeXlsxBuffer(testRows);
    await agent
      .post('/api/buckets/create-bucket-spreadsheet-submit')
      .set('XSRF-Token', csrfToken)
      .field('bucketName', 'Test Batch')
      .attach('spreadsheet', buf, 'test.xlsx');
    const bucket = await Bucket.findOne({ name: 'Test Batch' });
    expect(bucket).not.toBeNull();
  });

  it('creates Org documents with correct bucket and status', async () => {
    const buf = makeXlsxBuffer(testRows);
    await agent
      .post('/api/buckets/create-bucket-spreadsheet-submit')
      .set('XSRF-Token', csrfToken)
      .field('bucketName', 'Test Batch')
      .attach('spreadsheet', buf, 'test.xlsx');
    const orgs = await Org.find({ bucket: 'Test Batch' });
    expect(orgs).toHaveLength(testRows.length);
    for (const org of orgs) {
      expect(org.bucket).toBe('Test Batch');
      expect(org.status).toBe('incomplete');
    }
  });

  it('returned _ids match the DB documents', async () => {
    const buf = makeXlsxBuffer(testRows);
    const res = await agent
      .post('/api/buckets/create-bucket-spreadsheet-submit')
      .set('XSRF-Token', csrfToken)
      .field('bucketName', 'Test Batch')
      .attach('spreadsheet', buf, 'test.xlsx');
    for (const entry of res.body.orgs) {
      const org = await Org.findById(entry._id);
      expect(org).not.toBeNull();
      expect(org?.name).toBe(entry.name);
    }
  });

});

// #endregion ------------------------------------------------------------------
