import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { PORT } from '@/config/env.js';
import { logger } from '@/utils/logger/logger.js';
import apiRoutes from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const server: Application = express();

// Middleware
server.use(cors());
server.use(express.json({ limit: '50mb' }));
server.use(express.static(path.join(__dirname, '../../public')));

// Routes
server.use('/api', apiRoutes);

export const start = () => {
  server.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
};
