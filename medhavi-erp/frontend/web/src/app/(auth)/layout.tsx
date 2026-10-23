import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded bg-brand-600 text-white flex items-center justify-center font-bold text-sm tracking-wider">
              C
            </div>
            <div>
              <span className="font-semibold text-base tracking-tight text-slate-900 dark:text-slate-100">CoachUp ERP</span>
              <span className="hidden sm:inline-block ml-2 text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                Production Portal
              </span>
            </div>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Support: <a href="mailto:support@coachup.in" className="hover:text-slate-900 dark:hover:text-slate-200 underline">support@coachup.in</a>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} CoachUp ERP. All rights reserved.</span>
          <span>Authorized institute personnel & student access only.</span>
        </div>
      </footer>
    </div>
  );
}
