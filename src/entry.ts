import logger from '@/utils/logger/logger';
import { start, SERVER } from '@/server/routes/server';

logger.infor('=== CurAssist Starting ===');
logger.infor(`Environment: ${process.env.NODE_ENV || 'development'}`);

start(SERVER);
