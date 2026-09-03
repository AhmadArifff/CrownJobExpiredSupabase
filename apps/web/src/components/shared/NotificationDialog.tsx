'use client';

import React, { useState } from 'react';
import {
  Bell,
  X,
  Sparkles,
  ShieldCheck,
  Send,
  Plus,
  RefreshCw,
  MessageSquare,
  Check,
} from 'lucide-react';
import { AnimatedListDemo, NotificationItem, defaultNotifications } from '@/components/magicui/animated-list-demo';
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
  title = 'Live System Stream & Notifications',
  description = 'Real-time animated audit stream powered by Magic UI spring physics.',
}: NotificationDialogProps) {
  const [activeTab, setActiveTab] = useState<'stream' | 'create'>('stream');
  const [customList, setCustomList] = useState<NotificationItem[]>(defaultNotifications);
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customIcon, setCustomIcon] = useState('⚡');
  const [customColor, setCustomColor] = useState('#6366F1');
  const [feedback, setFeedback] = useState('');

  if (!isOpen) return null;

  const handleAddNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const newItem: NotificationItem = {
      name: customTitle.trim(),
      description: customDesc.trim() || 'Custom message dialog item',
      icon: customIcon || '🔔',
      color: customColor,
      time: 'Just now',
    };

    setCustomList([newItem, ...customList]);
    setCustomTitle('');
    setCustomDesc('');
    setFeedback('Notification added to the stream!');
    setTimeout(() => {
      setFeedback('');
      setActiveTab('stream');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog Card */}
      <div
        className={cn(
          'relative w-full max-w-xl overflow-hidden rounded-3xl z-50',
          'bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl',
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
                <Sparkles className="size-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Magic UI Animated Stream
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Live
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
              {title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {description}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 pt-3 pb-2 gap-2 border-b border-slate-100 dark:border-slate-800/60">
          <button
            onClick={() => setActiveTab('stream')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5',
              activeTab === 'stream'
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            )}
          >
            <Bell className="size-3.5" />
            Active Notifications ({customList.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5',
              activeTab === 'create'
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            )}
          >
            <Plus className="size-3.5" />
            Send Custom Notification
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'stream' ? (
            <div className="w-full">
              <AnimatedListDemo items={customList} className="h-[430px]" />
            </div>
          ) : (
            <form onSubmit={handleAddNotification} className="space-y-4 max-w-md mx-auto py-2">
              <div className="text-center space-y-1 mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Post New Notification / Alert Message
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Simulate incoming keep-alive alerts, messages, or payments with spring animations.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Notification Title *
                </label>
                <input
                  type="text"
                  required
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Supabase DB Ping Success"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description / Message
                </label>
                <textarea
                  rows={2}
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="e.g. Kept alive automatically, 7 days inactivity clock reset."
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Emoji / Icon
                  </label>
                  <div className="flex items-center gap-1.5">
                    {['⚡', '🛡️', '💬', '💸', '⏰', '🚀'].map((em) => (
                      <button
                        type="button"
                        key={em}
                        onClick={() => setCustomIcon(em)}
                        className={cn(
                          'size-8 rounded-lg flex items-center justify-center text-sm border transition-all',
                          customIcon === em
                            ? 'border-brand-500 bg-brand-500/10'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                        )}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Badge Color
                  </label>
                  <div className="flex items-center gap-2">
                    {['#6366F1', '#00C9A7', '#FFB800', '#FF3D71', '#1E86FF'].map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setCustomColor(c)}
                        className={cn(
                          'size-6 rounded-full border-2 transition-transform',
                          customColor === c ? 'scale-125 border-slate-900 dark:border-white' : 'border-transparent'
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {feedback && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 animate-in fade-in">
                  <Check className="size-4" /> {feedback}
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 transition-all"
              >
                <Send className="size-3.5" /> Push To Animated List
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50/80 dark:bg-slate-950/50 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            <span>Encrypted isolated stream</span>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-slate-200/60 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
          >
            Close Dialog
          </button>
        </div>
      </div>
    </div>
  );
}
