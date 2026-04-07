import { extendedConsole as console } from '../../../streams/consoles/customConsoles';
import winston from 'winston';
import 'winston-daily-rotate-file';

console.enter();

// #region ====================== START ========================================


export const consoleTransport = new winston.transports.Console({
    format: winston.format.combine(
        winston.format.timestamp({ format: 'MM-DD-YYYY HH:mm:ss:ms' }),
        winston.format.colorize({ all: true }),
        winston.format.printf(info => {
            return `[winston] ${info.level} : ${info.message}`;
        })
    )
});


// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// #endregion ------------------------------------------------------------------
