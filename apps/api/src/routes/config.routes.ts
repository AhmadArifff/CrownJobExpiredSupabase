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
// PRD Flow: 1) Try connect  2) Check table  3) Auto CREATE if missing
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

    // ── Step 1: Try connect ────────────────────────────────────
    // A lightweight connectivity test (system catalog is always readable)
    const { error: connError } = await supabase.from('_prisma_migrations').select('id').limit(0).maybeSingle();
    // Even if _prisma_migrations doesn't exist the error will be a
    // "table not found" NOT a connectivity error, so we continue.
    // A real connectivity error looks like "FetchError" / network error.
    if (connError && !JSON.stringify(connError).includes('Could not find')) {
      // Might still be a schema-cache miss, try the table we actually care about
    }

    // ── Step 2: Check if cronjob_keepalive exists ──────────────
    const { data, error: tableError } = await supabase
      .from('cronjob_keepalive')
      .select('id')
      .limit(1);

    const tableIsMissing =
      tableError &&
      (tableError.code === '42P01' ||
        JSON.stringify(tableError).includes('Could not find the table') ||
        JSON.stringify(tableError).includes('does not exist'));

    if (tableError && !tableIsMissing) {
      // Genuine connection / auth error
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          configId: config.id,
          action: 'health_check',
          status: 'failed',
          message: tableError.message || JSON.stringify(tableError),
        },
      });
      await prisma.supabaseConfig.update({
        where: { id },
        data: { status: 'error' },
      });
      return res.status(400).json(
        Result.fail(`Connection failed: ${tableError.message || JSON.stringify(tableError)}`)
      );
    }

    // ── Step 3: Auto CREATE TABLE if missing ───────────────────
    if (tableIsMissing) {
      const { migrateKeepAliveTable } = await import('../lib/supabase-remote-sql');
      const migResult = await migrateKeepAliveTable(config.supabaseUrl, config.supabaseServiceRoleKey);

      if (!migResult.success) {
        // Connection OK but table creation failed → status stays active, isTableGenerated stays false
        await prisma.activityLog.create({
          data: {
            userId: req.user.id,
            configId: config.id,
            action: 'generate_table',
            status: 'failed',
            message: migResult.error || 'Auto migration failed',
          },
        });
        await prisma.supabaseConfig.update({
          where: { id },
          data: { status: 'active', isTableGenerated: false },
        });
        return res.status(400).json(
          Result.fail(`Koneksi berhasil tetapi pembuatan tabel gagal: ${migResult.error}`)
        );
      }

      // Verify the table is now visible to PostgREST
      const { error: verifyErr } = await supabase.from('cronjob_keepalive').select('id').limit(1);
      if (verifyErr) {
        // Table was created but PostgREST hasn't reloaded yet
        await prisma.supabaseConfig.update({
          where: { id },
          data: { status: 'active', isTableGenerated: true },
        });
        await prisma.activityLog.create({
          data: {
            userId: req.user.id,
            configId: config.id,
            action: 'generate_table',
            status: 'success',
            message: 'Table created, schema cache reloading',
          },
        });
        return res.json(
          Result.ok({
            isTableGenerated: true,
            message: 'Tabel berhasil dibuat! Silakan tunggu beberapa detik lalu test ulang.',
          })
        );
      }

      // Table created and verified
      await prisma.supabaseConfig.update({
        where: { id },
        data: { isTableGenerated: true, status: 'active', lastPingStatus: 'success' },
      });
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          configId: config.id,
          action: 'generate_table',
          status: 'success',
          message: 'Table auto-created and verified',
        },
      });
      return res.json(
        Result.ok({
          isTableGenerated: true,
          message: 'Connected & Table Generated — tabel cronjob_keepalive berhasil dibuat otomatis!',
        })
      );
    }

    // ── Table already exists ───────────────────────────────────
    await prisma.supabaseConfig.update({
      where: { id },
      data: { isTableGenerated: true, status: 'active', lastPingStatus: 'success' },
    });
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        configId: config.id,
        action: 'health_check',
        status: 'success',
        message: 'Connection OK, table exists',
      },
    });
    return res.json(
      Result.ok({
        isTableGenerated: true,
        message: 'Connected & Ready — koneksi berhasil dan tabel sudah ada.',
      })
    );
  } catch (error: any) {
    return res.status(500).json(Result.fail(error.message));
  }
});

export default router;
