'use client';

import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
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
  AlertTriangle,
  FileText,
  ArrowRight,
  Settings,
  HelpCircle,
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
type ActiveView = 'visual' | 'report';
type ReportFilter = 'all' | 'failed' | 'success';

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

  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('visual');
  const [reportFilter, setReportFilter] = useState<ReportFilter>('all');
  const [statuses, setStatuses] = useState<Record<string, PingStatus>>({});
  const [latencies, setLatencies] = useState<Record<string, number>>({});
  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({});
  const [isPingingAll, setIsPingingAll] = useState(false);
  const [hasExecuted, setHasExecuted] = useState(false);
  const [generatingTableId, setGeneratingTableId] = useState<string | null>(null);
  const [retryingSingleId, setRetryingSingleId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const prevIsOpenRef = useRef(false);

  // Initialize statuses ONLY when modal transitions from closed to open!
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current && configs.length > 0) {
      const initialStatus: Record<string, PingStatus> = {};
      configs.forEach((c) => {
        initialStatus[c.id] = 'idle';
      });
      setStatuses(initialStatus);
      setLatencies({});
      setErrorMessages({});
      setHasExecuted(false);
      setActiveView('visual');
      setReportFilter('all');
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]);

  const handleManualClose = () => {
    onClose();
    if (hasExecuted) {
      onComplete?.();
    }
  };

  // Ping a single config
  const handleSinglePing = async (cfg: SupabaseConfigDTO) => {
    setRetryingSingleId(cfg.id);
    setStatuses((prev) => ({ ...prev, [cfg.id]: 'pinging' }));
    const startTime = performance.now();

    try {
      const res = await api.post(`/cronjob/${cfg.id}/ping`, {
        pingMessage: `Keep-alive ping ${new Date().toISOString()}`,
      });
      const elapsed = Math.round(performance.now() - startTime);

      if (res.isSuccess) {
        setStatuses((prev) => ({ ...prev, [cfg.id]: 'success' }));
        setLatencies((prev) => ({ ...prev, [cfg.id]: elapsed }));
        setErrorMessages((prev) => {
          const copy = { ...prev };
          delete copy[cfg.id];
          return copy;
        });
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
    } finally {
      setRetryingSingleId(null);
    }
  };

  // Auto-generate table then retry ping
  const handleGenerateTable = async (cfg: SupabaseConfigDTO) => {
    setGeneratingTableId(cfg.id);
    try {
      const res = await api.post(`/cronjob/${cfg.id}/generate-table`);
      if (res.isSuccess) {
        await handleSinglePing(cfg);
      } else {
        setErrorMessages((prev) => ({
          ...prev,
          [cfg.id]: `Migrasi gagal: ${res.error || 'Gagal membuat tabel'}`,
        }));
      }
    } catch (err: any) {
      setErrorMessages((prev) => ({
        ...prev,
        [cfg.id]: err.message || 'Gagal mengeksekusi migrasi',
      }));
    } finally {
      setGeneratingTableId(null);
    }
  };

  // Execute concurrent ping for all databases
  const handleStartPingAll = async (targetConfigs: SupabaseConfigDTO[] = configs) => {
    if (isPingingAll || targetConfigs.length === 0) return;
    setIsPingingAll(true);
    setHasExecuted(true);

    // Set targets to pinging
    setStatuses((prev) => {
      const copy = { ...prev };
      targetConfigs.forEach((c) => {
        copy[c.id] = 'pinging';
      });
      return copy;
    });

    const pingPromises = targetConfigs.map(async (cfg) => {
      const startTime = performance.now();
      try {
        const res = await api.post(`/cronjob/${cfg.id}/ping`, {
          pingMessage: `Animated Beam keep-alive ping ${new Date().toISOString()}`,
        });
        const elapsed = Math.round(performance.now() - startTime);

        if (res.isSuccess) {
          setStatuses((prev) => ({ ...prev, [cfg.id]: 'success' }));
          setLatencies((prev) => ({ ...prev, [cfg.id]: elapsed }));
          setErrorMessages((prev) => {
            const copy = { ...prev };
            delete copy[cfg.id];
            return copy;
          });
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

    // Langsung buka tampilan ringkasan laporan tanpa timer / timing set!
    setActiveView('report');
  };

  // Retry only failed projects
  const handleRetryFailedOnly = () => {
    const failedConfigs = configs.filter((c) => statuses[c.id] === 'failed');
    if (failedConfigs.length > 0) {
      handleStartPingAll(failedConfigs);
    }
  };

  if (!isOpen || !mounted) return null;

  const successCount = Object.values(statuses).filter((s) => s === 'success').length;
  const failCount = Object.values(statuses).filter((s) => s === 'failed').length;
  const totalCount = configs.length;
  const progressPercent =
    totalCount > 0 ? Math.round(((successCount + failCount) / totalCount) * 100) : 0;

  const filteredConfigs = configs.filter((c) => {
    if (reportFilter === 'failed') return statuses[c.id] === 'failed';
    if (reportFilter === 'success') return statuses[c.id] === 'success';
    return true;
  });

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop (Static backdrop - modal only closes when user clicks Close/Tutup button) */}
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] z-10 my-auto">
        {/* Glowing Top Accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-500 via-purple-500 to-emerald-400 shrink-0" />

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/90 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex size-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400 font-mono">
                Magic UI Animated Beam
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                Real-Time Keep-Alive Hub
              </span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="size-5 text-brand-400" /> Ping All Supabase Projects
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualisasi transmisi heartbeat serentak & laporan hasil eksekusi keep-alive database.
            </p>
          </div>
          <button
            onClick={handleManualClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Tutup Modal"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* View Mode Navigation Tabs */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-2.5 border-b border-slate-800 bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('visual')}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5',
                activeView === 'visual'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Zap className="size-3.5" />
              <span>Visual Sinar Real-Time</span>
            </button>

            <button
              onClick={() => setActiveView('report')}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5',
                activeView === 'report'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <FileText className="size-3.5" />
              <span>Ringkasan & Laporan Hasil</span>
              {hasExecuted && (
                <span
                  className={cn(
                    'px-1.5 py-0.2 rounded-full text-[10px] font-bold ml-0.5',
                    failCount > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                  )}
                >
                  {successCount}/{totalCount}
                </span>
              )}
            </button>
          </div>

          {/* Quick Counter Badges in Tab Bar */}
          {hasExecuted && (
            <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono">
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="size-3" /> {successCount} Berhasil
              </span>
              {failCount > 0 && (
                <span className="text-rose-400 flex items-center gap-1">
                  <XCircle className="size-3" /> {failCount} Gagal
                </span>
              )}
            </div>
          )}
        </div>

        {/* View 1: Magic UI Animated Beam Stage */}
        {activeView === 'visual' ? (
          <div
            ref={containerRef}
            className="relative flex-1 min-h-[380px] max-h-[500px] w-full overflow-y-auto overflow-x-hidden p-6 sm:p-8 flex items-center justify-between gap-4 sm:gap-8 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900"
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
            <div className="flex flex-col gap-2.5 z-20 min-w-[220px] max-w-[300px]">
              {configs.length === 0 ? (
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 text-center text-xs text-slate-400">
                  Belum ada database Supabase yang dikonfigurasi.
                </div>
              ) : (
                configs.map((cfg, idx) => {
                  const status = statuses[cfg.id] || 'idle';
                  const latency = latencies[cfg.id];
                  const errorMsg = errorMessages[cfg.id];

                  return (
                    <div
                      key={cfg.id}
                      className={cn(
                        'flex items-center gap-2.5 p-2 rounded-2xl border transition-all duration-200',
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
                          'size-10 shrink-0 border transition-all',
                          status === 'success' && 'border-emerald-400 text-emerald-400 bg-emerald-950/60 shadow-emerald-500/30',
                          status === 'failed' && 'border-rose-400 text-rose-400 bg-rose-950/60 shadow-rose-500/30',
                          status === 'pinging' && 'border-brand-400 text-brand-400 bg-brand-950/60 animate-spin',
                          status === 'idle' && 'border-slate-700 text-slate-400 bg-slate-800/80'
                        )}
                      >
                        <Database className="size-4" />
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
                              ● Gagal ({errorMsg ? 'Lihat Detail di Laporan' : 'Error'})
                            </span>
                          )}
                          {status === 'pinging' && (
                            <span className="text-brand-400 animate-pulse">
                              ● Transmitting heartbeat...
                            </span>
                          )}
                          {status === 'idle' && (
                            <span className="text-slate-500">
                              Siap diperiksa...
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
              const total = configs.length;
              const middle = (total - 1) / 2;
              const curvature = total > 1 ? (idx - middle) * 14 : 0;

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
        ) : (
          /* View 2: Detailed Execution Summary Report */
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 min-h-[380px] max-h-[500px] space-y-5 bg-slate-900/60">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[11px] text-slate-400 block mb-1">Total Database</span>
                <span className="text-xl font-bold text-white font-mono">{totalCount}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[11px] text-emerald-400 block mb-1">✅ Berhasil</span>
                <span className="text-xl font-bold text-emerald-400 font-mono">{successCount}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                <span className="text-[11px] text-rose-400 block mb-1">❌ Gagal / Error</span>
                <span className="text-xl font-bold text-rose-400 font-mono">{failCount}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/30">
                <span className="text-[11px] text-brand-400 block mb-1">Persentase Sukses</span>
                <span className="text-xl font-bold text-brand-400 font-mono">{progressPercent}%</span>
              </div>
            </div>

            {/* Filter Pill Buttons */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReportFilter('all')}
                  className={cn(
                    'px-3 py-1 rounded-xl text-xs font-semibold transition-all',
                    reportFilter === 'all'
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  )}
                >
                  Semua ({totalCount})
                </button>
                <button
                  onClick={() => setReportFilter('failed')}
                  className={cn(
                    'px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5',
                    reportFilter === 'failed'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  )}
                >
                  <XCircle className="size-3 text-rose-400" />
                  Gagal / Error ({failCount})
                </button>
                <button
                  onClick={() => setReportFilter('success')}
                  className={cn(
                    'px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5',
                    reportFilter === 'success'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  )}
                >
                  <CheckCircle2 className="size-3 text-emerald-400" />
                  Berhasil ({successCount})
                </button>
              </div>

              {failCount > 0 && (
                <button
                  onClick={handleRetryFailedOnly}
                  disabled={isPingingAll}
                  className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
                >
                  <RefreshCw className="size-3" />
                  <span>Coba Ulang Gagal ({failCount})</span>
                </button>
              )}
            </div>

            {/* Report Cards List */}
            <div className="space-y-3">
              {filteredConfigs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-800/30 rounded-2xl border border-slate-800">
                  Tidak ada data untuk filter ini.
                </div>
              ) : (
                filteredConfigs.map((cfg) => {
                  const status = statuses[cfg.id] || 'idle';
                  const latency = latencies[cfg.id];
                  const errorMsg = errorMessages[cfg.id];
                  const isRetrying = retryingSingleId === cfg.id;
                  const isMigrating = generatingTableId === cfg.id;

                  const isTableMissing =
                    errorMsg?.toLowerCase().includes('tabel') ||
                    errorMsg?.toLowerCase().includes('table') ||
                    errorMsg?.toLowerCase().includes('does not exist');

                  const isAuthError =
                    errorMsg?.toLowerCase().includes('password') ||
                    errorMsg?.toLowerCase().includes('credential') ||
                    errorMsg?.toLowerCase().includes('enotfound');

                  return (
                    <div
                      key={cfg.id}
                      className={cn(
                        'p-4 rounded-2xl border transition-all duration-200',
                        status === 'failed' && 'bg-rose-950/20 border-rose-500/30',
                        status === 'success' && 'bg-emerald-950/20 border-emerald-500/30',
                        status === 'idle' && 'bg-slate-800/40 border-slate-800'
                      )}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'p-2.5 rounded-xl shrink-0 mt-0.5',
                              status === 'success' && 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
                              status === 'failed' && 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
                              status === 'idle' && 'bg-slate-800 text-slate-400 border border-slate-700'
                            )}
                          >
                            <Database className="size-5" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-white">
                                {cfg.databaseName}
                              </h3>
                              <span
                                className={cn(
                                  'px-2 py-0.5 rounded-full text-[10px] font-bold',
                                  status === 'success' && 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
                                  status === 'failed' && 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
                                  status === 'idle' && 'bg-slate-800 text-slate-400'
                                )}
                              >
                                {status === 'success' && 'BERHASIL'}
                                {status === 'failed' && 'GAGAL'}
                                {status === 'idle' && 'MENUNGGU'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {cfg.accountEmail || cfg.supabaseUrl}
                            </p>
                          </div>
                        </div>

                        {/* Single Item Action Buttons */}
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          {status === 'failed' && isTableMissing && (
                            <button
                              onClick={() => handleGenerateTable(cfg)}
                              disabled={isMigrating || isRetrying}
                              className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-brand-500/25 transition-all disabled:opacity-50"
                            >
                              {isMigrating ? (
                                <>
                                  <Loader2 className="size-3 animate-spin" />
                                  <span>Membuat Tabel...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="size-3" />
                                  <span>Auto-Generate Tabel</span>
                                </>
                              )}
                            </button>
                          )}

                          <button
                            onClick={() => handleSinglePing(cfg)}
                            disabled={isRetrying || isMigrating}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all disabled:opacity-50"
                          >
                            {isRetrying ? (
                              <>
                                <Loader2 className="size-3 animate-spin" />
                                <span>Menguji...</span>
                              </>
                            ) : (
                              <>
                                <RefreshCw className="size-3" />
                                <span>Uji Ping Ulang</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Success Details Box */}
                      {status === 'success' && (
                        <div className="mt-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                            <span>Keep-Alive Confirmed: Masa aktif 7 hari Supabase berhasil di-reset.</span>
                          </div>
                          <span className="font-mono font-bold text-emerald-400 shrink-0">
                            {latency ?? 24}ms
                          </span>
                        </div>
                      )}

                      {/* Error Summary Box (Lengkap, Tidak Terpotong, Ada Solusi) */}
                      {status === 'failed' && (
                        <div className="mt-3 space-y-2">
                          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="size-4 text-rose-400 shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 block mb-1 font-mono">
                                  Penyebab Error:
                                </span>
                                <p className="text-xs text-rose-200 font-mono break-words whitespace-pre-wrap leading-relaxed">
                                  {errorMsg || 'Koneksi ke Supabase gagal dieksekusi.'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Actionable Suggestions */}
                          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <HelpCircle className="size-4 text-amber-400 shrink-0" />
                              <span>
                                {isTableMissing
                                  ? 'Tabel cronjob_keepalive belum tersedia di database. Klik tombol Auto-Generate Tabel di atas.'
                                  : isAuthError
                                  ? 'Periksa Database Password atau URL Supabase pada menu Supabase Configs.'
                                  : 'Pastikan database Supabase tidak sedang dalam status pause di dashboard Supabase.'}
                              </span>
                            </div>
                            <Link
                              href="/config"
                              className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 shrink-0 underline ml-6 sm:ml-0"
                            >
                              <span>Buka Pengaturan Config</span>
                              <ArrowRight className="size-3" />
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Footer & Progress Controls */}
        <div className="p-5 sm:p-6 border-t border-slate-800 bg-slate-900/95 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 w-full sm:w-auto">
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
            {activeView === 'report' ? (
              <button
                onClick={() => setActiveView('visual')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <Zap className="size-3.5 text-brand-400" />
                <span>Lihat Animasi Sinar</span>
              </button>
            ) : hasExecuted ? (
              <button
                onClick={() => setActiveView('report')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <FileText className="size-3.5 text-brand-400" />
                <span>Buka Ringkasan Laporan</span>
              </button>
            ) : null}

            <button
              onClick={handleManualClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              Tutup
            </button>

            <button
              onClick={() => handleStartPingAll()}
              disabled={isPingingAll || configs.length === 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 via-brand-600 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-brand-500/25 transition-all hover:scale-105 disabled:opacity-50"
            >
              {isPingingAll ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Mengirim Heartbeat Serentak...</span>
                </>
              ) : hasExecuted ? (
                <>
                  <RefreshCw className="size-3.5" />
                  <span>Ulangi Semua Ping</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" />
                  <span>Mulai Ping Serentak ({configs.length} Project)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default PingAllModal;
