import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { auth } from '../lib/auth';
import { createClient } from '@supabase/supabase-js';
import { Result } from '@cronjob/shared';

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

// POST /:configId/generate-table (Fallback manual trigger per PRD US-3.2)
router.post('/:configId/generate-table', async (req: any, res: any) => {
  try {
    const { configId } = req.params;

    const config = await prisma.supabaseConfig.findFirst({
      where: { id: configId, userId: req.user.id },
    });

    if (!config) {
      return res.status(404).json(Result.fail('Config not found'));
    }

    if (!config.databasePassword) {
      return res.status(400).json(
        Result.fail('Database Password belum diisi. Silakan update config dengan menambahkan Database Password dari Supabase Dashboard → Settings → Database.')
      );
    }

    const { migrateKeepAliveTable } = await import('../lib/supabase-remote-sql');
    const migResult = await migrateKeepAliveTable(config.supabaseUrl, config.databasePassword);

    if (!migResult.success) {
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          configId: config.id,
          action: 'generate_table',
          status: 'failed',
          message: migResult.error || 'Migration failed',
        },
      });
      return res.status(400).json(Result.fail(`Migrasi tabel gagal: ${migResult.error}`));
    }

    // Update config status
    await prisma.supabaseConfig.update({
      where: { id: configId },
      data: { isTableGenerated: true, status: 'active' },
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        configId: config.id,
        action: 'generate_table',
        status: 'success',
        message: 'Table created successfully via migration',
      },
    });

    return res.json(
      Result.ok({ isTableGenerated: true, message: 'Tabel cronjob_keepalive berhasil dibuat!' })
    );
  } catch (error: any) {
    return res.status(500).json(Result.fail(error.message));
  }
});

// GET /:configId/data
router.get('/:configId/data', async (req: any, res: any) => {
  try {
    const { configId } = req.params;

    const config = await prisma.supabaseConfig.findFirst({
      where: { id: configId, userId: req.user.id },
    });

    if (!config) {
      return res.status(404).json(Result.fail('Config not found'));
    }

    const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);
    
    const { data, error } = await supabase
      .from('cronjob_keepalive')
      .select('id, source, message, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      const errStr = JSON.stringify(error);
      if (errStr.includes('Could not find the table') || errStr.includes('does not exist')) {
        return res.status(400).json(Result.fail('Tabel cronjob_keepalive belum dibuat. Silakan buat menggunakan script SQL.'));
      }
      return res.status(400).json(Result.fail(error.message || errStr));
    }

    const mappedData = data.map((row: any) => ({
      id: row.id,
      pingMessage: row.message,
      createdBy: row.source,
      createdAt: row.created_at,
    }));

    return res.json(Result.ok(mappedData));
  } catch (error: any) {
    return res.status(500).json(Result.fail(error.message));
  }
});

// POST /:configId/ping
router.post('/:configId/ping', async (req: any, res: any) => {
  try {
    const { configId } = req.params;
    const { pingMessage } = req.body;

    const config = await prisma.supabaseConfig.findFirst({
      where: { id: configId, userId: req.user.id },
    });

    if (!config) {
      return res.status(404).json(Result.fail('Config not found'));
    }

    const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);
    
    // Insert ping
    const { error: insertError } = await supabase.from('cronjob_keepalive').insert([
      { source: 'CronJob Manager', message: pingMessage || 'Ping' }
    ]);

    if (insertError) {
      const errStr = JSON.stringify(insertError);
      if (errStr.includes('Could not find the table') || errStr.includes('does not exist')) {
        return res.status(400).json(Result.fail('Tabel cronjob_keepalive belum dibuat. Silakan buat menggunakan script SQL.'));
      }
      await prisma.activityLog.create({
        data: { userId: req.user.id, configId: config.id, action: 'insert', status: 'failed', message: insertError.message || errStr }
      });
      return res.status(400).json(Result.fail(`Gagal insert data: ${insertError.message || errStr}`));
    }

    // Update last interaction
    await prisma.supabaseConfig.update({
      where: { id: config.id },
      data: { lastInteraction: new Date(), lastPingStatus: 'success' }
    });

    await prisma.activityLog.create({
      data: { userId: req.user.id, configId: config.id, action: 'insert', status: 'success' }
    });
    return res.json(Result.ok({ message: 'Ping berhasil. Data ditambahkan.' }));
  } catch (error: any) {
    return res.status(500).json(Result.fail(error.message));
  }
});

// DELETE /:configId/data/:rowId
router.delete('/:configId/data/:rowId', async (req: any, res: any) => {
  try {
    const { configId, rowId } = req.params;

    const config = await prisma.supabaseConfig.findFirst({
      where: { id: configId, userId: req.user.id },
    });

    if (!config) {
      return res.status(404).json(Result.fail('Config not found'));
    }

    const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);
    
    const { error } = await supabase
      .from('cronjob_keepalive')
      .delete()
      .eq('id', parseInt(rowId, 10));

    if (error) {
      await prisma.activityLog.create({
        data: { userId: req.user.id, configId: config.id, action: 'delete', status: 'failed', message: error.message }
      });
      return res.status(400).json(Result.fail(error.message));
    }

    await prisma.activityLog.create({
      data: { userId: req.user.id, configId: config.id, action: 'delete', status: 'success' }
    });
    return res.json(Result.ok({ message: 'Baris berhasil dihapus' }));
  } catch (error: any) {
    return res.status(500).json(Result.fail(error.message));
  }
});

// POST /ping-all
router.post('/ping-all', async (req: any, res: any) => {
  try {
    const configs = await prisma.supabaseConfig.findMany({
      where: { userId: req.user.id, status: 'active' },
    });

    let successCount = 0;
    for (const config of configs) {
      const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);
      const { error } = await supabase.from('cronjob_keepalive').insert([
        { source: 'CronJob Manager Auto-Ping', message: 'Ping All' }
      ]);
      
      if (!error) {
        successCount++;
        await prisma.supabaseConfig.update({
          where: { id: config.id },
          data: { lastInteraction: new Date(), lastPingStatus: 'success' }
        });
        await prisma.activityLog.create({
          data: { userId: req.user.id, configId: config.id, action: 'auto_ping', status: 'success' }
        });
      }
    }

    return res.json(Result.ok({ message: `Berhasil ping ${successCount} dari ${configs.length} database aktif.` }));
  } catch (error: any) {
    return res.status(500).json(Result.fail(error.message));
  }
});

export default router;
