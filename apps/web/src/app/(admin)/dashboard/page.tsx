'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  RefreshCw,
  Zap,
  ArrowRight,
  ShieldCheck,
  Globe,
  ExternalLink,
  Bell,
  Sparkles,
} from 'lucide-react';
import { useConfigStore } from '@/stores/useConfigStore';
import { useUIStore } from '@/stores/useUIStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { api } from '@/lib/api';
import { SupabaseConfigDTO } from '@cronjob/shared';
import { AnimatedListDemo } from '@/components/magicui/animated-list-demo';
import { NotificationDialog } from '@/components/shared/NotificationDialog';

export default function DashboardPage() {
  const { configs, setConfigs, setIsLoading, isLoading } = useConfigStore();
  const addToast = useUIStore((state) => state.addToast);
  const { notifications, fetchNotifications, markAsRead } = useNotificationStore();
  const [pingingId, setPingingId] = useState<string | null>(null);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);

  const unreadNotifications = notifications.filter((n) => !n.isRead);

  useEffect(() => {
    fetchUserConfigs();
    fetchNotifications();
  }, [fetchNotifications]);

  const fetchUserConfigs = async () => {
    setIsLoading(true);
    const res = await api.get<SupabaseConfigDTO[]>('/configs');
    setIsLoading(false);

    if (res.isSuccess) {
      setConfigs(res.getValue());
    } else {
      // Mock data for initial frontend demonstration
      const mockConfigs: SupabaseConfigDTO[] = [
        {
          id: 'cfg_1',
          userId: 'usr_demo',
          accountEmail: 'dev.team@company.com',
          databaseName: 'Production Analytics DB',
          supabaseUrl: 'https://xyzprod.supabase.co',
          supabaseAnonKey: 'eyJhbGciOi...XXXXX',
          supabaseServiceRoleKey: 'eyJhbGciOi...YYYYY',
          status: 'active',
          isTableGenerated: true,
          lastInteraction: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          lastPingStatus: 'success',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'cfg_2',
          userId: 'usr_demo',
          accountEmail: 'dev.team@company.com',
          databaseName: 'Staging Microservice DB',
          supabaseUrl: 'https://abcstag.supabase.co',
          supabaseAnonKey: 'eyJhbGciOi...ZZZZZ',
          supabaseServiceRoleKey: 'eyJhbGciOi...WWWWW',
          status: 'warning',
          isTableGenerated: true,
          lastInteraction: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          lastPingStatus: 'success',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setConfigs(mockConfigs);
    }
  };

  const handlePingNow = async (configId: string) => {
    setPingingId(configId);
    const res = await api.post<{ message: string }>(`/cronjob/${configId}/ping`, {
      pingMessage: `Manual Keep-Alive ${new Date().toISOString()}`,
    });
    setPingingId(null);

    if (res.isSuccess) {
      addToast({ type: 'success', message: 'Keep-alive ping sent successfully!' });
      fetchUserConfigs();
    } else {
      addToast({
        type: 'error',
        message: res.error || 'Failed to send ping',
        actionLabel: 'Retry',
        onAction: () => handlePingNow(configId),
      });
    }
  };

  const calculateDaysAgo = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return days === 0 ? 'Today' : `${days} days ago`;
  };

  // Status counters
  const total = configs.length;
  const activeCount = configs.filter((c) => c.status === 'active').length;
  const warningCount = configs.filter((c) => c.status === 'warning').length;
  const dangerCount = configs.filter((c) => c.status === 'danger' || c.status === 'error').length;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor and manage your configured Supabase databases keep-alive status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNotificationDialogOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2 border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:scale-105"
          >
            <Bell className="w-4 h-4 text-brand-500 dark:text-brand-400" />
            <span>Live Stream</span>
            {unreadNotifications.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {unreadNotifications.length}
              </span>
            )}
          </button>
          <Link
            href="/config"
            className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 font-semibold text-white text-sm flex items-center gap-2 shadow-lg shadow-brand-500/25 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" /> Add Supabase Config
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Accounts</span>
            <Database className="w-5 h-5 text-brand-500 dark:text-brand-400" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{total}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configured Supabase DBs</div>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Active</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{activeCount}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pinged within 4 days</div>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Warning</span>
            <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{warningCount}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Inactive &gt; 5 days</div>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Danger</span>
            <XCircle className="w-5 h-5 text-rose-500 dark:text-rose-400" />
          </div>
          <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">{dangerCount}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Critical (&gt; 6 days)</div>
        </div>
      </div>

      {/* Main Content Area */}
      {configs.length === 0 && !isLoading ? (
        /* Empty State */
        <div className="glass-panel p-12 rounded-3xl text-center flex flex-col items-center max-w-xl mx-auto border border-dashed border-slate-700">
          <div className="w-16 h-16 rounded-3xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-6 shadow-xl">
            <Database className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Welcome! Let&apos;s add your first Supabase Config</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-md leading-relaxed">
            You don&apos;t have any Supabase accounts configured yet. Add your project connection details to enable automated keep-alive pings.
          </p>
          <Link
            href="/config"
            className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 font-semibold text-white text-sm flex items-center gap-2 shadow-xl shadow-brand-500/30 transition-all hover:scale-105"
          >
            Add Your First Supabase Project <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        /* Account Cards List */
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-500 dark:text-brand-400" /> Your Configured Supabase Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {configs.map((cfg) => (
              <div key={cfg.id} className="glass-card p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg">{cfg.databaseName}</h3>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{cfg.supabaseUrl}</div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                        cfg.status === 'active'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                          : cfg.status === 'warning'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {cfg.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-3 my-3 border-y border-slate-200 dark:border-slate-800/80 text-xs">
                    <div>
                      <div className="text-slate-500 dark:text-slate-400 font-medium">Account Email</div>
                      <div className="text-slate-800 dark:text-slate-200 font-semibold truncate mt-0.5">{cfg.accountEmail}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 dark:text-slate-400 font-medium">Last Interaction</div>
                      <div suppressHydrationWarning className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5">
                        {calculateDaysAgo(cfg.lastInteraction)}
                      </div>
                    </div>
                  </div>

                  {cfg.websiteUrl && (
                    <div className="mb-3 flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-brand-500" /> App Website:
                      </span>
                      <a
                        href={cfg.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-1 truncate max-w-[180px]"
                      >
                        <span className="truncate">{cfg.websiteUrl}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Zap className="w-4 h-4 text-brand-500 dark:text-brand-400" />
                    <span>Table Ready: {cfg.isTableGenerated ? 'Yes' : 'No'}</span>
                  </div>
                  <button
                    onClick={() => handlePingNow(cfg.id)}
                    disabled={pingingId === cfg.id}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${pingingId === cfg.id ? 'animate-spin' : ''}`} />
                    {pingingId === cfg.id ? 'Pinging...' : 'Ping Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Magic UI Real-Time Notification Stream Card */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden relative shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex size-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Magic UI Animated Stream
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                Spring Physics
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
              Live Notifications & Activity Stream
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive message stream displaying live keep-alive signals, events, and background automated checks.
            </p>
          </div>
          <button
            onClick={() => setIsNotificationDialogOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-xs font-semibold text-white flex items-center gap-2 transition-all self-start sm:self-auto shadow-md shadow-brand-500/25 hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Open Message Dialog
          </button>
        </div>

        {/* Animated List Container (Data Real Supabase, Non-Repeating, Single Animation) */}
        <div className="max-w-lg mx-auto">
          <AnimatedListDemo
            items={unreadNotifications}
            disableAnimation={false}
            onToggleRead={(id) => markAsRead(id)}
            className="min-h-[260px] max-h-[400px]"
          />
        </div>
      </div>

      {/* Notification Modal Dialog */}
      <NotificationDialog
        isOpen={isNotificationDialogOpen}
        onClose={() => setIsNotificationDialogOpen(false)}
      />
    </div>
  );
}
