import { extendedConsole as console } from '../../../streams/consoles/customConsoles';
import winston from 'winston';

console.enter();

// #region ====================== START ========================================


// ANSI escape codes for styling
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';


// Helper function to format the level with bold styling
const formatLevel = (level: string, isConsole: boolean): string => {
    if (isConsole) {
        return `${BOLD}${level}${RESET}`;
    }
    return `**${level}**`;
};


// Helper to create an uppercase format
const uppercaseFormat = winston.format((info) => {
    info.level = info.level.toUpperCase();
    return info;
});


//====== COMBINED FORMATTER THAT HANDLES BOTH STANDARD LOGS AND ERRORS =========


// Extend the TransformableInfo type to include specific properties
interface ExtendedTransformableInfo extends winston.Logform.TransformableInfo {
    timestamp?: string; // Make timestamp optional
    level: string;
    message: string;
    stack?: string;
    [key: string]: any; // for any additional properties
}


// Common format for all transports
export const baseLogFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    uppercaseFormat(),
    winston.format.printf((info: winston.Logform.TransformableInfo) => {
        const symbols = Object.getOwnPropertySymbols(info);
        const isError = symbols.length > 0 && info[symbols[0]] === 'error';
        const message = isError ? (info.stack || info.message) : info.message;
        return `${info.timestamp} [winston] ${info.level} : ${message}`;
    }),
    winston.format.colorize({ all: true }), // Enable colors
);


// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================
// #endregion ------------------------------------------------------------------
