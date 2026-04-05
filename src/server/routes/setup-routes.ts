import { extendedConsole as console } from '../../streams/consoles/customConsoles';
import { log } from '../../utils/logger/logger-setup/logger-wrapper';
import { join } from 'path';
import express, { Request, Response, NextFunction, Application } from 'express';
// import { QueryTypes } from 'sequelize';
// import { TimeResult } from '../../types/ts-definitions';
// import SEQUELIZE from '../../database/sequelize';
import apiRouter from './api/api-router';
import { routeCatchAll } from './setups/catchAll-unmatched-routes';
import { orgFieldMap, serviceFieldMap, organizationLocationFieldMap, organizationPhoneFieldMap, serviceLocationFieldMap } from '../helpers/buckets-map';



console.enter();


// #region ====================== START ========================================

/**
 * Sets up all Express routes.
 * Dev-only documentation routes are mounted first (/docs/*).
 * API routes are mounted under /api via apiRouter.
 * A catch-all handles unmatched routes.
 * @param SERVER - The Express application instance
 */
export const setupRoutes = (SERVER: Application) => {
  log.enter("setupRoutes()", log.brack);


  // Dev-only documentation routes
  if (process.env.NODE_ENV !== 'production') {
    SERVER.use('/docs/typedocs', express.static(join(__dirname, '../../../docs/typedocs')));
    SERVER.get('/docs/readme', (_req: Request, res: Response) => {
      res.sendFile(join(__dirname, '../../../README.md'));
    });
    SERVER.get('/docs/deployment', (_req: Request, res: Response) => {
      res.sendFile(join(__dirname, '../../../docs/deployment-DB-noS3.md'));
    });
    SERVER.get('/docs/deployment-nodb', (_req: Request, res: Response) => {
      res.sendFile(join(__dirname, '../../../docs/deployment-S3-noDB.md'));
    });
    SERVER.get('/docs/deploy-log', (_req: Request, res: Response) => {
      res.sendFile(join(__dirname, '../../../docs/curassistDeployFirst.md'));
    });
    SERVER.get('/docs/tests', (_req: Request, res: Response) => {
      res.sendFile(join(__dirname, '../../../docs/tests.md'));
    });
    SERVER.get('/docs/buckets-map', (_req: Request, res: Response) => {
      const maps = { orgFieldMap, serviceFieldMap, organizationLocationFieldMap, serviceLocationFieldMap, organizationPhoneFieldMap };
      res.send(`<!DOCTYPE html><html><head><title>Buckets Map</title><style>body{font-family:monospace;padding:20px;}h2{margin-top:30px;}pre{background:#f4f4f4;padding:16px;border-radius:4px;}</style></head><body><h1>Buckets Field Maps</h1>${Object.entries(maps).map(([name, map]) => `<h2>${name}</h2><pre>${JSON.stringify(map, null, 2)}</pre>`).join('')}</body></html>`);
    });
  }


  // Backend test page
  SERVER.get('/test', (_req: Request, res: Response) => {
    res.sendFile(
      join(__dirname, '../../views/backendHTML/_root.html')
    );
  });



  // Server test route for Express, routing, and CSRF via cookie
  SERVER.get('/test/express', (req: Request, res: Response) => {
    // res.cookie('XSRF-TOKEN', req.csrfToken()); // Commented out - CSRF not configured
    res.sendFile(
      join(__dirname, '../../views/backendHTML/demo-test-express.html')
    );
  });



  // Database test route for connectivity, sequelize, queries, and JSON return
  // Commented out - requires Sequelize
  /*
  SERVER.get('/test/database', async (req: Request, res: Response) => {
    try {
      await SEQUELIZE.authenticate();
      const [results] = await SEQUELIZE.query<TimeResult>('SELECT NOW()', {
        raw: true,
        type: QueryTypes.SELECT
      });
      res.json({
        message: 'PostgreSQL connected with Sequelize!',
        time: results.now
      });
    } catch (error) {
      log.error(error);
      res.status(500).json({ error: 'Database connection failed' });
    }
  });
  */



  // Test route for 404 error handling (non-catchAll path)
  SERVER.get('/test/404', (_req: Request, res: Response, next: NextFunction) => {
    const error = new Error('Test direct 404');
    (error as any).status = 404;
    next(error);
  });



  // CSRF token restoration - only in development
  // Commented out - CSRF not configured
  // UNCOMMENTED - Re-enabled for file operations
  SERVER.get('/api/csrf/restore', (req: Request, res: Response) => {
    const csrfToken = req.csrfToken();
    res.cookie('XSRF-TOKEN', csrfToken);
    res.status(200).json({
      'XSRF-Token': csrfToken
    });
  });



  // Mount all routes under /api
  SERVER.use('/api', apiRouter);


  // Route catch-all (catches unmatched routes)
  SERVER.use('*', routeCatchAll)



  log.retrn("setupRoutes()", log.kcarb);
};


// #endregion ------------------------------------------------------------------


console.leave();


// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
