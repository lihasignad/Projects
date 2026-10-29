'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/shared/stores/auth-store';
import { useAuthContext } from '@/providers/auth-provider';
import { Sidebar } from '@/widgets/sidebar/sidebar';
import { Header } from '@/widgets/header/header';
import { getActiveRole, isRouteAllowedForRole, getDefaultRedirectForRole } from '@/shared/rbac/portal-rbac';

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isHydrated } = useAuthContext();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const roles = useAuthStore((state) => state.roles);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authErrorNotice, setAuthErrorNotice] = useState<string | null>(null);

  const activeRole = getActiveRole(roles);

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Role-based route authorization guard
    if (pathname && !isRouteAllowedForRole(pathname, activeRole)) {
      const target = getDefaultRedirectForRole(activeRole);
      setAuthErrorNotice(
        `Access Restricted: Your current account (${activeRole.toUpperCase()}) is not authorized for "${pathname}". Redirecting to your assigned workspace...`
      );
      const timer = setTimeout(() => {
        router.replace(target);
        setAuthErrorNotice(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isHydrated, isAuthenticated, pathname, activeRole, router]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="flex items-center space-x-2 text-xs text-ink-muted font-medium">
          <svg className="motion-safe:animate-spin h-4 w-4 text-brand-600" aria-hidden="true" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Verifying session credentials...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-paper text-ink">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />

        {authErrorNotice && (
          <div className="bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs px-4 py-2.5 font-medium flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-amber-700 dark:text-amber-400 flex-shrink-0" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{authErrorNotice}</span>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
