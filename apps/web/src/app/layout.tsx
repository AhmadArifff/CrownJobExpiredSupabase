import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ToastContainer } from '@/components/shared/ToastContainer';
import { ThemeProvider } from '@/components/shared/ThemeProvider';

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
