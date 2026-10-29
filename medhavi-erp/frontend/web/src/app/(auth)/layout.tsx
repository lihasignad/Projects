import type { ReactNode } from 'react';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden antialiased bg-sky-50">
      {/* Scenic Sikkim Campus Backdrop */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/sikkim-campus-bg.jpg"
          alt="Campus Backdrop"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center pointer-events-none"
        />
        {/* Soft top gradient to ensure crystal clear readability of sky and text */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/20 to-black/30 pointer-events-none" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 w-full">
        {children}
      </main>

      <footer className="relative z-10 py-3 px-4 text-center text-xs text-slate-800 dark:text-white font-semibold drop-shadow-md">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px]">
          <span>&copy; {new Date().getFullYear()} Demo University ERP Portal. All rights reserved.</span>
          <span className="flex items-center space-x-2">
            <span>Helpdesk:</span>
            <a
              href="mailto:support@demouniversity.in"
              className="text-sky-700 dark:text-sky-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded px-1"
            >
              support@demouniversity.in
            </a>
            <span aria-hidden="true">/</span>
            <span className="text-ink-muted">Toll-free 1800 200 8899</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
