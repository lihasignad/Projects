'use client';
import type { ReactNode } from 'react';
import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';
import { I18nProvider } from './i18n-provider';
import { TenantProvider } from './tenant-provider';
import { AuthProvider } from './auth-provider';
import { ToastProvider } from './toast-provider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <QueryProvider>
          <TenantProvider>
            <AuthProvider>
              <ToastProvider>{children}</ToastProvider>
            </AuthProvider>
          </TenantProvider>
        </QueryProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}