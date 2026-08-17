'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Edit3, Key, Mail, Database, AlertCircle, X, ShieldAlert, Globe, Eye, EyeOff, ExternalLink, RefreshCw } from 'lucide-react';
import { useConfigStore } from '@/stores/useConfigStore';
import { useUIStore } from '@/stores/useUIStore';
import { api } from '@/lib/api';
import { EnvEditor } from '@/components/config/EnvEditor';
import { GithubRepoLinks } from '@/components/config/GithubRepoLinks';
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
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [supabaseServiceRoleKey, setSupabaseServiceRoleKey] = useState('');
  const [databasePassword, setDatabasePassword] = useState('');
  const [poolerUrl, setPoolerUrl] = useState('');
  const [envDataFrontend, setEnvDataFrontend] = useState<Record<string, string>>({});
  const [envDataBackend, setEnvDataBackend] = useState<Record<string, string>>({});
  const [githubRepoLinks, setGithubRepoLinks] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [testingWebsiteId, setTestingWebsiteId] = useState<string | null>(null);

  // Toggle visibility states
  const [showAnonKey, setShowAnonKey] = useState(false);
  const [showServiceRoleKey, setShowServiceRoleKey] = useState(false);
  const [showDatabasePassword, setShowDatabasePassword] = useState(false);

  const maskKey = (key: string | undefined | null) => key ? key.substring(0, 8) + '...******' : 'Not set';

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
    setWebsiteUrl('');
    setSupabaseAnonKey('');
    setSupabaseServiceRoleKey('');
    setDatabasePassword('');
    setPoolerUrl('');
    setEnvDataFrontend({});
    setEnvDataBackend({});
    setGithubRepoLinks([]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cfg: SupabaseConfigDTO) => {
    setEditingConfig(cfg);
    setAccountEmail(cfg.accountEmail);
    setDatabaseName(cfg.databaseName);
    setSupabaseUrl(cfg.supabaseUrl);
    setWebsiteUrl(cfg.websiteUrl || '');
    setSupabaseAnonKey(cfg.supabaseAnonKey);
    setSupabaseServiceRoleKey(cfg.supabaseServiceRoleKey);
    setDatabasePassword(cfg.databasePassword || '');
    setPoolerUrl(cfg.poolerUrl || '');
    setEnvDataFrontend(cfg.envDataFrontend || {});
    setEnvDataBackend(cfg.envDataBackend || {});
    setGithubRepoLinks(cfg.githubRepoLinks || []);
    setFormError(null);
    setShowAnonKey(false);
    setShowServiceRoleKey(false);
    setShowDatabasePassword(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const inputData: CreateConfigInput = {
      accountEmail,
      databaseName,
      supabaseUrl,
      websiteUrl: websiteUrl ? websiteUrl : undefined,
      supabaseAnonKey,
      supabaseServiceRoleKey,
      envDataFrontend: Object.keys(envDataFrontend).length > 0 ? envDataFrontend : undefined,
      envDataBackend: Object.keys(envDataBackend).length > 0 ? envDataBackend : undefined,
      githubRepoLinks: githubRepoLinks.length > 0 ? githubRepoLinks : undefined,
    };

    // Build the data to send, optionally including databasePassword and poolerUrl
    const submitData = {
      ...inputData,
      ...(databasePassword && { databasePassword }),
      ...(poolerUrl && { poolerUrl }),
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
      const res = await api.put<SupabaseConfigDTO>(`/configs/${editingConfig.id}`, submitData);
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

      const res = await api.post<SupabaseConfigDTO>('/configs', submitData);
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

  const handleTestWebsite = async (cfg: SupabaseConfigDTO) => {
    if (!cfg.websiteUrl) return;
    setTestingWebsiteId(cfg.id);
    try {
      await fetch(cfg.websiteUrl, { mode: 'no-cors' });
      addToast({ type: 'success', message: 'Website is accessible!' });
    } catch (error) {
      addToast({ type: 'error', message: 'Cannot reach the website. Please check the URL.' });
    } finally {
      setTestingWebsiteId(null);
    }
  };

  return (
    <>
      <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Settings className="w-6 h-6 text-brand-400" /> Supabase Configurations
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
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
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">{cfg.databaseName}</h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{cfg.supabaseUrl}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(cfg)}
                      className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cfg)}
                      className="p-2 text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs py-3 my-3 border-y border-slate-200 dark:border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Account Email:</span>
                    <span className="text-slate-900 dark:text-slate-200 font-semibold">{cfg.accountEmail}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Associated Website:</span>
                    {cfg.websiteUrl ? (
                      <a
                        href={cfg.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-1 truncate max-w-[200px]"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span className="truncate">{cfg.websiteUrl}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 italic">Not set</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Anon Key:</span>
                    <span className="text-slate-600 dark:text-slate-400 font-mono">{maskKey(cfg.supabaseAnonKey)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Service Role Key:</span>
                    <span className="text-slate-600 dark:text-slate-400 font-mono">{maskKey(cfg.supabaseServiceRoleKey)}</span>
                  </div>

                  {cfg.githubRepoLinks && cfg.githubRepoLinks.length > 0 && (
                    <div className="flex items-start justify-between border-t border-slate-200 dark:border-slate-800/80 pt-2 mt-2">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Repositories:</span>
                      <div className="flex flex-col gap-1 items-end">
                        {cfg.githubRepoLinks.map((link, idx) => (
                          <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-400 font-medium hover:underline flex items-center gap-1">
                            <span className="truncate max-w-[150px]">Repo {idx + 1}</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {((cfg.envDataFrontend && Object.keys(cfg.envDataFrontend).length > 0) || (cfg.envDataBackend && Object.keys(cfg.envDataBackend).length > 0)) && (
                     <div className="flex flex-col gap-1 border-t border-slate-200 dark:border-slate-800/80 pt-2 mt-2">
                      <span className="text-slate-600 dark:text-slate-400 font-medium mb-1">Environment Vars:</span>
                      {cfg.envDataFrontend && Object.keys(cfg.envDataFrontend).length > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400 text-[11px]">Frontend:</span>
                          <span className="text-slate-900 dark:text-slate-200 font-semibold text-[11px]">{Object.keys(cfg.envDataFrontend).length} vars loaded</span>
                        </div>
                      )}
                      {cfg.envDataBackend && Object.keys(cfg.envDataBackend).length > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400 text-[11px]">Backend:</span>
                          <span className="text-slate-900 dark:text-slate-200 font-semibold text-[11px]">{Object.keys(cfg.envDataBackend).length} vars loaded</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {cfg.websiteUrl && (
                  <div className="mb-2">
                    <button
                      type="button"
                      onClick={() => handleTestWebsite(cfg)}
                      disabled={testingWebsiteId === cfg.id}
                      className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-brand-500 ${testingWebsiteId === cfg.id ? 'animate-spin' : ''}`} />
                      {testingWebsiteId === cfg.id ? 'Testing Website...' : 'Test Website Access'}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500 dark:text-slate-400" suppressHydrationWarning>
                  Created: {new Date(cfg.createdAt).toLocaleDateString()}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {cfg.isTableGenerated ? 'Table Ready' : 'Needs Test'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Modal placed OUTSIDE the animated container so fixed positioning bounds to viewport */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 -mt-2 pt-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingConfig ? 'Edit Supabase Config' : 'Add Supabase Config'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg bg-slate-100 dark:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Supabase Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={accountEmail}
                    onChange={(e) => setAccountEmail(e.target.value)}
                    placeholder="user@supabase-account.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs"
                  />
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium">
                  Max 2 DB configs permitted per email address.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Database / Project Name
                </label>
                <div className="relative">
                  <Database className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
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
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
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
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  App Website URL <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-brand-500 absolute left-3 top-3" />
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://my-app.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  The website application connected to this Supabase database.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Anon Key
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <textarea
                    required
                    rows={2}
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    className={`w-full pl-9 pr-10 py-2 rounded-xl glass-input text-xs font-mono ${!showAnonKey ? 'text-security-disc' : ''}`}
                    style={!showAnonKey && supabaseAnonKey ? { WebkitTextSecurity: 'disc' } as any : {}}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAnonKey(!showAnonKey)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showAnonKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Service Role Key <span className="text-brand-500 font-normal">(Encrypted AES-256)</span>
                </label>
                <div className="relative">
                  <ShieldAlert className="w-4 h-4 text-brand-500 absolute left-3 top-3" />
                  <textarea
                    required
                    rows={2}
                    value={supabaseServiceRoleKey}
                    onChange={(e) => setSupabaseServiceRoleKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    className={`w-full pl-9 pr-10 py-2 rounded-xl glass-input text-xs font-mono ${!showServiceRoleKey ? 'text-security-disc' : ''}`}
                    style={!showServiceRoleKey && supabaseServiceRoleKey ? { WebkitTextSecurity: 'disc' } as any : {}}
                  />
                  <button
                    type="button"
                    onClick={() => setShowServiceRoleKey(!showServiceRoleKey)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showServiceRoleKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Database Password <span className="text-slate-400 dark:text-slate-500 font-normal">(for auto-migration)</span>
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-amber-500 absolute left-3 top-3" />
                  <input
                    type={showDatabasePassword ? "text" : "password"}
                    value={databasePassword}
                    onChange={(e) => setDatabasePassword(e.target.value)}
                    placeholder="Your Supabase database password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl glass-input text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDatabasePassword(!showDatabasePassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showDatabasePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Found in Supabase Dashboard → Settings → Database → Connection info. Required for auto table creation.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Connection Pooler URL <span className="text-slate-400 dark:text-slate-500 font-normal">(IPv4 Support - Optional)</span>
                </label>
                <div className="relative">
                  <Database className="w-4 h-4 text-emerald-500 absolute left-3 top-3" />
                  <input
                    type="url"
                    value={poolerUrl}
                    onChange={(e) => setPoolerUrl(e.target.value)}
                    placeholder="e.g. aws-0-ap-southeast-1.pooler.supabase.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  If Auto-Gen fails with ENOTFOUND (IPv6 issue), enter your Supabase Connection Pooler host here.
                </p>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                <GithubRepoLinks links={githubRepoLinks} onChange={setGithubRepoLinks} />
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-6">
                <EnvEditor label="Frontend Environment Variables" envData={envDataFrontend} onChange={setEnvDataFrontend} />
                <EnvEditor label="Backend Environment Variables" envData={envDataBackend} onChange={setEnvDataBackend} />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 sticky bottom-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md -mx-6 -mb-6 p-4 rounded-b-3xl border-t border-slate-200 dark:border-slate-800 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-xs font-semibold text-white shadow-lg shadow-brand-500/25 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
