"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const customConsoles_1 = require("../../streams/consoles/customConsoles");
const winston_1 = __importDefault(require("winston"));
require("winston-daily-rotate-file");
const events_1 = require("events");
const fs_1 = __importDefault(require("fs"));
const logger_formatters_1 = require("./logger-config/logger-formatters");
const logger_levels_1 = require("./logger-config/logger-levels");
const logger_timestamp_1 = require("./logger-config/logger-timestamp");
const logger_consoleTransports_1 = require("./logger-transports/logger-consoleTransports");
const logger_fileTransports_1 = require("./logger-transports/logger-fileTransports");
customConsoles_1.extendedConsole.enter();
// #region ====================== START ========================================
// Increase max amount of listeners before creating the logger
events_1.EventEmitter.defaultMaxListeners = 20;
// Add the custom colors before creating the logger
winston_1.default.addColors(logger_levels_1.customLevels.colors);
// Create the logger
const logger = winston_1.default.createLogger({
    level: process.env.WINSTON_LOG_LEVEL || 'debug',
    levels: logger_levels_1.customLevels.levels,
    format: winston_1.default.format.combine((0, logger_timestamp_1.customTimestamp)(), winston_1.default.format.errors({ stack: true }), logger_formatters_1.baseLogFormat),
    transports: [
        logger_fileTransports_1.errorTransport,
        logger_fileTransports_1.warniTransport,
        logger_fileTransports_1.inforTransport,
        logger_fileTransports_1.httpsTransport,
        logger_fileTransports_1.debugTransport,
        logger_fileTransports_1.enterTransport,
        logger_fileTransports_1.retrnTransport,
        logger_fileTransports_1.allWinstonLogsTransport,
        logger_fileTransports_1.allLogsNoAnsiTransport,
        logger_fileTransports_1.allLogsWithAnsiTransport,
        logger_consoleTransports_1.consoleTransport
    ]
});
// Set max listeners on the logger instance
logger.setMaxListeners(20);
// Set max listeners on each transport
logger.transports.forEach(transport => {
    transport.setMaxListeners(20);
});
// Add error handling for the logger itself
logger.on('error', (error) => {
    // Log to console as a fallback
    customConsoles_1.extendedConsole.error('Logger error:', error);
    // Optionally write to a fallback file
    fs_1.default.appendFileSync('logger-errors.txt', `${new Date().toISOString()} - Logger Error: ${error}\n`);
    // Optionally notify your error tracking service
    // errorTrackingService.notify(error);
});
exports.default = logger;
// #endregion ------------------------------------------------------------------
customConsoles_1.extendedConsole.leave();
;
// #region ====================== NOTES ========================================
// #endregion ------------------------------------------------------------------
