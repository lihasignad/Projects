'use client';

import Link from 'next/link';
import { usePortalStore } from '@/features/portals/portal-store';
import { useAuthStore } from '@/shared/stores/auth-store';

/**
 * DESIGN BRIEF: Dean's Executive School Overview
 * - Who uses: Dean of Faculty presiding over multiple academic departments and statutory approvals.
 * - Single most important thing: Unblock critical approvals (attendance condonation, grade moderation, faculty leave) and oversee cross-department metrics synchronized with live portal activity.
 * - Visual direction: Executive academic overview with prominent approval badge counters and high-level departmental KPIs.
 * - Palette: Slate (`#0F172A`, `#334155`, `#F8FAFC`), Deep Brand Navy (`#1E3A8A`), Emerald (`#059669`), Rose (`#E11D48`).
 * - Spacing & radius: 4px/8px rhythm, rounded-xl containers with subtle 1px border.
 */

export default function DeanDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const deanApprovals = usePortalStore((state) => state.deanApprovals);
  const classes = usePortalStore((state) => state.classes);
  const studentProfile = usePortalStore((state) => state.studentProfile);
  const quizzes = usePortalStore((state) => state.quizzes);

  const pendingCount = deanApprovals.filter((a) => a.status === 'PENDING').length;
  const conductedToday = classes.filter((c) => c.attendanceMarked).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                School Leadership
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Office of the Dean · School of Engineering &amp; Technology
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {user?.displayName || 'Dr. K. Menon'}, Dean
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              School of Engineering &amp; Technology · 4 Departments (CSE, ECE, MECH, CIVIL) · 1,420 Enrolled Students
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/portal/dean/approvals"
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 active:scale-[0.99]"
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
            Pending Dean Approvals
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            {pendingCount} Requests
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Requires statutory sign-off
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400">
            Average Attendance (SoE)
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {studentProfile.attendancePercentage}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across 1,420 undergraduates
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400">
            Lectures Conducted Today
          </div>
          <div className="text-2xl font-bold font-mono text-brand-600 dark:text-brand-400 mt-1">
            {conductedToday} / {classes.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Synchronized from department podiums
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400">
            Department Assessments Active
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {quizzes.length} Quizzes
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
            Continuous Quality Improvement (CQI)
          </div>
        </div>
      </div>

      {/* Main Grid: Approvals Queue Highlights & Departments Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Priority Approvals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Priority Approvals Requiring Dean&apos;s Seal ({pendingCount})
                </h2>
                <p className="text-xs text-slate-500">
                  Statutory attendance condonation, grade moderation, and conference duty leaves
                </p>
              </div>
              <Link
                href="/portal/dean/approvals"
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
              >
                Inspect Queue &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {deanApprovals
                .filter((a) => a.status === 'PENDING')
                .slice(0, 3)
                .map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-mono uppercase">
                        {req.urgency} PRIORITY · {req.category}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{req.submittedDate}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {req.title}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      {req.details}
                    </p>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Submitted by: <strong className="text-slate-700 dark:text-slate-300">{req.submittedBy}</strong></span>
                      <Link
                        href="/portal/dean/approvals"
                        className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                      >
                        Review Sign-off &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Department Accreditation Health */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 font-medium">
              Departments Academic Health
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <div className="flex justify-between items-center font-bold text-slate-900 dark:text-slate-100">
                  <span>Computer Science &amp; Engg</span>
                  <span className="text-emerald-600 font-mono">NBA Tier-1</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Faculty: 24 · Students: 480 · Attendance: {studentProfile.attendancePercentage}%
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <div className="flex justify-between items-center font-bold text-slate-900 dark:text-slate-100">
                  <span>Electronics &amp; Comm Engg</span>
                  <span className="text-emerald-600 font-mono">NBA Tier-1</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Faculty: 18 · Students: 360 · Attendance: 84.1%
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <div className="flex justify-between items-center font-bold text-slate-900 dark:text-slate-100">
                  <span>Mechanical &amp; Robotics Engg</span>
                  <span className="text-amber-600 font-mono">NBA Renewal</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Faculty: 16 · Students: 310 · Attendance: 80.4%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
