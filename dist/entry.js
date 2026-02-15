"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// #region ===================== IMPORTS =======================================
const customConsoles_1 = require("./streams/consoles/customConsoles");
const env_module_1 = require("./config/env-module");
const logger_1 = __importDefault(require("./utils/logger/logger"));
const logger_directories_1 = require("./utils/logger/logger-setup/logger-directories");
const logger_trials_1 = require("./utils/logger/logger-trials/logger-trials");
const server_1 = require("./server/routes/server");
// #endregion ------------------------------------------------------------------
customConsoles_1.extendedConsole.enter();
// #region ====================== START ========================================
// This helps the startup sequence initiate env-module.ts
customConsoles_1.extendedConsole.assert(env_module_1.requiredEnvVars, 'Missing requiredEnvVars');
// Test custom winston loggers only if not in production
if (process.env.NODE_ENV !== 'production') {
    logger_1.default.infor('=== CurAssist Starting ===');
    logger_1.default.infor(`Environment: ${process.env.NODE_ENV || 'development'}`);
    (0, logger_directories_1.createLogDirectories)();
    (0, logger_trials_1.testLoggers)();
    (0, logger_trials_1.testLogWrappers)();
    customConsoles_1.extendedConsole.infor(`Logger and log wrappers successfully created!`);
}
(0, server_1.start)(server_1.SERVER);
// #endregion ------------------------------------------------------------------
customConsoles_1.extendedConsole.leave();
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
