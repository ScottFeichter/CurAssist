import { extendedConsole as console } from '../../streams/consoles/customConsoles';
import winston from 'winston';
import 'winston-daily-rotate-file';
import { EventEmitter } from 'events';
import fs from 'fs'
import { baseLogFormat } from './logger-config/logger-formatters';
import { customLevels } from './logger-config/logger-levels';
import { customTimestamp } from './logger-config/logger-timestamp';
import { consoleTransport } from './logger-transports/logger-consoleTransports';
import { allLogsNoAnsiTransport,
    allLogsWithAnsiTransport,
    allWinstonLogsTransport,
    debugTransport,
    enterTransport,
    errorTransport,
    httpsTransport,
    inforTransport,
    retrnTransport,
    warniTransport } from './logger-transports/logger-fileTransports';



console.enter();

// #region ====================== START ========================================

// Increase max amount of listeners before creating the logger
EventEmitter.defaultMaxListeners = 20;

// Add the custom colors before creating the logger
winston.addColors(customLevels.colors);

// Create the logger
const logger = winston.createLogger({
    level: process.env.WINSTON_LOG_LEVEL || 'debug',
    levels: customLevels.levels,
    format: winston.format.combine(
        customTimestamp(),
        winston.format.errors({ stack: true }),
        baseLogFormat
    ),
    transports: [
        errorTransport,
        warniTransport,
        inforTransport,
        httpsTransport,
        debugTransport,
        enterTransport,
        retrnTransport,
        allWinstonLogsTransport,
        allLogsNoAnsiTransport,
        allLogsWithAnsiTransport,
        consoleTransport
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
console.error('Logger error:', error);


// Optionally write to a fallback file
fs.appendFileSync('logger-errors.txt',
    `${new Date().toISOString()} - Logger Error: ${error}\n`);


// Optionally notify your error tracking service
// errorTrackingService.notify(error);

});



export default logger;


// #endregion ------------------------------------------------------------------

console.leave();;

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
