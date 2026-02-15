import path from 'path';
import { extendedConsole as console } from '../../../streams/consoles/customConsoles';
import winston from 'winston';
import 'winston-daily-rotate-file';
import { logPaths, logDir } from '../logger-config/logger-paths';
import {baseLogFormat} from '../logger-config/logger-formatters'

console.enter();

// #region ====================== START ========================================


// Daily Rotate File for different log levels
export const errorTransport = new winston.transports.DailyRotateFile({
    filename: path.join(logPaths.error, 'error-%DATE%.log'),
    datePattern: 'MM-DD-YYYY',
    level: 'error',
    maxFiles: '30d',
    maxSize: '20m',
    format: baseLogFormat,
    zippedArchive: true,
});


export const warniTransport = new winston.transports.DailyRotateFile({
    filename: path.join(logPaths.warni, 'warni-%DATE%.log'),
    datePattern: 'MM-DD-YYYY',
    level: 'warni',
    maxFiles: '30d',
    maxSize: '20m',
    format: baseLogFormat,
    zippedArchive: true,
});

export const inforTransport = new winston.transports.DailyRotateFile({
    filename: path.join(logPaths.infor, 'infor-%DATE%.log'),
    datePattern: 'MM-DD-YYYY',
    level: 'infor',
    maxFiles: '30d',
    maxSize: '20m',
    format: baseLogFormat,
    zippedArchive: true,
});

export const httpsTransport = new winston.transports.DailyRotateFile({
    filename: path.join(logPaths.https, 'https-%DATE%.log'),
    datePattern: 'MM-DD-YYYY',
    level: 'https',
    maxFiles: '30d',
    maxSize: '20m',
    format: baseLogFormat,
    zippedArchive: true,
});

export const debugTransport = new winston.transports.DailyRotateFile({
    filename: path.join(logPaths.debug, 'debug-%DATE%.log'),
    datePattern: 'MM-DD-YYYY',
    level: 'debug',
    maxFiles: '30d',
    maxSize: '20m',
    format: baseLogFormat,
    zippedArchive: true,
});

export const enterTransport = new winston.transports.DailyRotateFile({
    filename: path.join(logPaths.enter, 'enter-%DATE%.log'),
    datePattern: 'MM-DD-YYYY',
    level: 'enter',
    maxFiles: '30d',
    maxSize: '20m',
    format: baseLogFormat,
    zippedArchive: true,
});

export const retrnTransport = new winston.transports.DailyRotateFile({
    filename: path.join(logPaths.retrn, 'retrn-%DATE%.log'),
    datePattern: 'MM-DD-YYYY',
    level: 'retrn',
    maxFiles: '30d',
    maxSize: '20m',
    format: baseLogFormat,
    zippedArchive: true,
});


export const allWinstonLogsTransport = new winston.transports.DailyRotateFile({
    filename: path.join(logPaths.allWinston, 'allWinston-%DATE%.log'),
    datePattern: 'MM-DD-YYYY',
    maxFiles: '30d',
    maxSize: '20m',
    format: baseLogFormat,
    zippedArchive: true,
});


// Transport to combine with custom consoles no ansi
export const allLogsNoAnsiTransport = new winston.transports.File({
    filename: path.join(logPaths.all, 'all-no-ansi.log'),
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.uncolorize(), // Remove any color codes
        winston.format.printf((info) => {
            return `${info.timestamp} [winston] ${info.level}: ${info.message}`;
        })
    )
});

// Transport to combine with custom consoles with ansi
export const allLogsWithAnsiTransport = new winston.transports.File({
    filename: path.join(logPaths.all, 'all-w-ansi.log'),
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.printf((info) => {
            return `${info.timestamp} [winston] ${info.level}: ${info.message}`;
        }),
        winston.format.colorize({ all: true })
    )
});



// #endregion ------------------------------------------------------------------


console.leave();


// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
