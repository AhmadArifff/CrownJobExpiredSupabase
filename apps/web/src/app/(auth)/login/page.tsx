'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Database, Lock, Mail, ArrowRight, AlertCircle, ShieldCheck, Zap, Activity, Globe, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUIStore } from '@/stores/useUIStore';
import { authClient } from '@/lib/auth-client';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const addToast = useUIStore((state) => state.addToast);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Interactive Left-Side Simulator State
  const [simulatedDaysLeft, setSimulatedDaysLeft] = useState(6);
  const [simulatingPing, setSimulatingPing] = useState(false);

  const handleSimulatePing = () => {
    setSimulatingPing(true);
    setTimeout(() => {
      setSimulatedDaysLeft(7);
      setSimulatingPing(false);
      addToast({ type: 'success', message: 'Simulator: Keep-Alive Ping sent! Protection reset to 7 days.' });
    }, 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await authClient.signIn.email({
      email,
      password,
    });

    setLoading(false);

    if (data) {
      setAuth(data.user as any, data.token || 'better-auth-cookie');
      addToast({ type: 'success', message: 'Logged in successfully!' });
      router.push('/dashboard');
    } else {
      setError(authError?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between relative overflow-hidden transition-colors duration-300">
      {/* Top Navbar */}
      <header className="px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-brand-500/25">
            <Database className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
            KeepAlive Admin
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Background Glow Effects */}
      <div className="absolute top-1/4 left-10 -z-10 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 -z-10 w-96 h-96 bg-secondary-500/15 rounded-full blur-3xl" />

      {/* Main Split Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Interactive Showcase */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Supabase Free Tier Protection
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Never let your Supabase projects get <span className="bg-gradient-to-r from-brand-500 to-secondary-500 bg-clip-text text-transparent">paused again.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              Automated Keep-Alive cronjobs, live website health monitoring, and real-time 7-day inactivity warnings for all your Supabase projects.
            </p>

            {/* Interactive Widget Simulator */}
            <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  <Activity className="w-4 h-4 text-brand-500" /> Interactive Keep-Alive Simulator
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  Live Preview
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Target Database:</span>
                  <span className="font-mono text-brand-600 dark:text-brand-400 font-bold">production_db</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Protection Status:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    simulatedDaysLeft >= 7
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse'
                  }`}>
                    {simulatedDaysLeft >= 7 ? '7 days left (Active)' : '1 day left (Warning!)'}
                  </span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      simulatedDaysLeft >= 7 ? 'bg-emerald-500 w-full' : 'bg-rose-500 w-[15%]'
                    }`}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSimulatePing}
                disabled={simulatingPing}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Zap className={`w-3.5 h-3.5 text-brand-400 ${simulatingPing ? 'animate-spin' : ''}`} />
                {simulatingPing ? 'Simulating Keep-Alive Ping...' : 'Test Click: Simulate Keep-Alive Reset'}
              </button>
            </div>

            {/* Value Props */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg pt-2">
              <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mb-1" />
                <div className="font-bold text-slate-900 dark:text-white">Auto Cron Ping</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Vercel automated schedules</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
                <Globe className="w-4 h-4 text-brand-500 mb-1" />
                <div className="font-bold text-slate-900 dark:text-white">Website Check</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">App URL health testing</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
                <ShieldCheck className="w-4 h-4 text-secondary-500 mb-1" />
                <div className="font-bold text-slate-900 dark:text-white">Data Isolated</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Strict multi-tenant security</div>
              </div>
            </div>
          </div>

          {/* Right Column: Form Card */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl text-left">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-brand-500/30 mb-3">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Welcome Back
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Sign in to manage your Supabase Keep-Alive configs
                </p>
              </div>

              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-3 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 font-bold text-white text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-600 dark:text-slate-400">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">
                  Register here
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs text-slate-500 dark:text-slate-500 border-t border-slate-200 dark:border-slate-900">
        KeepAlive Admin &copy; {new Date().getFullYear()} — Free Tier Protection Engine
      </footer>
    </div>
  );
}
