import type { ReactNode } from 'react';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden antialiased bg-sky-50">
      {/* Scenic Sikkim Campus Backdrop */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/sikkim-campus-bg.jpg"
          alt="Medhavi Skills University Sikkim Campus"
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

      <footer className="relative z-10 py-3 text-center text-xs text-slate-800 dark:text-white font-semibold drop-shadow-md">
        <span>&copy; {new Date().getFullYear()} Medhavi Skills University, Sikkim. All rights reserved.</span>
      </footer>
    </div>
  );
}
