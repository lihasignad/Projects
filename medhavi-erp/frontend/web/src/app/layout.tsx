import type { ReactNode } from 'react';
import { AppProviders } from '@/providers/app-providers';
import './globals.css';

export const metadata = {
  title: 'Medhavi Skills University ERP',
  description: 'Enterprise Resource Planning for Medhavi Skills University',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}