import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { auth } from '../lib/auth';
import { Result } from '@cronjob/shared';
import { createClient } from '@supabase/supabase-js';

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

// GET /api/configs
router.get('/', async (req: any, res: any) => {
  try {
    const configs = await prisma.supabaseConfig.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(Result.ok(configs));
  } catch (error: any) {
    return res.status(500).json(Result.fail(error.message));
  }
});

// POST /api/configs
router.post('/', async (req: any, res: any) => {
  try {
    const { accountEmail, databaseName, supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey } = req.body;

    // Check limit max 2 configs
    const count = await prisma.supabaseConfig.count({
      where: { userId: req.user.id },
    });

    if (count >= 2) {
      return res.status(400).json(Result.fail('Maksimal 2 konfigurasi Supabase per akun.'));
    }

    const config = await prisma.supabaseConfig.create({
      data: {
        userId: req.user.id,
        accountEmail,
        databaseName,
        supabaseUrl,
        supabaseAnonKey,
        supabaseServiceRoleKey,
      },
    });

    return res.status(201).json(Result.ok(config));
  } catch (error: any) {
    return res.status(500).json(Result.fail(error.message));
  }
});

// DELETE /api/configs/:id
router.delete('/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const existing = await prisma.supabaseConfig.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json(Result.fail('Config not found'));
    }

    await prisma.supabaseConfig.delete({
      where: { id },
    });

    return res.json(Result.ok({ message: 'Konfigurasi berhasil dihapus' }));
  } catch (error: any) {
    return res.status(500).json(Result.fail(error.message));
  }
});

// POST /api/configs/:id/test-connection
router.post('/:id/test-connection', async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const config = await prisma.supabaseConfig.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!config) {
      return res.status(404).json(Result.fail('Config not found'));
    }

    const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);
    
    // Test connection by fetching 1 row from cronjob_keepalive
    const { data, error } = await supabase.from('cronjob_keepalive').select('*').limit(1);

    if (error) {
      if (error.code === '42P01') {
        // relation "cronjob_keepalive" does not exist
        await prisma.activityLog.create({
          data: { userId: req.user.id, configId: config.id, action: 'health_check', status: 'failed', message: 'Table not found' }
        });
        return res.status(400).json(Result.fail('Tabel cronjob_keepalive belum dibuat. Silakan klik Generate Table.'));
      }
      
      await prisma.activityLog.create({
        data: { userId: req.user.id, configId: config.id, action: 'health_check', status: 'failed', message: error.message }
      });
      return res.status(400).json(Result.fail(error.message));
    }

    // Update isTableGenerated status to true since it exists
    await prisma.supabaseConfig.update({
      where: { id },
      data: { isTableGenerated: true, status: 'active', lastPingStatus: 'success' }
    });

    await prisma.activityLog.create({
      data: { userId: req.user.id, configId: config.id, action: 'health_check', status: 'success', message: 'Connection OK' }
    });
    return res.json(Result.ok({ isTableGenerated: true, message: 'Koneksi berhasil dan tabel ditemukan.' }));
  } catch (error: any) {
    return res.status(500).json(Result.fail(error.message));
  }
});

export default router;
