'use client';

import Link from 'next/link';
import { MOCK_DEAN_APPROVALS } from '@/features/portals/portals-mock-data';

/**
 * DESIGN BRIEF: Dean's Executive School Overview
 * - Who uses: Dean of Faculty presiding over multiple academic departments and statutory approvals.
 * - Single most important thing: Unblock critical approvals (attendance condonation, grade moderation, faculty leave) and oversee cross-department metrics.
 * - Visual direction: Executive academic overview with prominent approval badge counters and high-level departmental KPIs.
 * - Palette: Slate (`#0F172A`, `#334155`, `#F8FAFC`), Deep Brand Navy (`#1E3A8A`), Emerald (`#059669`), Rose (`#E11D48`).
 * - Spacing & radius: 4px/8px rhythm, rounded-xl containers with subtle 1px border.
 */

export default function DeanDashboardPage() {
  const pendingCount = MOCK_DEAN_APPROVALS.filter((a) => a.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]">
                School Leadership
              </span>
              <span className="text-xs text-slate-500">
                Office of the Dean
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Prof. Rajeshwar Kulkarni, Dean
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              School of Engineering &amp; Technology, 4 Departments (CSE, ECE, MECH, CIVIL), 1,420 Enrolled Students
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/portal/dean/approvals"
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
            >
              <span>Approvals Queue</span>
              <span className="h-5 w-5 rounded-full bg-white text-rose-700 flex items-center justify-center font-bold text-[10px]">
                {pendingCount}
              </span>
            </Link>
            <Link
              href="/portal/dean/departments"
              className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
            >
              Departments Matrix
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Core School Governance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400">
            Total Student Body
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            1,420 <span className="text-xs text-slate-400 font-normal">Undergrads</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across 4 Engineering disciplines
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400">
            Faculty Strength
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            78 <span className="text-xs text-slate-400 font-normal">Professors</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            Student-to-Faculty: 18.2 (Compliant)
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400">
            School Exam Pass Rate
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            94.2%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Spring 2025 Board Results
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400">
            Pending Dean Approvals
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            3 Requests
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            2 High Urgency (Board deadline)
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Approvals & Departments Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Immediate Executive Approvals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Dean&apos;s Statutory Approval Queue
                </h2>
                <p className="text-xs text-slate-500">
                  Requests submitted by Heads of Department and Controller of Examinations
                </p>
              </div>
              <Link
                href="/portal/dean/approvals"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Open Approval Center
              </Link>
            </div>

            <div className="space-y-3">
              {MOCK_DEAN_APPROVALS.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-[10px] px-2 py-0.5 rounded bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200 font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]">
                          {item.category}
                        </span>
                        {item.urgency === 'HIGH' && (
                          <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]">
                            HIGH PRIORITY
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                        {item.title}
                      </h3>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Submitted by: {item.submittedBy}, {item.department}
                      </div>
                    </div>

                    <Link
                      href="/portal/dean/approvals"
                      className="px-3 py-1.5 rounded bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
                    >
                      Review &amp; Sign Off
                    </Link>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs pt-1">
                    {item.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Departments Quick Glance */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 font-medium">
              Departments in School
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100">
                  <span>Computer Science &amp; Engg</span>
                  <span className="font-mono text-emerald-600">86.4% Attd</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  HOD: Dr. Meenakshi Sundaram, 480 Students, 24 Faculty
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100">
                  <span>Electronics &amp; Communication</span>
                  <span className="font-mono text-emerald-600">84.1% Attd</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  HOD: Dr. Suresh Varma, 360 Students, 20 Faculty
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100">
                  <span>Mechanical Engineering</span>
                  <span className="font-mono text-emerald-600">82.9% Attd</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  HOD: Dr. P.K. Roy, 320 Students, 18 Faculty
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100">
                  <span>Civil Engineering</span>
                  <span className="font-mono text-emerald-600">81.5% Attd</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  HOD: Dr. Sunita Bhattacharya, 260 Students, 16 Faculty
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
