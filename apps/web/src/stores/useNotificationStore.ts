import { create } from 'zustand';
import { api } from '@/lib/api';
import { ActivityLogDTO, SupabaseConfigDTO } from '@cronjob/shared';

export interface NotificationRecord {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  time: string;
  timestamp: number;
  databaseName?: string;
  action?: string;
  status?: string;
  isRead: boolean;
}

interface NotificationState {
  notifications: NotificationRecord[];
  readIds: string[];
  isLoading: boolean;
  error: string | null;

  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  markAllAsRead: () => void;
  clearReadHistory: () => void;
}

const STORAGE_KEY = 'keepalive_read_notifications_v1';

const getStoredReadIds = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveStoredReadIds = (ids: string[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to save read notification IDs', e);
  }
};

const formatRelativeTime = (dateStr: string): string => {
  try {
    const time = new Date(dateStr).getTime();
    if (isNaN(time)) return 'Baru saja';
    const diffSec = Math.floor((Date.now() - time) / 1000);

    if (diffSec < 60) return 'Baru saja';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m lalu`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} jam lalu`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay} hari lalu`;
    return new Date(dateStr).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
  } catch {
    return 'Baru saja';
  }
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  readIds: [],
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    const currentReadIds = getStoredReadIds();

    try {
      // Parallel fetch from Supabase database endpoints
      const [logsRes, configsRes] = await Promise.all([
        api.get<ActivityLogDTO[]>('/logs'),
        api.get<SupabaseConfigDTO[]>('/configs'),
      ]);

      const items: NotificationRecord[] = [];

      // 1. Map real ActivityLogs from Supabase database
      if (logsRes.isSuccess && Array.isArray(logsRes.getValue())) {
        const logs = logsRes.getValue();
        logs.forEach((log) => {
          const logId = `log-${log.id}`;
          const isSuccess = log.status?.toUpperCase() === 'SUCCESS';
          const actionUpper = log.action?.toUpperCase() || 'OPERATION';

          let icon = '⚡';
          let color = '#10B981'; // Emerald

          if (!isSuccess) {
            icon = '❌';
            color = '#EF4444'; // Red
          } else if (actionUpper.includes('GENERATE') || actionUpper.includes('TABLE')) {
            icon = '📊';
            color = '#1E86FF'; // Blue
          } else if (actionUpper.includes('AUTO')) {
            icon = '⏰';
            color = '#6366F1'; // Indigo
          } else if (actionUpper.includes('TEST')) {
            icon = '🔌';
            color = '#8B5CF6'; // Violet
          }

          items.push({
            id: logId,
            name: `${log.databaseName || 'Supabase'} · ${actionUpper}`,
            description:
              log.message ||
              (isSuccess
                ? 'Operasi keep-alive database berhasil dieksekusi.'
                : 'Operasi keep-alive gagal dieksekusi.'),
            icon,
            color,
            time: formatRelativeTime(log.createdAt),
            timestamp: new Date(log.createdAt).getTime() || Date.now(),
            databaseName: log.databaseName,
            action: log.action,
            status: log.status,
            isRead: currentReadIds.includes(logId),
          });
        });
      }

      // 2. Map real SupabaseConfig status alerts from Supabase database
      if (configsRes.isSuccess && Array.isArray(configsRes.getValue())) {
        const configs = configsRes.getValue();
        configs.forEach((cfg) => {
          // Check inactivity warnings (> 4 days)
          if (cfg.lastInteraction) {
            const diffDays = Math.floor(
              (Date.now() - new Date(cfg.lastInteraction).getTime()) / (1000 * 60 * 60 * 24)
            );

            if (diffDays >= 4 || cfg.status === 'warning' || cfg.status === 'danger' || cfg.status === 'error') {
              const alertId = `inactivity-${cfg.id}-${cfg.lastInteraction?.slice(0, 10)}`;
              items.push({
                id: alertId,
                name: `Peringatan Inaktivitas: ${cfg.databaseName}`,
                description: `Tidak ada interaksi selama ${diffDays} hari. Supabase akan mem-pause database setelah 7 hari!`,
                icon: '⚠️',
                color: '#F59E0B',
                time: `${diffDays} hari lalu`,
                timestamp: new Date(cfg.lastInteraction).getTime(),
                databaseName: cfg.databaseName,
                status: cfg.status,
                isRead: currentReadIds.includes(alertId),
              });
            }
          }

          // Check if last ping failed
          if (cfg.lastPingStatus === 'failed') {
            const failId = `fail-ping-${cfg.id}`;
            items.push({
              id: failId,
              name: `Ping Gagal: ${cfg.databaseName}`,
              description: `Percobaan ping keep-alive terakhir gagal terhubung ke database.`,
              icon: '❌',
              color: '#EF4444',
              time: 'Terakhir dicek',
              timestamp: new Date(cfg.updatedAt || Date.now()).getTime(),
              databaseName: cfg.databaseName,
              status: 'error',
              isRead: currentReadIds.includes(failId),
            });
          }
        });
      }

      // If database has no logs or alerts yet, provide initial system status notification
      if (items.length === 0) {
        const welcomeId = 'sys-welcome-active';
        items.push({
          id: welcomeId,
          name: 'Sistem Keep-Alive Aktif',
          description: 'Semua konfigurasi database Supabase sedang dipantau secara otomatis.',
          icon: '🛡️',
          color: '#10B981',
          time: 'Baru saja',
          timestamp: Date.now(),
          isRead: currentReadIds.includes(welcomeId),
        });
      }

      // Sort by newest timestamp first
      items.sort((a, b) => b.timestamp - a.timestamp);

      set({
        notifications: items,
        readIds: currentReadIds,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err?.message || 'Gagal memuat notifikasi dari database Supabase.',
      });
    }
  },

  markAsRead: (id: string) => {
    const { readIds, notifications } = get();
    if (readIds.includes(id)) return;

    const newReadIds = [...readIds, id];
    saveStoredReadIds(newReadIds);

    set({
      readIds: newReadIds,
      notifications: notifications.map((item) =>
        item.id === id ? { ...item, isRead: true } : item
      ),
    });
  },

  markAsUnread: (id: string) => {
    const { readIds, notifications } = get();
    const newReadIds = readIds.filter((readId) => readId !== id);
    saveStoredReadIds(newReadIds);

    set({
      readIds: newReadIds,
      notifications: notifications.map((item) =>
        item.id === id ? { ...item, isRead: false } : item
      ),
    });
  },

  markAllAsRead: () => {
    const { notifications } = get();
    const allIds = notifications.map((n) => n.id);
    saveStoredReadIds(allIds);

    set({
      readIds: allIds,
      notifications: notifications.map((item) => ({ ...item, isRead: true })),
    });
  },

  clearReadHistory: () => {
    const { notifications } = get();
    // Keep only unread in the state
    set({
      notifications: notifications.filter((n) => !n.isRead),
    });
  },
}));
