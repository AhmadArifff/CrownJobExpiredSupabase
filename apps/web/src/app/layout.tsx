import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ToastContainer } from '@/components/shared/ToastContainer';

export const metadata: Metadata = {
  title: 'CronJob Supabase Keep-Alive Manager',
  description: 'Prevent your Supabase free tier databases from auto-pausing after 7 days of inactivity',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#6366f1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-950 text-slate-100 min-h-screen font-sans antialiased">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
