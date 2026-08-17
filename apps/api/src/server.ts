import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Result } from './lib/result.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
}

const app = express();
const port = process.env.PORT || 4000;

const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL || 'https://cronjob-web.vercel.app']
  : [/^https:\/\/.*\.vercel\.app$/, 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  const result = Result.ok({ status: 'healthy', timestamp: new Date() });
  res.json(result);
});

import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';

// Better Auth routes
app.all('/api/auth/*', toNodeHandler(auth));

import configRoutes from './routes/config.routes.js';
import cronjobRoutes from './routes/cronjob.routes.js';
import logsRoutes from './routes/logs.routes.js';

// Routes will be mounted here
app.use('/api/configs', configRoutes);
app.use('/api/cronjob', cronjobRoutes);
app.use('/api/logs', logsRoutes);

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`[API] Server is running on port ${port}`);
  });
}

export default app;
