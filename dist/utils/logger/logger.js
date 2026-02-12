import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.join(__dirname, '../../../logs');
const logFormat = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
}));
const createTransport = (level, dirname) => {
    return new DailyRotateFile({
        level,
        dirname: path.join(logsDir, dirname),
        filename: `${level}-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        maxFiles: '14d',
        format: logFormat
    });
};
export const logger = winston.createLogger({
    level: 'debug',
    format: logFormat,
    transports: [
        createTransport('error', 'error'),
        createTransport('info', 'info'),
        createTransport('debug', 'debug'),
        new winston.transports.File({
            filename: path.join(logsDir, 'server/server.log'),
            format: logFormat
        }),
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.printf(({ timestamp, level, message }) => {
                return `[${timestamp}] ${level}: ${message}`;
            }))
        })
    ]
});
