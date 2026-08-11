'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Database, Lock, Mail, User, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUIStore } from '@/stores/useUIStore';
import { authClient } from '@/lib/auth-client';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const addToast = useUIStore((state) => state.addToast);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await authClient.signUp.email({
      email,
      password,
      name,
    });

    setLoading(false);

    if (data) {
      setAuth(data.user as any, data.token || 'better-auth-cookie');
      addToast({ type: 'success', message: 'Account created successfully!' });
      router.push('/dashboard');
    } else {
      setError(authError?.message || 'Failed to create account');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-secondary-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-2xl border border-slate-800">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-brand-500/30 mb-4">
            <Database className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-sm text-slate-400 mt-1">Start keeping your Supabase projects active</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (Min 8 characters)"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 font-semibold text-white flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-400 font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
