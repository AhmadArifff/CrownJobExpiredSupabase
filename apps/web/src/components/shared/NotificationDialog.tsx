'use client';

import React, { useEffect, useState } from 'react';
import {
  Bell,
  X,
  Sparkles,
  ShieldCheck,
  CheckCheck,
  RefreshCw,
  Inbox,
  Database,
} from 'lucide-react';
import { AnimatedListDemo } from '@/components/magicui/animated-list-demo';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { cn } from '@/lib/utils';

interface NotificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function NotificationDialog({
  isOpen,
  onClose,
  title = 'Notifikasi & Pesan Supabase',
  description = 'Data live real-time dari database Supabase & Keep-Alive audit logs.',
}: NotificationDialogProps) {
  const [activeTab, setActiveTab] = useState<'unread' | 'read'>('unread');
  const {
    notifications,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
  } = useNotificationStore();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  if (!isOpen) return null;

  const unreadList = notifications.filter((n) => !n.isRead);
  const readList = notifications.filter((n) => n.isRead);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog Card */}
      <div
        className={cn(
          'relative w-full max-w-xl overflow-hidden rounded-3xl z-50',
          'bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl',
          'border border-slate-200/80 dark:border-slate-800/80',
          'shadow-[0_25px_70px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_80px_rgba(0,0,0,0.6)]',
          'flex flex-col max-h-[90vh]'
        )}
      >
        {/* Glowing Top Accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-500 via-secondary-500 to-emerald-400" />

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex size-7 items-center justify-center rounded-xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 dark:text-brand-400">
                <Database className="size-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Database Supabase Feed
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Live DB
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
              {title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {description}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => fetchNotifications()}
              disabled={isLoading}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              title="Refresh database notifications"
            >
              <RefreshCw className={cn('size-4', isLoading && 'animate-spin')} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close Dialog"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Belum Dibaca & Sudah Dibaca) */}
        <div className="flex items-center justify-between px-6 pt-3 pb-2.5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="flex items-center gap-2">
            {/* Tab: Belum Dibaca */}
            <button
              onClick={() => setActiveTab('unread')}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2',
                activeTab === 'unread'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              )}
            >
              <Bell className="size-3.5" />
              <span>Belum Dibaca</span>
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                  activeTab === 'unread'
                    ? 'bg-white/20 text-white'
                    : 'bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300'
                )}
              >
                {unreadList.length}
              </span>
            </button>

            {/* Tab: Sudah Dibaca */}
            <button
              onClick={() => setActiveTab('read')}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2',
                activeTab === 'read'
                  ? 'bg-slate-800 text-white dark:bg-slate-700 shadow-md'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              )}
            >
              <CheckCheck className="size-3.5" />
              <span>Sudah Dibaca</span>
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                  activeTab === 'read'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                )}
              >
                {readList.length}
              </span>
            </button>
          </div>

          {/* Quick action: Mark All As Read */}
          {activeTab === 'unread' && unreadList.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <CheckCheck className="size-3.5" />
              <span>Tandai Semua Dibaca</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-[320px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[280px] gap-3 text-slate-500">
              <RefreshCw className="size-7 animate-spin text-brand-500" />
              <span className="text-xs font-medium">Mengambil notifikasi dari database Supabase...</span>
            </div>
          ) : activeTab === 'unread' ? (
            /* TAB: Belum Dibaca (Animasi 1x, Tidak Berulang, Live Data Supabase) */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                <span>Notifikasi baru belum dibaca</span>
                <span className="text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                  Animasi Spring 1x
                </span>
              </div>
              <AnimatedListDemo
                items={unreadList}
                disableAnimation={false}
                onToggleRead={(id) => markAsRead(id)}
              />
            </div>
          ) : (
            /* TAB: Sudah Dibaca (Statik, Tanpa Animasi Berulang) */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                <span>Riwayat notifikasi yang telah dibaca</span>
                <span className="text-[11px] bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">
                  Statik (Tanpa Animasi)
                </span>
              </div>
              <AnimatedListDemo
                items={readList}
                disableAnimation={true}
                onToggleRead={(id) => markAsUnread(id)}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50/80 dark:bg-slate-950/60 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            <span>Tersinkronisasi dengan Supabase Cloud</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium transition-colors"
          >
            Tutup Dialog
          </button>
        </div>
      </div>
    </div>
  );
}
export default NotificationDialog;
