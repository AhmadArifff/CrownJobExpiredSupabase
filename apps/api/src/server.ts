import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Result } from '@cronjob/shared';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL || 'https://cronjob-keepalive-web.vercel.app']
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
import { auth } from './lib/auth';

// Better Auth routes
app.all('/api/auth/*', toNodeHandler(auth));

import configRoutes from './routes/config.routes';
import cronjobRoutes from './routes/cronjob.routes';
import logsRoutes from './routes/logs.routes';

// Routes will be mounted here
app.use('/api/configs', configRoutes);
app.use('/api/cronjob', cronjobRoutes);
app.use('/api/logs', logsRoutes);

app.listen(port, () => {
  console.log(`[API] Server is running on port ${port}`);
});
