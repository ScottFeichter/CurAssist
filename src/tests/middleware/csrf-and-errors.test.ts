// #region ===================== IMPORTS =======================================
import { connectTestDb, disconnectTestDb, clearTestDb } from '../_helpers/testConfig';
import { createTestApp, createAuthedAgent } from '../_helpers/testUtils';
import { mockOrg } from '../_helpers/testData';
import { Org } from '../../database/models/org.model';
import request from 'supertest';
// #endregion ------------------------------------------------------------------

// #region ====================== SETUP ========================================

const app = createTestApp();

beforeAll(async () => { await connectTestDb(); });
afterAll(async () => { await disconnectTestDb(); });
afterEach(async () => { await clearTestDb(); });

// #endregion ------------------------------------------------------------------

// #region ====================== TESTS ========================================

describe('CSRF Protection', () => {
  it('rejects POST without CSRF token with 403', async () => {
    const org = await Org.create(mockOrg);
    const res = await request(app)
      .post('/api/buckets/save')
      .send({ id: org._id, fields: { organization_name: 'Hacked' } });
    expect(res.status).toBe(403);
  });

  it('rejects POST with invalid CSRF token with 403', async () => {
    const agent = request.agent(app);
    await agent.get('/api/csrf/restore'); // get cookie but use wrong token
    const org = await Org.create(mockOrg);
    const res = await agent
      .post('/api/buckets/save')
      .set('XSRF-Token', 'invalid-token-value')
      .send({ id: org._id, fields: { organization_name: 'Hacked' } });
    expect(res.status).toBe(403);
  });

  it('allows POST with valid CSRF token', async () => {
    const authed = await createAuthedAgent(app);
    const org = await Org.create(mockOrg);
    const res = await authed.agent
      .post('/api/buckets/save')
      .set('XSRF-Token', authed.csrfToken)
      .send({ id: org._id, fields: { organization_name: 'Legit' } });
    expect(res.status).toBe(200);
  });

  it('does not require CSRF for GET requests', async () => {
    const res = await request(app).get('/api/buckets');
    expect(res.status).toBe(200);
  });

  it('does not require CSRF for /api/sf proxy routes', async () => {
    // SF proxy routes skip CSRF — this should not return 403
    // It may return 502 (can't reach SFSG) but NOT 403
    const res = await request(app)
      .post('/api/sf/resources')
      .send({ resources: [{ name: 'Test' }] });
    expect(res.status).not.toBe(403);
  });
});

describe('GET /api/csrf/restore', () => {
  it('returns a CSRF token in the response body', async () => {
    const res = await request(app).get('/api/csrf/restore');
    expect(res.status).toBe(200);
    expect(res.body['XSRF-Token']).toBeDefined();
    expect(typeof res.body['XSRF-Token']).toBe('string');
  });

  it('sets XSRF-TOKEN cookie', async () => {
    const res = await request(app).get('/api/csrf/restore');
    const cookies = res.headers['set-cookie'] as string[];
    expect(cookies.some((c) => c.includes('XSRF-TOKEN'))).toBe(true);
  });
});

describe('404 handling', () => {
  it('returns 404 for unmatched routes', async () => {
    const res = await request(app).get('/api/nonexistent/route');
    expect(res.status).toBe(404);
  });

  it('returns 404 via /test/404 test route', async () => {
    const res = await request(app).get('/test/404');
    expect(res.status).toBe(404);
  });
});

// #endregion ------------------------------------------------------------------
