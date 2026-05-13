// #region ===================== IMPORTS =======================================
import { connectTestDb, disconnectTestDb, clearTestDb } from '../_helpers/testConfig';
import { createTestApp, createAuthedAgent } from '../_helpers/testUtils';
import request from 'supertest';
// #endregion ------------------------------------------------------------------

// #region ====================== SETUP ========================================

const app = createTestApp();

beforeAll(async () => { await connectTestDb(); });
afterAll(async () => { await disconnectTestDb(); });
afterEach(async () => { await clearTestDb(); });

// #endregion ------------------------------------------------------------------

// #region ====================== TESTS ========================================

describe('SF Proxy Routes', () => {

  // Note: These tests hit the real SFSG API through the proxy.
  // They verify the proxy forwards correctly but depend on SFSG being available.
  // If SFSG is down, these will return 502.

  describe('GET /api/sf/v2/resources/:id', () => {
    it('proxies a GET request and returns JSON', async () => {
      // Use a known SFSG org ID (1 is usually valid)
      const res = await request(app).get('/api/sf/v2/resources/1');
      // Should be 200 (found) or 404 (not found on SFSG) — not 500/403
      expect([200, 404, 502]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.resource).toBeDefined();
      }
    });
  });

  describe('POST /api/sf/*', () => {
    it('proxies a POST request to SFSG', async () => {
      // Send a minimal payload — SFSG will likely reject it but the proxy should forward
      const res = await request(app)
        .post('/api/sf/resources')
        .send({ resources: [{ name: '' }] });
      // Should get a response from SFSG (any status) or 502 if unreachable
      expect(res.status).toBeDefined();
      expect([200, 201, 400, 422, 500, 502]).toContain(res.status);
    });

    it('does not require CSRF token', async () => {
      const res = await request(app)
        .post('/api/sf/resources')
        .send({ resources: [{ name: 'Test' }] });
      // Should NOT be 403 (CSRF is skipped for /api/sf)
      expect(res.status).not.toBe(403);
    });
  });

});

// #endregion ------------------------------------------------------------------
