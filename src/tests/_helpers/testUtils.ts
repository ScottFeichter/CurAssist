// #region ===================== IMPORTS =======================================
import express, { Application } from 'express';
import request from 'supertest';
import { setupPreRouteMiddleware } from '../../server/middlewares/setup-pre-route-middleware';
import { setupRoutes } from '../../server/routes/setup-routes';
import { setupPostRouteMiddleware } from '../../server/middlewares/setup-post-route-middleware';
// #endregion ------------------------------------------------------------------

// #region ====================== START ========================================

/**
 * Creates a minimal Express app instance for use in supertest integration tests.
 * Does not start a server or connect to Atlas — use connectTestDb() for DB.
 */
export function createTestApp(): Application {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  setupPreRouteMiddleware(app);
  setupRoutes(app);
  setupPostRouteMiddleware(app);
  return app;
}

/**
 * Creates a supertest agent with a valid CSRF token pre-fetched.
 * Use this for all POST/DELETE requests in integration tests.
 * @param app - The Express app instance
 * @returns {{ agent: request.SuperAgentTest, csrfToken: string }}
 */
export async function createAuthedAgent(app: Application): Promise<{ agent: ReturnType<typeof request.agent>, csrfToken: string }> {
  const agent = request.agent(app);
  const res = await agent.get('/api/csrf/restore');
  const csrfToken = res.body['XSRF-Token'];
  return { agent, csrfToken };
}

// #endregion ------------------------------------------------------------------
