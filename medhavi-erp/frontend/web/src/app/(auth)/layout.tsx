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
          <span>&copy; {new Date().getFullYear()} Higher Education & Skills ERP Portal. All rights reserved.</span>
          <span className="flex items-center space-x-2">
            <span>Helpdesk:</span>
            <a
              href="https://wa.me/917763030866"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-700 dark:text-emerald-300 hover:underline"
            >
              WhatsApp +91 77630 30866
            </a>
            <span>•</span>
            <a
              href="mailto:sahilsaurav99@gmail.com"
              className="text-sky-700 dark:text-sky-300 hover:underline"
            >
              sahilsaurav99@gmail.com
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
