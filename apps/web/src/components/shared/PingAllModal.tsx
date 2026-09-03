'use client';

import React, { useState, useEffect, useRef, forwardRef } from 'react';
import {
  User,
  Zap,
  Database,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  X,
  Sparkles,
  ShieldCheck,
  Server,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedBeam } from '@/components/magicui/animated-beam';
import { SupabaseConfigDTO } from '@cronjob/shared';
import { api } from '@/lib/api';

interface PingAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  configs: SupabaseConfigDTO[];
  onComplete?: () => void;
}

type PingStatus = 'idle' | 'pinging' | 'success' | 'failed';

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'z-10 flex size-12 items-center justify-center rounded-2xl border-2 bg-slate-900 p-2.5 shadow-[0_0_25px_-5px_rgba(0,0,0,0.5)] transition-all duration-300',
        className
      )}
    >
      {children}
    </div>
  );
});
Circle.displayName = 'Circle';

export function PingAllModal({
  isOpen,
  onClose,
  configs,
  onComplete,
}: PingAllModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [statuses, setStatuses] = useState<Record<string, PingStatus>>({});
  const [latencies, setLatencies] = useState<Record<string, number>>({});
  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({});
  const [isPingingAll, setIsPingingAll] = useState(false);
  const [hasExecuted, setHasExecuted] = useState(false);

  // Initialize statuses
  useEffect(() => {
    if (isOpen && configs.length > 0) {
      const initialStatus: Record<string, PingStatus> = {};
      configs.forEach((c) => {
        initialStatus[c.id] = 'idle';
      });
      setStatuses(initialStatus);
      setLatencies({});
      setErrorMessages({});
      setHasExecuted(false);
    }
  }, [isOpen, configs]);

  // Execute concurrent ping for all databases
  const handleStartPingAll = async () => {
    if (isPingingAll || configs.length === 0) return;
    setIsPingingAll(true);
    setHasExecuted(true);

    // Set all to pinging
    const pingingState: Record<string, PingStatus> = {};
    configs.forEach((c) => {
      pingingState[c.id] = 'pinging';
    });
    setStatuses(pingingState);

    // Run parallel ping for each config
    const pingPromises = configs.map(async (cfg) => {
      const startTime = performance.now();
      try {
        const res = await api.post(`/cronjob/${cfg.id}/ping`, {
          pingMessage: `Animated Beam keep-alive ping ${new Date().toISOString()}`,
        });
        const elapsed = Math.round(performance.now() - startTime);

        if (res.isSuccess) {
          setStatuses((prev) => ({ ...prev, [cfg.id]: 'success' }));
          setLatencies((prev) => ({ ...prev, [cfg.id]: elapsed }));
        } else {
          setStatuses((prev) => ({ ...prev, [cfg.id]: 'failed' }));
          setErrorMessages((prev) => ({
            ...prev,
            [cfg.id]: res.error || 'Connection failed',
          }));
        }
      } catch (err: any) {
        setStatuses((prev) => ({ ...prev, [cfg.id]: 'failed' }));
        setErrorMessages((prev) => ({
          ...prev,
          [cfg.id]: err.message || 'Network error',
        }));
      }
    });

    await Promise.all(pingPromises);
    setIsPingingAll(false);
    onComplete?.();
  };

  if (!isOpen) return null;

  const successCount = Object.values(statuses).filter((s) => s === 'success').length;
  const failCount = Object.values(statuses).filter((s) => s === 'failed').length;
  const totalCount = configs.length;
  const progressPercent = totalCount > 0 ? Math.round(((successCount + failCount) / totalCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex size-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400 font-mono">
                Magic UI Animated Beam
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                Real-Time Keep-Alive Stream
              </span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="size-5 text-brand-400" /> Ping All Supabase Projects
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualisasi transmisi heartbeat serentak ke semua database terdaftar untuk mereset masa tenggang 7 hari Supabase.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Beam Interactive Stage */}
        <div
          ref={containerRef}
          className="relative flex-1 min-h-[380px] max-h-[480px] w-full overflow-y-auto overflow-x-hidden p-6 sm:p-10 flex items-center justify-between gap-6 sm:gap-12 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900"
        >
          {/* Node 1: Admin / User */}
          <div className="flex flex-col items-center gap-2 shrink-0 z-20">
            <Circle
              ref={userRef}
              className="size-16 border-brand-500/50 bg-gradient-to-tr from-brand-600/30 to-indigo-600/30 text-brand-400 shadow-lg shadow-brand-500/20"
            >
              <User className="size-7 text-white" />
            </Circle>
            <div className="text-center">
              <span className="text-xs font-bold text-white block">Super Admin</span>
              <span className="text-[10px] text-slate-400 font-mono">Trigger Origin</span>
            </div>
          </div>

          {/* Node 2: KeepAlive Hub Engine */}
          <div className="flex flex-col items-center gap-2 shrink-0 z-20">
            <Circle
              ref={hubRef}
              className={cn(
                'size-20 border-2 transition-all duration-300 relative',
                isPingingAll
                  ? 'border-emerald-400 bg-gradient-to-br from-emerald-500/30 via-brand-500/30 to-indigo-500/30 shadow-2xl shadow-emerald-500/40 animate-pulse'
                  : 'border-brand-500/60 bg-gradient-to-br from-brand-600/20 to-purple-600/20 text-white shadow-xl shadow-brand-500/30'
              )}
            >
              <Zap
                className={cn(
                  'size-9 text-brand-400 transition-transform',
                  isPingingAll && 'text-emerald-400 scale-110'
                )}
              />
              {isPingingAll && (
                <span className="absolute inset-0 rounded-2xl border-2 border-emerald-400 animate-ping opacity-60" />
              )}
            </Circle>
            <div className="text-center">
              <span className="text-xs font-bold text-white block">KeepAlive Hub</span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center justify-center gap-1">
                <Server className="size-3" /> Cron Engine
              </span>
            </div>
          </div>

          {/* Node 3: Vertical Stack of Supabase Projects */}
          <div className="flex flex-col gap-3.5 z-20 min-w-[200px] max-w-[280px]">
            {configs.length === 0 ? (
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 text-center text-xs text-slate-400">
                Belum ada database Supabase yang dikonfigurasi.
              </div>
            ) : (
              configs.map((cfg, idx) => {
                const status = statuses[cfg.id] || 'idle';
                const latency = latencies[cfg.id];

                return (
                  <div
                    key={cfg.id}
                    className={cn(
                      'flex items-center gap-3 p-2 rounded-2xl border transition-all duration-200',
                      status === 'success' && 'border-emerald-500/50 bg-emerald-500/10',
                      status === 'failed' && 'border-rose-500/50 bg-rose-500/10',
                      status === 'pinging' && 'border-brand-500/50 bg-brand-500/10 animate-pulse',
                      status === 'idle' && 'border-slate-800/80 bg-slate-900/60'
                    )}
                  >
                    <Circle
                      ref={(el) => {
                        itemRefs.current[idx] = el;
                      }}
                      className={cn(
                        'size-11 shrink-0 border transition-all',
                        status === 'success' && 'border-emerald-400 text-emerald-400 bg-emerald-950/60 shadow-emerald-500/30',
                        status === 'failed' && 'border-rose-400 text-rose-400 bg-rose-950/60 shadow-rose-500/30',
                        status === 'pinging' && 'border-brand-400 text-brand-400 bg-brand-950/60 animate-spin',
                        status === 'idle' && 'border-slate-700 text-slate-400 bg-slate-800/80'
                      )}
                    >
                      <Database className="size-5" />
                    </Circle>

                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-white truncate">
                          {cfg.databaseName}
                        </span>
                        {status === 'success' && (
                          <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                        )}
                        {status === 'failed' && (
                          <XCircle className="size-3.5 text-rose-400 shrink-0" />
                        )}
                        {status === 'pinging' && (
                          <Loader2 className="size-3.5 text-brand-400 animate-spin shrink-0" />
                        )}
                      </div>

                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                        {status === 'success' && (
                          <span className="text-emerald-400 font-semibold">
                            ● Active ({latency ?? 24}ms)
                          </span>
                        )}
                        {status === 'failed' && (
                          <span className="text-rose-400 font-semibold">
                            ● Error: {errorMessages[cfg.id] || 'Gagal'}
                          </span>
                        )}
                        {status === 'pinging' && (
                          <span className="text-brand-400 animate-pulse">
                            ● Transmitting heartbeat...
                          </span>
                        )}
                        {status === 'idle' && (
                          <span className="text-slate-500">
                            Menunggu pemeriksaan...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* AnimatedBeams from User -> Hub */}
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={userRef}
            toRef={hubRef}
            duration={isPingingAll ? 1.5 : 3}
            gradientStartColor="#6366f1"
            gradientStopColor="#a855f7"
          />

          {/* AnimatedBeams from Hub -> each Project Target */}
          {configs.map((cfg, idx) => {
            const status = statuses[cfg.id] || 'idle';
            // Calculate gentle curvature for aesthetic fan-out
            const total = configs.length;
            const middle = (total - 1) / 2;
            const curvature = total > 1 ? (idx - middle) * 15 : 0;

            let startColor = '#6366f1';
            let stopColor = '#a855f7';

            if (status === 'success') {
              startColor = '#10b981';
              stopColor = '#34d399';
            } else if (status === 'failed') {
              startColor = '#ef4444';
              stopColor = '#f43f5e';
            } else if (status === 'pinging') {
              startColor = '#3b82f6';
              stopColor = '#10b981';
            }

            return (
              <AnimatedBeam
                key={cfg.id}
                containerRef={containerRef}
                fromRef={hubRef}
                toRef={{ current: itemRefs.current[idx] }}
                curvature={curvature}
                duration={isPingingAll ? 1.5 : 3.5}
                gradientStartColor={startColor}
                gradientStopColor={stopColor}
              />
            );
          })}
        </div>

        {/* Footer & Progress Controls */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {hasExecuted && (
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  <CheckCircle2 className="size-3.5" />
                  {successCount} Berhasil
                </span>
                {failCount > 0 && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                    <XCircle className="size-3.5" />
                    {failCount} Gagal
                  </span>
                )}
                <span className="text-slate-400 font-mono">
                  {progressPercent}% Selesai
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handleStartPingAll}
              disabled={isPingingAll || configs.length === 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 via-brand-600 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-brand-500/25 transition-all hover:scale-105 disabled:opacity-50"
            >
              {isPingingAll ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Mengirim Heartbeat Serentak...
                </>
              ) : hasExecuted ? (
                <>
                  <RefreshCw className="size-3.5" />
                  Ulangi Ping Serentak
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" />
                  Mulai Ping Serentak ({configs.length} Project)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PingAllModal;
