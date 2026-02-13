import { extendedConsole as console } from '@/streams/consoles/customConsoles';
import winston from 'winston';
import 'winston-daily-rotate-file';

console.enter();

// #region ====================== START ========================================


export const consoleTransport = new winston.transports.Console({
    format: winston.format.combine(
        winston.format.timestamp({ format: 'MM-DD-YYYY HH:mm:ss:ms' }),
        winston.format.simple(),
        winston.format.printf(info => {
            // First create the plain text format
            return `[winston] ${info.level} : ${info.message}`;
        }),
        winston.format.colorize({ all: true }) // Apply colors last
    )
});


// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
