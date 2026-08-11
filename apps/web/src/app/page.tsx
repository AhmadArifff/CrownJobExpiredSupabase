'use client';

import React from 'react';
import Link from 'next/link';
import { Database, ShieldCheck, Zap, RefreshCw, Github, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Database className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Supabase Keep-Alive
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/25 transition-all hover:scale-105 active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-24 pb-20 px-6 max-w-7xl mx-auto text-center overflow-hidden">
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <div className="w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-3xl" />
            <div className="w-[400px] h-[400px] bg-secondary-500/10 rounded-full blur-3xl" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-brand-400 text-xs font-semibold mb-8 animate-pulse">
            <ShieldCheck className="w-4 h-4" /> Open Source & Enterprise Ready
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
            Never lose access to your{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-brand-400 to-secondary-400 bg-clip-text text-transparent">
              Supabase Free Tier
            </span>{' '}
            databases again.
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Manage multiple Supabase accounts, auto-create keep-alive tables, and let automated Vercel Cron jobs prevent 7-day inactivity pauses.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold flex items-center justify-center gap-2 shadow-xl shadow-brand-500/30 transition-all hover:scale-105"
            >
              Start Free Today <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Github className="w-4 h-4" /> Star on GitHub
            </a>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-16">
            <div className="glass-card p-6 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-4">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Automated Vercel Cron</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Set and forget. Automated daily cron runs trigger keep-alive pings before your 7-day expiration window.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-secondary-500/10 border border-secondary-500/20 flex items-center justify-center text-secondary-400 mb-4">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Multi-Account Support</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Manage 10+ Supabase project configs safely with strict user data isolation and AES-256-GCM encryption.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Auto Table Generation</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                One-click test connection automatically checks and provisions standard keep-alive tables in your target DB.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© 2026 Supabase Keep-Alive Manager (Open Source MIT)</div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> PWA Ready
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Vercel Serverless
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
