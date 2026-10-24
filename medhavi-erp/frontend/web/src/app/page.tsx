'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/shared/stores/auth-store';
import { useAuthContext } from '@/providers/auth-provider';

export default function RootPage() {
  const router = useRouter();
  const { isHydrated } = useAuthContext();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const selectedInstitute = useAuthStore((state) => state.selectedInstitute);

  useEffect(() => {
    if (isHydrated) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else if (!selectedInstitute) {
        router.replace('/select-institute');
      } else {
        router.replace('/login');
      }
    }
  }, [isHydrated, isAuthenticated, selectedInstitute, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs font-mono">
      Initializing CoachUp ERP...
    </div>
  );
}
