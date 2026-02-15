// #region ===================== IMPORTS =======================================
import { extendedConsole as console } from '../../streams/consoles/customConsoles';
import { log } from '../../utils/logger/logger-setup/logger-wrapper';
import express, { Application } from 'express';
import { setupPreRouteMiddleware } from '../middlewares/setup-pre-route-middleware';
import { setupRoutes } from './setup-routes';
import { setupPostRouteMiddleware } from '../middlewares/setup-post-route-middleware';
// import SEQUELIZE from '../../database/sequelize';
import { SERVER_PORT } from '../../config/env-module';

import cors from 'cors';
import path from 'path';
import { PORT } from '../../config/env';
import logger from '../../utils/logger/logger';
import apiRoutes from './api';
// #endregion ------------------------------------------------------------------

console.enter();

// #region ====================== START ========================================


log.infor(`NODE_ENV at runtime from server.ts: ${process.env.NODE_ENV}`);


// Instantiate the server
export const SERVER: Application = express();


// Function to start the server (called in entry.ts)
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


    // Authenticate Sequelize instance to ensure the DB connection is successful
    // await SEQUELIZE.authenticate();
    // log.infor('Database connection has been established successfully!');


    // Routes
    SERVER.use('/api', apiRoutes);

    SERVER.listen(SERVER_PORT, () => {
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
