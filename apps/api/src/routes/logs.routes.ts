import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { auth } from '../lib/auth.js';
import { Result } from '../lib/result.js';

const router = Router();

// Middleware to check authentication
const requireAuth = async (req: any, res: any, next: any) => {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return res.status(401).json(Result.fail('Unauthorized'));
  }
  req.user = session.user;
  next();
};

router.use(requireAuth);

// GET /api/logs
router.get('/', async (req: any, res: any) => {
  try {
    const logs = await prisma.activityLog.findMany({
      where: { userId: req.user.id },
      include: {
        config: {
          select: { databaseName: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to recent 100 for performance
    });

    // We can map config.projectName to make it easier for frontend
    // Wait, the Zod schema or frontend uses `projectName`, but earlier I removed it from SupabaseConfig.
    // I replaced it with `databaseName`. Let me fix this!
    
    const formattedLogs = logs.map(log => ({
      ...log,
      databaseName: log.config?.databaseName || 'Unknown',
    }));

    return res.json(Result.ok(formattedLogs));
  } catch (error: any) {
    return res.status(500).json(Result.fail(error.message));
  }
});

export default router;
