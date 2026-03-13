// #region ===================== IMPORTS =======================================
import { extendedConsole as console } from './streams/consoles/customConsoles';
import { requiredEnvVars } from './config/env-module';
import logger from './utils/logger/logger';
import { log } from './utils/logger/logger-setup/logger-wrapper';
import { createLogDirectories } from './utils/logger/logger-setup/logger-directories';
import { testLoggers, testLogWrappers } from './utils/logger/logger-trials/logger-trials';
import { start, SERVER } from './server/server';
// #endregion ------------------------------------------------------------------

console.enter();



// #region ====================== START ========================================


// This helps the startup sequence initiate env-module.ts
console.assert(requiredEnvVars, 'Missing requiredEnvVars');


// Test custom winston loggers only if not in production
if (process.env.NODE_ENV !== 'production') {
  logger.infor('=== CurAssist Starting ===');
  logger.infor(`Environment: ${process.env.NODE_ENV || 'development'}`);
  createLogDirectories();
  testLoggers();
  testLogWrappers();

  console.infor(`Logger and log wrappers successfully created!`);
}





start(SERVER);



// #endregion ------------------------------------------------------------------







console.leave();
// #region ====================== NOTES ========================================



// START SEQUENCE:

// 0. load type definitions (already ready in d.ts)

// 0. Make custon consoles for logging

// 1. get variables from .env and load them to process.env (importing requiredEnvVars triggers this)

// 2. make the custon winston loggers and log wrappers

      // a. create log directories
      // b. create log files
      // c. create formats and timestamps
      // d. create transports
      // e. create logger
      // f. create log wrappers
      // g. test logger and log wrappers

// 3. create postgres instance (if not using sequelize or other orm)

// 4. create sequelize on top of postgres (if using sequelize)

// 5. create setup middlewares and setup routes

// 6. instantiate and start the server

// 7. run tests

// 8. make documentation





// #endregion ------------------------------------------------------------------
