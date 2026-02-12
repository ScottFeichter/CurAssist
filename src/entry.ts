import { logger } from '@/utils/logger/logger.js';
import { start } from '@/server/server.js';

logger.info('=== CurAssist Starting ===');
logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);

start();
