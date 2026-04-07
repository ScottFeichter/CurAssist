// #region ===================== IMPORTS =======================================
import { extendedConsole as console } from '../streams/consoles/customConsoles';
import { log } from '../utils/logger/logger-setup/logger-wrapper';
import express, { Application } from 'express';
import { setupPreRouteMiddleware } from './middlewares/setup-pre-route-middleware';
import { setupRoutes } from './routes/setup-routes';
import { setupPostRouteMiddleware } from './middlewares/setup-post-route-middleware';
// import SEQUELIZE from '../../database/sequelize';
import { SERVER_PORT } from '../config/env-module';
import { connectToAtlas } from '../database/atlas';

import cors from 'cors';
import path from 'path';
import logger from '../utils/logger/logger';
// #endregion ------------------------------------------------------------------

console.enter();

// #region ====================== START ========================================


log.infor(`NODE_ENV at runtime from server.ts: ${process.env.NODE_ENV}`);


/**
 * The Express application instance.
 * Exported so it can be passed into start() from entry.ts.
 */
export const SERVER: Application = express();


/**
 * Starts the Express server.
 * Connects to MongoDB Atlas before binding to the port —
 * the server will not start if the DB connection fails.
 * @param SERVER - The Express application instance
 */
export const start = async (SERVER: Application) => {
  log.enter("start()", log.brack);

  try {

    // Middleware
    SERVER.use(cors());
    SERVER.use(express.json({ limit: '50mb' }));

    // Add setup middleware and set up routes
    setupPreRouteMiddleware(SERVER);
    setupRoutes(SERVER);
    setupPostRouteMiddleware(SERVER);


    // Connect to MongoDB Atlas — server will not start if connection fails
    await connectToAtlas();


    SERVER.listen(SERVER_PORT, () => {
      log.blank();
      console.infor('To prevent terminal line wrapping run: tput rmam');
      console.infor('To restore terminal line wrapping run: tput smam');
      log.blank();
      console.infor(`✅ Server is running at \x1b[36mhttp://localhost:${SERVER_PORT}\x1b[0m`);
      log.blank();
    });
  } catch (error) {
    log.blank();
    console.error('❌ Failed to start server:', error);
    log.blank();
    process.exit(1);
  }


  return log.retrn("start()", log.kcarb);
};


// #endregion ------------------------------------------------------------------


console.leave();


// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
