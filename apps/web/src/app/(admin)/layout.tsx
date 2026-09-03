'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Database,
  LayoutDashboard,
  Settings,
  Activity,
  History,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  Bell,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUIStore } from '@/stores/useUIStore';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { NotificationDialog } from '@/components/shared/NotificationDialog';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const [showNotifications, setShowNotifications] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router, mounted]);

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Supabase Configs', href: '/config', icon: Settings },
    { label: 'Keep-Alive Data', href: '/cronjob', icon: Activity },
    { label: 'Activity Logs', href: '/logs', icon: History },
  ];

  const isVisible = mounted && isAuthenticated;

  return (
    <>
      {!isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <div
        className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex ${
          !isVisible ? 'hidden' : ''
        }`}
      >
        {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-64 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Database className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold text-base bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                KeepAlive Admin
              </span>
            </Link>
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25 font-semibold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/40 mb-3">
            <div className="w-9 h-9 rounded-full bg-brand-500/10 dark:bg-brand-500/20 border border-brand-500/20 dark:border-brand-500/30 flex items-center justify-center text-brand-500 dark:text-brand-400 font-bold text-sm">
              {mounted && user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {mounted && user?.name ? user.name : 'User'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {mounted && user?.email ? user.email : ''}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-sm font-semibold transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 px-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="text-sm text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
            Status: <span className="text-emerald-500 dark:text-emerald-400 font-semibold">● Vercel Cron Active</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification Bell (Magic UI Animated Dialog) */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(true)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 relative transition-all group"
                title="Notifications & Message Dialog"
              >
                <Bell className="w-4 h-4 text-brand-500 dark:text-brand-400 group-hover:scale-110 transition-transform" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
              </button>

              <NotificationDialog
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
              />
            </div>

            <ThemeToggle />
            <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <UserIcon className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />
              <span>Isolated Environment</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full min-w-0 overflow-x-hidden">{children}</main>
      </div>
    </div>
    </>
  );
}
