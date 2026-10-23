'use client';

import Link from 'next/link';
import { useAuthStore } from '@/shared/stores/auth-store';
import { Can } from '@/shared/ui/rbac-guard';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const roles = useAuthStore((state) => state.roles);

  const roleTitle = roles.map((r) => r.name).join(', ') || 'Administrator';

  return (
    <div className="space-y-6">
      {/* Page Title & Operational Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Operational Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Signed in as <span className="font-medium text-slate-700 dark:text-slate-300">{user?.displayName || user?.email}</span> ({roleTitle})
          </p>
        </div>

        {/* Primary Operational Action Shortcuts */}
        <div className="flex items-center space-x-2">
          <Can permission="attendance:write">
            <Link
              href="/attendance"
              className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Mark Attendance
            </Link>
          </Can>

          <Can permission="students:create">
            <Link
              href="/students/admissions"
              className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              New Admission
            </Link>
          </Can>
        </div>
      </div>

      {/* Operational Information Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Academic Session Card */}
        <div className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Academic Status
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
            2025-2026 Regular Term
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Current teaching cycle active. Timetable schedules are in regular operational rotation.
          </p>
        </div>

        {/* Institute Context Card */}
        <div className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Registered Campus
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Main Campus (Headquarters)
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Institute ID: <span className="font-mono text-slate-700 dark:text-slate-300">{user?.instituteId || 'TENANT_ROOT'}</span>
          </p>
        </div>

        {/* Security / Session Card */}
        <div className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Security & Compliance
          </div>
          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Session Secured</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Authenticated via JWT token pair with automated rotation.
          </p>
        </div>
      </div>

      {/* Domain Quick Launch Table */}
      <div className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Direct Operational Modules
          </h2>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Permission-scoped access
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          <div className="p-3 sm:px-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Student Directory & Roster
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Search, inspect profiles, manage enrollments, batches and parent contact details.
              </div>
            </div>
            <Link
              href="/students"
              className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 flex items-center"
            >
              Open <span className="ml-1" aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          <div className="p-3 sm:px-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Daily Attendance Register
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Classroom session attendance marking, defaulter alerts and monthly percentage sheets.
              </div>
            </div>
            <Link
              href="/attendance"
              className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 flex items-center"
            >
              Open <span className="ml-1" aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          <div className="p-3 sm:px-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Academic Programs & Timetables
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Degree curricula, subject offerings, batch divisions and weekly classroom schedules.
              </div>
            </div>
            <Link
              href="/academics"
              className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 flex items-center"
            >
              Open <span className="ml-1" aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          <div className="p-3 sm:px-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Fee Collection & Invoicing
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Installment schedules, offline fee collection counter, receipts and outstanding dues.
              </div>
            </div>
            <Link
              href="/finance/invoices"
              className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 flex items-center"
            >
              Open <span className="ml-1" aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
