'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { AnimatedList } from '@/registry/magicui/animated-list';
import { Check, CheckCheck, RotateCcw } from 'lucide-react';

export interface NotificationItem {
  id?: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  time: string;
  isRead?: boolean;
  databaseName?: string;
}

export const Notification = ({
  id,
  name,
  description,
  icon,
  color,
  time,
  isRead = false,
  onToggleRead,
}: NotificationItem & {
  onToggleRead?: (id: string) => void;
}) => {
  return (
    <figure
      className={cn(
        'relative mx-auto min-h-fit w-full max-w-[420px] overflow-hidden rounded-2xl p-4',
        'transition-all duration-200 ease-in-out',
        // Hover
        'hover:scale-[102%]',
        // Light styles
        'bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.04),0_2px_6px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]',
        // Dark styles
        'transform-gpu dark:bg-slate-900/80 dark:[box-shadow:0_-20px_80px_-20px_#ffffff18_inset] dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.08)]',
        // Read vs Unread styling
        isRead
          ? 'opacity-70 dark:opacity-65 hover:opacity-100 dark:border-slate-800'
          : 'border-l-4 border-l-brand-500 shadow-md'
      )}
    >
      <div className="flex flex-row items-center gap-3">
        {/* Icon Avatar */}
        <div
          className="flex size-10 items-center justify-center rounded-2xl shrink-0 shadow-sm relative"
          style={{
            backgroundColor: color,
          }}
        >
          <span className="text-lg">{icon}</span>
          {!isRead && (
            <span className="absolute -top-1 -right-1 flex size-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500"></span>
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 overflow-hidden text-left min-w-0">
          <figcaption className="flex flex-row items-center justify-between text-sm font-medium text-slate-900 dark:text-white">
            <span className="truncate font-semibold">{name}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0 ml-2">{time}</span>
          </figcaption>
          <p className="text-xs font-normal text-slate-600 dark:text-slate-300/80 truncate mt-0.5">
            {description}
          </p>
        </div>

        {/* Mark Read/Unread Action Button */}
        {id && onToggleRead && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleRead(id);
            }}
            title={isRead ? 'Tandai belum dibaca' : 'Tandai sudah dibaca'}
            className={cn(
              'size-7 rounded-xl flex items-center justify-center shrink-0 text-xs transition-all border',
              isRead
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-brand-500 border-slate-200 dark:border-slate-700'
                : 'bg-brand-50 hover:bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 border-brand-200 dark:border-brand-500/30'
            )}
          >
            {isRead ? (
              <RotateCcw className="size-3.5" />
            ) : (
              <Check className="size-3.5" />
            )}
          </button>
        )}
      </div>
    </figure>
  );
};

export function AnimatedListDemo({
  className,
  items = [],
  disableAnimation = false,
  onToggleRead,
}: {
  className?: string;
  items?: NotificationItem[];
  disableAnimation?: boolean;
  onToggleRead?: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center h-[280px] p-6 text-center text-slate-500 dark:text-slate-400', className)}>
        <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
          <CheckCheck className="size-6 text-emerald-500" />
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Tidak ada notifikasi dalam kategori ini
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Semua pesan dan notifikasi keep-alive telah dibaca atau kosong.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex min-h-[300px] max-h-[460px] w-full flex-col overflow-y-auto p-2',
        className
      )}
    >
      <AnimatedList delay={500} repeat={false} disableAnimation={disableAnimation}>
        {items.map((item, idx) => (
          <Notification
            {...item}
            key={item.id || `notif-${idx}`}
            onToggleRead={onToggleRead}
          />
        ))}
      </AnimatedList>

      {/* Subtle fade gradients */}
      <div className="pointer-events-none sticky top-0 inset-x-0 h-6 bg-gradient-to-b from-white/80 dark:from-slate-900/80 to-transparent -mt-2 z-10"></div>
      <div className="pointer-events-none sticky bottom-0 inset-x-0 h-8 bg-gradient-to-t from-white/80 dark:from-slate-900/80 to-transparent -mb-2 z-10"></div>
    </div>
  );
}

export default AnimatedListDemo;
