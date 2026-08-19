import type { Metadata } from 'next';
import './globals.css';
import { DataProvider } from '@/context/DataContext';
import { ThemeProvider } from 'next-themes';

export const metadata: Metadata = {
  title: 'DataPulse AI | AI Data Analyst & Interactive Dashboard',
  description: 'Upload heavy datasets (CSV, Excel, JSON), generate automated glassmorphic dashboards, and ask questions with AI natural language intelligence.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <DataProvider>
            {children}
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
