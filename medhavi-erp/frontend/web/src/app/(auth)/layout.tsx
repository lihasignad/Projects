import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden antialiased bg-slate-900">
      {/* Scenic Sikkim Campus Backdrop */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: "url('/sikkim-campus-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-white/20 dark:bg-slate-950/40 backdrop-blur-[0.5px]" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 z-10 w-full">
        {children}
      </main>

      <footer className="z-10 py-3 text-center text-xs text-white/80 font-medium">
        <span>&copy; {new Date().getFullYear()} Medhavi Skills University, Sikkim. All rights reserved.</span>
      </footer>
    </div>
  );
}
