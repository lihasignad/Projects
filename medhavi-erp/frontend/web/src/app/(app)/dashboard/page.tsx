'use client';

import Link from 'next/link';
import { useAuthStore } from '@/shared/stores/auth-store';
import { usePortalStore } from '@/features/portals/portal-store';
import { Can } from '@/shared/ui/rbac-guard';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const roles = useAuthStore((state) => state.roles);

  const classes = usePortalStore((state) => state.classes);
  const studentRoster = usePortalStore((state) => state.studentRoster);
  const invoices = usePortalStore((state) => state.invoices);
  const deanApprovals = usePortalStore((state) => state.deanApprovals);

  const roleTitle = roles.map((r) => r.name).join(', ') || 'System Administrator';

  // Real operational aggregations
  const completedClasses = classes.filter((c) => c.attendanceMarked).length;
  const pendingClasses = classes.filter((c) => !c.attendanceMarked);
  const defaulters = studentRoster.filter((s) => s.currentAttendance < 75);
  const overdueInvoices = invoices.filter((inv) => inv.status === 'OVERDUE');
  const overdueTotal = overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const pendingApprovals = deanApprovals.filter((a) => a.status === 'PENDING');

  return (
    <div className="space-y-6">
      {/* Header with operational status & primary actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-rule pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
              Campus Operations
            </span>
            <span className="text-xs text-ink-muted">
              Autumn 2026 Regular Term
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-ink mt-1">
            Operational Dashboard
          </h1>
          <p className="text-xs text-ink-muted mt-0.5">
            Signed in as <strong className="text-ink font-medium">{user?.displayName || user?.email}</strong> ({roleTitle})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Can permission="attendance:write">
            <Link
              href="/portal/faculty/attendance"
              className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-md bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              Mark Attendance
            </Link>
          </Can>
          <Can permission="students:create">
            <Link
              href="/students/admissions"
              className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-md border border-rule bg-paper text-ink hover:bg-paper-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              New Admission
            </Link>
          </Can>
        </div>
      </div>

      {/* 4 Real Actionable Metric Panels */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Classes Scheduled & Pending */}
        <div className="bg-paper border border-rule rounded-lg p-4">
          <div className="text-xs font-medium text-ink-muted">
            Lectures &amp; Labs Today
          </div>
          <div className="text-2xl font-bold tabular-nums text-ink mt-1">
            {completedClasses} / {classes.length}
          </div>
          <div className="text-xs text-warning mt-1 font-medium">
            {pendingClasses.length} pending roll call
          </div>
        </div>

        {/* Attendance Deficits */}
        <div className="bg-paper border border-rule rounded-lg p-4">
          <div className="text-xs font-medium text-ink-muted">
            Attendance Deficits
          </div>
          <div className="text-2xl font-bold tabular-nums text-danger mt-1">
            {defaulters.length} Students
          </div>
          <div className="text-xs text-ink-muted mt-1">
            Below 75% exam eligibility
          </div>
        </div>

        {/* Overdue Receivables */}
        <div className="bg-paper border border-rule rounded-lg p-4">
          <div className="text-xs font-medium text-ink-muted">
            Overdue Fee Receivables
          </div>
          <div className="text-2xl font-bold tabular-nums text-danger mt-1">
            ₹{overdueTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-ink-muted mt-1">
            Across {overdueInvoices.length} pending student invoices
          </div>
        </div>

        {/* Pending Sanctions & Approvals */}
        <div className="bg-paper border border-rule rounded-lg p-4">
          <div className="text-xs font-medium text-ink-muted">
            Governance Sign-offs
          </div>
          <div className="text-2xl font-bold tabular-nums text-brand-600 mt-1">
            {pendingApprovals.length} Requests
          </div>
          <div className="text-xs text-ink-muted mt-1">
            Awaiting administrative approval
          </div>
        </div>
      </div>

      {/* Two Column Layout: Urgent Operational Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real Action Queue */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Attendance Sessions */}
          <div className="bg-paper border border-rule rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-ink">
                  Classes Pending Roll Call ({pendingClasses.length})
                </h2>
                <p className="text-xs text-ink-muted">
                  Faculty roll calls required for today&apos;s scheduled lecture hours
                </p>
              </div>
              <Link
                href="/portal/faculty"
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                Open faculty console
              </Link>
            </div>

            {pendingClasses.length === 0 ? (
              <div className="p-4 rounded-md border border-rule bg-paper-2 text-center text-xs text-ink-muted">
                All scheduled lectures and labs for today have attendance verified and locked.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="p-3.5 rounded-md border border-rule bg-paper dark:bg-paper-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-warning-soft text-warning dark:bg-amber-950/40 dark:text-amber-300">
                          Pending
                        </span>
                        <span className="text-xs font-semibold text-ink">
                          {cls.subjectCode} - {cls.subjectName}
                        </span>
                      </div>
                      <div className="text-xs text-ink-muted mt-1">
                        Faculty: <strong className="text-ink font-medium">{cls.facultyName}</strong>, Room: {cls.room}, Batch: {cls.batch}
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                      <div className="tabular-nums text-xs font-bold text-ink">
                        {cls.startTime} - {cls.endTime}
                      </div>
                      <Link
                        href={`/portal/faculty/attendance?classId=${cls.id}&subjectCode=${cls.subjectCode}`}
                        className="mt-1 px-3 py-1 rounded bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                      >
                        Submit Roll Call
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Governance Approvals */}
          <div className="bg-paper border border-rule rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-ink">
                  Priority Administrative Approvals ({pendingApprovals.length})
                </h2>
                <p className="text-xs text-ink-muted">
                  Dean and HOD requisitions requiring institutional authorization
                </p>
              </div>
              <Link
                href="/portal/dean/approvals"
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                View all requests
              </Link>
            </div>

            <div className="space-y-3">
              {pendingApprovals.map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-md border border-rule bg-paper dark:bg-paper-2 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-danger-soft text-danger dark:bg-red-950/40 dark:text-red-400 capitalize">
                      {req.urgency} priority, {req.category}
                    </span>
                    <span className="text-xs text-ink-muted tabular-nums">
                      {req.submittedDate}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-ink">
                    {req.title}
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    {req.details}
                  </p>
                  <div className="pt-2 border-t border-rule flex items-center justify-between text-xs">
                    <span className="text-ink-muted">
                      Initiator: <strong className="text-ink font-medium">{req.submittedBy}</strong>
                    </span>
                    <Link
                      href="/portal/dean/approvals"
                      className="text-brand-600 font-semibold hover:underline"
                    >
                      Process Sign-off
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Defaulter Watchlist & Fee Outstanding */}
        <div className="space-y-6">
          {/* Defaulter Alert Feed */}
          <div className="bg-paper border border-rule rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-ink">
                  Attendance Defaulter Watchlist
                </h3>
                <p className="text-xs text-ink-muted">&lt; 75% examination threshold</p>
              </div>
              <Link
                href="/portal/hod/attendance-audit"
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                Audit
              </Link>
            </div>

            <div className="space-y-2.5">
              {defaulters.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-md border border-red-200 dark:border-red-900/40 bg-danger-soft flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold text-ink">
                      {s.name}
                    </div>
                    <div className="text-xs font-mono text-ink-muted">
                      {s.rollNo}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs tabular-nums font-bold text-danger">
                      {s.currentAttendance}%
                    </div>
                    <span className="text-[11px] font-semibold text-danger">
                      Notice Required
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overdue Invoices Snapshot */}
          <div className="bg-paper border border-rule rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-ink">
                  Overdue Fee Invoices
                </h3>
                <p className="text-xs text-ink-muted">Past scheduled payment milestone</p>
              </div>
              <Link
                href="/finance/invoices"
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                Invoices
              </Link>
            </div>

            <div className="space-y-2.5">
              {overdueInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 rounded-md border border-rule bg-paper dark:bg-paper-2 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold text-ink">
                      {inv.description}
                    </div>
                    <div className="text-xs text-ink-muted">
                      Due: <span className="tabular-nums">{inv.dueDate}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs tabular-nums font-bold text-danger">
                      ₹{inv.amount.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[11px] font-semibold text-danger bg-red-100 dark:bg-red-950/60 px-1.5 py-0.5 rounded capitalize">
                      Overdue
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
