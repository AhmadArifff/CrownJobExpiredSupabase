'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { AnimatedList } from '@/registry/magicui/animated-list';

export interface NotificationItem {
  name: string;
  description: string;
  icon: string;
  color: string;
  time: string;
}

export const defaultNotifications: NotificationItem[] = [
  {
    name: 'Keep-Alive Ping Sent',
    description: 'Supabase Production DB pinged successfully',
    time: 'Just now',
    icon: '⚡',
    color: '#00C9A7',
  },
  {
    name: 'Table Row Generated',
    description: '_keep_alive table updated with heartbeat',
    time: '2m ago',
    icon: '📊',
    color: '#1E86FF',
  },
  {
    name: 'Payment received',
    description: 'Magic UI Cloud subscription',
    time: '15m ago',
    icon: '💸',
    color: '#00C9A7',
  },
  {
    name: 'User signed up',
    description: 'New admin authenticated via Better Auth',
    time: '10m ago',
    icon: '👤',
    color: '#FFB800',
  },
  {
    name: 'CronJob Scheduled',
    description: 'Vercel cron keep-alive check started',
    time: '5m ago',
    icon: '⏰',
    color: '#6366F1',
  },
  {
    name: 'New message',
    description: 'Database pause prevented for 7 days',
    time: '3m ago',
    icon: '💬',
    color: '#FF3D71',
  },
  {
    name: 'System Health OK',
    description: 'All 3 Supabase connections responsive',
    time: '1m ago',
    icon: '🛡️',
    color: '#10B981',
  },
  {
    name: 'New event',
    description: 'Automated audit log recorded',
    time: '2m ago',
    icon: '🗞️',
    color: '#1E86FF',
  },
];

export const Notification = ({
  name,
  description,
  icon,
  color,
  time,
}: NotificationItem) => {
  return (
    <figure
      className={cn(
        'relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-4',
        // animation styles
        'transition-all duration-200 ease-in-out hover:scale-[103%]',
        // light styles
        'bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]',
        // dark styles
        'transform-gpu dark:bg-slate-900/60 dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)]'
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div
          className="flex size-10 items-center justify-center rounded-2xl shrink-0 shadow-sm"
          style={{
            backgroundColor: color,
          }}
        >
          <span className="text-lg">{icon}</span>
        </div>
        <div className="flex flex-col overflow-hidden text-left">
          <figcaption className="flex flex-row items-center text-sm sm:text-base font-medium whitespace-pre text-slate-900 dark:text-white">
            <span className="truncate">{name}</span>
            <span className="mx-1 text-slate-400">·</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{time}</span>
          </figcaption>
          <p className="text-xs sm:text-sm font-normal text-slate-600 dark:text-white/60 truncate">
            {description}
          </p>
        </div>
      </div>
    </figure>
  );
};

export function AnimatedListDemo({
  className,
  items,
}: {
  className?: string;
  items?: NotificationItem[];
}) {
  const listItems = items && items.length > 0 ? items : defaultNotifications;
  // Repeat for continuous animation stream
  const extendedItems = Array.from({ length: 4 }, () => listItems).flat();

  return (
    <div
      className={cn(
        'relative flex h-[460px] w-full flex-col overflow-hidden p-2',
        className
      )}
    >
      <AnimatedList delay={1500}>
        {extendedItems.map((item, idx) => (
          <Notification {...item} key={`${item.name}-${idx}`} />
        ))}
      </AnimatedList>

      {/* Top fade gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-slate-50 dark:from-slate-950 to-transparent"></div>
      {/* Bottom fade gradient */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent"></div>
    </div>
  );
}

export default AnimatedListDemo;
