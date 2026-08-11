'use client';

import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, Zap, Trash2, Plus, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useConfigStore } from '@/stores/useConfigStore';
import { useUIStore } from '@/stores/useUIStore';
import { api } from '@/lib/api';
import { SupabaseConfigDTO, KeepAliveDataRow } from '@cronjob/shared';

export default function CronJobPage() {
  const { configs, setConfigs } = useConfigStore();
  const addToast = useUIStore((state) => state.addToast);

  const [selectedConfigId, setSelectedConfigId] = useState<string>('');
  const [tableData, setTableData] = useState<KeepAliveDataRow[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  useEffect(() => {
    fetchUserConfigs();
  }, []);

  const fetchUserConfigs = async () => {
    const res = await api.get<SupabaseConfigDTO[]>('/configs');
    if (res.isSuccess) {
      const data = res.getValue();
      setConfigs(data);
      if (data.length > 0 && !selectedConfigId) {
        setSelectedConfigId(data[0].id);
        loadTableData(data[0].id);
      }
    }
  };

  const loadTableData = async (configId: string) => {
    setLoadingData(true);
    const res = await api.get<KeepAliveDataRow[]>(`/cronjob/${configId}/data`);
    setLoadingData(false);

    if (res.isSuccess) {
      setTableData(res.getValue());
    } else {
      // Mock rows for initial frontend demonstration
      const mockRows: KeepAliveDataRow[] = [
        {
          id: 101,
          pingMessage: 'keepalive-auto-2026-08-10T10:00:00Z',
          createdBy: 'Vercel Cron Service',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 100,
          pingMessage: 'keepalive-manual-2026-08-08T15:30:00Z',
          createdBy: 'User Manual Trigger',
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        },
      ];
      setTableData(mockRows);
    }
  };

  const handleTestConnection = async () => {
    if (!selectedConfigId) return;
    setTestingConnection(true);
    const res = await api.post<{ isTableGenerated: boolean; message: string }>(
      `/configs/${selectedConfigId}/test-connection`
    );
    setTestingConnection(false);

    if (res.isSuccess) {
      addToast({
        type: 'success',
        message: 'Connection OK! Keep-Alive table ready on target Supabase DB.',
      });
      fetchUserConfigs();
      loadTableData(selectedConfigId);
    } else {
      addToast({
        type: 'error',
        message: res.error || 'Connection or auto table creation failed.',
        actionLabel: 'Retry',
        onAction: handleTestConnection,
      });
    }
  };

  const handleAddPing = async () => {
    if (!selectedConfigId) return;
    setPinging(true);
    const res = await api.post(`/cronjob/${selectedConfigId}/ping`, {
      pingMessage: `Manual keepalive ping ${new Date().toISOString()}`,
    });
    setPinging(false);

    if (res.isSuccess) {
      addToast({ type: 'success', message: 'Keep-alive ping inserted into database!' });
      loadTableData(selectedConfigId);
    } else {
      addToast({
        type: 'error',
        message: res.error || 'Failed to insert keep-alive ping',
        actionLabel: 'Retry',
        onAction: handleAddPing,
      });
    }
  };

  const handleDeleteRow = async (rowId: number) => {
    const res = await api.delete(`/cronjob/${selectedConfigId}/data/${rowId}`);
    if (res.isSuccess) {
      addToast({ type: 'success', message: `Row #${rowId} deleted.` });
      setTableData((prev) => prev.filter((r) => r.id !== rowId));
    } else {
      addToast({ type: 'error', message: res.error || 'Failed to delete row' });
    }
  };

  const handlePingAll = async () => {
    setPinging(true);
    const res = await api.post('/cronjob/ping-all');
    setPinging(false);

    if (res.isSuccess) {
      addToast({ type: 'success', message: 'Ping All completed for all active configs!' });
      if (selectedConfigId) loadTableData(selectedConfigId);
    } else {
      addToast({
        type: 'error',
        message: res.error || 'Failed to trigger Ping All',
        actionLabel: 'Retry',
        onAction: handlePingAll,
      });
    }
  };

  const selectedConfig = configs.find((c) => c.id === selectedConfigId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-brand-400" /> Keep-Alive Data Operations
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            View, insert, and manage rows in the identical `cronjob_keepalive` target table.
          </p>
        </div>
        <button
          onClick={handlePingAll}
          disabled={pinging}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-secondary-500 hover:from-brand-600 hover:to-secondary-600 font-semibold text-white text-sm flex items-center gap-2 shadow-lg shadow-brand-500/25 transition-all hover:scale-105 disabled:opacity-50"
        >
          <Zap className={`w-4 h-4 ${pinging ? 'animate-spin' : ''}`} />
          {pinging ? 'Pinging All...' : 'Ping All Projects'}
        </button>
      </div>

      {/* Selector & Actions Bar */}
      <div className="glass-card p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Select Supabase Config Target
          </label>
          <select
            value={selectedConfigId}
            onChange={(e) => {
              setSelectedConfigId(e.target.value);
              loadTableData(e.target.value);
            }}
            className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-medium"
          >
            {configs.map((cfg) => (
              <option key={cfg.id} value={cfg.id} className="bg-slate-900 text-white">
                {cfg.databaseName} ({cfg.accountEmail})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={handleTestConnection}
            disabled={testingConnection || !selectedConfigId}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
            {testingConnection ? 'Testing...' : 'Test & Auto-Gen Table'}
          </button>
          <button
            onClick={handleAddPing}
            disabled={pinging || !selectedConfigId}
            className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-xs font-semibold text-white flex items-center gap-2 shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" /> Add Keep-Alive Ping
          </button>
        </div>
      </div>

      {/* Target Status Banner */}
      {selectedConfig && (
        <div className="glass-card p-4 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">Target Table: <code className="font-mono text-brand-300">cronjob_keepalive</code></span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Status: {selectedConfig.status}</span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-bold uppercase ${
                selectedConfig.isTableGenerated
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              {selectedConfig.isTableGenerated ? 'Table Ready' : 'Table Missing'}
            </span>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm">Remote Table Rows</h3>
          <button
            onClick={() => selectedConfigId && loadTableData(selectedConfigId)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3 h-3 ${loadingData ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Row ID</th>
                <th className="px-6 py-3.5">Ping Message</th>
                <th className="px-6 py-3.5">Triggered By</th>
                <th className="px-6 py-3.5">Created At</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tableData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No keep-alive ping data rows found in this table.
                  </td>
                </tr>
              ) : (
                tableData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-brand-400">#{row.id}</td>
                    <td className="px-6 py-4 text-slate-200 font-mono">{row.pingMessage}</td>
                    <td className="px-6 py-4 text-slate-300">{row.createdBy}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteRow(row.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
