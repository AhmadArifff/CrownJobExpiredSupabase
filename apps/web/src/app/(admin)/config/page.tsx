'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Edit3, Key, Mail, Database, AlertCircle, X, ShieldAlert } from 'lucide-react';
import { useConfigStore } from '@/stores/useConfigStore';
import { useUIStore } from '@/stores/useUIStore';
import { api } from '@/lib/api';
import { SupabaseConfigDTO, CreateConfigInput, createConfigSchema } from '@cronjob/shared';

export default function ConfigPage() {
  const { configs, setConfigs, addConfig, removeConfig, updateConfig } = useConfigStore();
  const addToast = useUIStore((state) => state.addToast);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SupabaseConfigDTO | null>(null);

  // Form State
  const [accountEmail, setAccountEmail] = useState('');
  const [databaseName, setDatabaseName] = useState('');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [supabaseServiceRoleKey, setSupabaseServiceRoleKey] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    const res = await api.get<SupabaseConfigDTO[]>('/configs');
    if (res.isSuccess) {
      setConfigs(res.getValue());
    }
  };

  const openAddModal = () => {
    setEditingConfig(null);
    setAccountEmail('');
    setDatabaseName('');
    setSupabaseUrl('');
    setSupabaseAnonKey('');
    setSupabaseServiceRoleKey('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cfg: SupabaseConfigDTO) => {
    setEditingConfig(cfg);
    setAccountEmail(cfg.accountEmail);
    setDatabaseName(cfg.databaseName);
    setSupabaseUrl(cfg.supabaseUrl);
    setSupabaseAnonKey(cfg.supabaseAnonKeyMasked);
    setSupabaseServiceRoleKey(cfg.supabaseServiceRoleKeyMasked);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const inputData: CreateConfigInput = {
      accountEmail,
      databaseName,
      supabaseUrl,
      supabaseAnonKey,
      supabaseServiceRoleKey,
    };

    // Client validation
    const validation = createConfigSchema.safeParse(inputData);
    if (!validation.success) {
      setFormError(validation.error.errors[0].message);
      return;
    }

    setSubmitting(true);

    if (editingConfig) {
      // Update
      const res = await api.put<SupabaseConfigDTO>(`/configs/${editingConfig.id}`, inputData);
      setSubmitting(false);
      if (res.isSuccess) {
        updateConfig(editingConfig.id, res.getValue());
        addToast({ type: 'success', message: 'Config updated successfully!' });
        setIsModalOpen(false);
      } else {
        setFormError(res.error || 'Failed to update config');
      }
    } else {
      // Create with Max 2 DB per email validation
      const existingCountForEmail = configs.filter(
        (c) => c.accountEmail.toLowerCase() === accountEmail.toLowerCase()
      ).length;

      if (existingCountForEmail >= 2) {
        setFormError(
          'Maximum 2 databases per Supabase email account allowed under Supabase Free Tier policy.'
        );
        setSubmitting(false);
        return;
      }

      const res = await api.post<SupabaseConfigDTO>('/configs', inputData);
      setSubmitting(false);

      if (res.isSuccess) {
        addConfig(res.getValue());
        addToast({ type: 'success', message: 'New config saved successfully!' });
        setIsModalOpen(false);
      } else {
        setFormError(res.error || 'Failed to save config');
      }
    }
  };

  const handleDelete = (cfg: SupabaseConfigDTO) => {
    removeConfig(cfg.id);
    addToast({
      type: 'warning',
      message: `Config "${cfg.databaseName}" deleted.`,
      actionLabel: 'Undo',
      onAction: () => {
        addConfig(cfg);
        addToast({ type: 'info', message: 'Deletion undone.' });
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-brand-400" /> Supabase Configurations
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Save and manage your Supabase target credentials (Max 2 DBs per email account).
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 font-semibold text-white text-sm flex items-center gap-2 shadow-lg shadow-brand-500/25 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" /> Add New Config
        </button>
      </div>

      {/* Config Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {configs.map((cfg) => (
          <div key={cfg.id} className="glass-card p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-bold text-white text-lg">{cfg.databaseName}</h3>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{cfg.supabaseUrl}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(cfg)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cfg)}
                    className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-xs py-3 my-3 border-y border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Account Email:</span>
                  <span className="text-slate-200 font-semibold">{cfg.accountEmail}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Anon Key:</span>
                  <span className="text-slate-400 font-mono">{cfg.supabaseAnonKeyMasked}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Service Role Key:</span>
                  <span className="text-slate-400 font-mono">{cfg.supabaseServiceRoleKeyMasked}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Created: {new Date(cfg.createdAt).toLocaleDateString()}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">
                {cfg.isTableGenerated ? 'Table Ready' : 'Needs Test'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">
                {editingConfig ? 'Edit Supabase Config' : 'Add Supabase Config'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Supabase Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={accountEmail}
                    onChange={(e) => setAccountEmail(e.target.value)}
                    placeholder="user@supabase-account.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Max 2 DB configs permitted per email address.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Database / Project Name
                </label>
                <div className="relative">
                  <Database className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={databaseName}
                    onChange={(e) => setDatabaseName(e.target.value)}
                    placeholder="My Production App DB"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Supabase URL
                </label>
                <input
                  type="url"
                  required
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyzproject.supabase.co"
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Anon Key
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <textarea
                    required
                    rows={2}
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Service Role Key (Encrypted AES-256)
                </label>
                <div className="relative">
                  <ShieldAlert className="w-4 h-4 text-brand-400 absolute left-3 top-3" />
                  <textarea
                    required
                    rows={2}
                    value={supabaseServiceRoleKey}
                    onChange={(e) => setSupabaseServiceRoleKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-xs font-semibold text-white shadow-lg shadow-brand-500/25 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
