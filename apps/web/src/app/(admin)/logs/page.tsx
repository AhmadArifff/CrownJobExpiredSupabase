'use client';

import React, { useState, useEffect } from 'react';
import { History, Search, CheckCircle2, XCircle, Filter, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { useUIStore } from '@/stores/useUIStore';
import { ActivityLogDTO } from '@cronjob/shared';

export default function LogsPage() {
  const [logs, setLogs] = useState<ActivityLogDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const addToast = useUIStore((state) => state.addToast);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const res = await api.get<ActivityLogDTO[]>('/logs');
    setLoading(false);

    if (res.isSuccess) {
      setLogs(res.getValue());
    } else {
      setLogs([]);
      addToast({ type: 'error', message: res.error || 'Failed to fetch logs' });
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      (log.accountName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.message || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-brand-400" /> Activity Audit Logs
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete historical trail of automated and manual keep-alive operations.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Logs
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by account or message..."
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 rounded-xl glass-input text-xs w-full sm:w-auto"
          >
            <option value="all" className="bg-slate-900">All Actions</option>
            <option value="auto_ping" className="bg-slate-900">Auto Ping (Cron)</option>
            <option value="insert" className="bg-slate-900">Manual Ping</option>
            <option value="generate_table" className="bg-slate-900">Table Auto-Gen</option>
            <option value="delete" className="bg-slate-900">Delete Row</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5">Account / DB</th>
                <th className="px-6 py-3.5">Action</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No activity logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-slate-400 font-mono">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      {log.accountName || 'System'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {log.status === 'success' ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-4 h-4" /> Success
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                          <XCircle className="w-4 h-4" /> Failed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-300">{log.message || '-'}</td>
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
