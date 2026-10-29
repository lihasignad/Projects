'use client';

import Link from 'next/link';
import { usePortalStore } from '@/features/portals/portal-store';
import { useAuthStore } from '@/shared/stores/auth-store';

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
      <div className="bg-paper border border-rule rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                School Leadership
              </span>
              <span className="text-xs text-ink-muted">
                Office of the Dean, School of Engineering &amp; Technology
              </span>
            </div>
            <h1 className="text-xl font-bold text-ink mt-1.5">
              {user?.displayName || 'Dr. K. Menon'}, Dean
            </h1>
            <p className="text-xs text-ink-muted mt-0.5">
              School of Engineering &amp; Technology, 4 Departments (CSE, ECE, MECH, CIVIL), 1,420 Enrolled Students
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/portal/dean/approvals"
              className="px-4 py-2 rounded-md bg-red-700 hover:bg-red-800 text-white text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 whitespace-nowrap"
            >
              <span>Approvals Queue</span>
              <span className="h-5 w-5 rounded-full bg-white text-danger flex items-center justify-center font-bold text-xs">
                {pendingCount}
              </span>
            </Link>
            <Link
              href="/portal/dean/departments"
              className="px-3.5 py-2 rounded-md border border-rule bg-paper hover:bg-paper-2 dark:bg-paper-2 text-ink text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 whitespace-nowrap"
            >
              Departments Matrix
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Core School Governance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-paper border border-rule rounded-lg p-4">
          <div className="text-xs font-medium text-ink-muted">
            Pending Dean Approvals
          </div>
          <div className="text-2xl font-bold font-mono text-danger mt-1">
            {pendingCount} Requests
          </div>
          <div className="text-xs text-ink-muted mt-1">
            Requires statutory sign-off
          </div>
        </div>

        <div className="bg-paper border border-rule rounded-lg p-4">
          <div className="text-xs font-medium text-ink-muted">
            Average Attendance (SoE)
          </div>
          <div className="text-2xl font-bold font-mono text-success mt-1">
            {studentProfile.attendancePercentage}%
          </div>
          <div className="text-xs text-ink-muted mt-1">
            Across 1,420 undergraduates
          </div>
        </div>

        <div className="bg-paper border border-rule rounded-lg p-4">
          <div className="text-xs font-medium text-ink-muted">
            Lectures Conducted Today
          </div>
          <div className="text-2xl font-bold font-mono text-brand-600 mt-1">
            {conductedToday} / {classes.length}
          </div>
          <div className="text-xs text-ink-muted mt-1">
            Synchronized from department podiums
          </div>
        </div>

        <div className="bg-paper border border-rule rounded-lg p-4">
          <div className="text-xs font-medium text-ink-muted">
            Department Assessments Active
          </div>
          <div className="text-2xl font-bold font-mono text-ink mt-1">
            {quizzes.length} Quizzes
          </div>
          <div className="text-xs text-success mt-1 font-semibold">
            Continuous Quality Improvement (CQI)
          </div>
        </div>
      </div>

      {/* Main Grid: Approvals Queue Highlights & Departments Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Priority Approvals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-paper border border-rule rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-ink">
                  Priority Approvals Requiring Dean&apos;s Seal ({pendingCount})
                </h2>
                <p className="text-xs text-ink-muted">
                  Statutory attendance condonation, grade moderation, and conference duty leaves
                </p>
              </div>
              <Link
                href="/portal/dean/approvals"
                className="text-xs font-semibold text-danger hover:underline"
              >
                Inspect queue
              </Link>
            </div>

            <div className="space-y-3">
              {deanApprovals
                .filter((a) => a.status === 'PENDING')
                .slice(0, 3)
                .map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-md border border-rule bg-paper dark:bg-paper-2 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-danger-soft text-danger dark:bg-red-950/40 dark:text-red-400 capitalize">
                        {req.urgency} priority, {req.category}
                      </span>
                      <span className="text-xs text-ink-muted font-mono">{req.submittedDate}</span>
                    </div>
                    <div className="text-xs font-semibold text-ink">
                      {req.title}
                    </div>
                    <p className="text-xs text-ink-2 leading-relaxed">
                      {req.details}
                    </p>
                    <div className="pt-2 border-t border-rule flex items-center justify-between text-xs">
                      <span className="text-ink-muted">Submitted by: <strong className="text-ink">{req.submittedBy}</strong></span>
                      <Link
                        href="/portal/dean/approvals"
                        className="text-brand-600 font-semibold hover:underline"
                      >
                        Review sign-off
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Department Accreditation Health */}
        <div className="space-y-6">
          <div className="bg-paper border border-rule rounded-lg p-5 space-y-4">
            <h3 className="text-xs font-semibold text-ink-muted normal-case">
              Departments academic health
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-md border border-rule bg-paper dark:bg-paper-2">
                <div className="flex justify-between items-center font-semibold text-ink">
                  <span>Computer Science &amp; Engg</span>
                  <span className="text-success font-mono">NBA Tier-1</span>
                </div>
                <div className="text-xs text-ink-muted mt-1">
                  Faculty: 24, Students: 480, Attendance: {studentProfile.attendancePercentage}%
                </div>
              </div>

              <div className="p-3 rounded-md border border-rule bg-paper dark:bg-paper-2">
                <div className="flex justify-between items-center font-semibold text-ink">
                  <span>Electronics &amp; Comm Engg</span>
                  <span className="text-success font-mono">NBA Tier-1</span>
                </div>
                <div className="text-xs text-ink-muted mt-1">
                  Faculty: 18, Students: 360, Attendance: 84.1%
                </div>
              </div>

              <div className="p-3 rounded-md border border-rule bg-paper dark:bg-paper-2">
                <div className="flex justify-between items-center font-semibold text-ink">
                  <span>Mechanical &amp; Robotics Engg</span>
                  <span className="text-warning font-mono">NBA Renewal</span>
                </div>
                <div className="text-xs text-ink-muted mt-1">
                  Faculty: 16, Students: 310, Attendance: 80.4%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
