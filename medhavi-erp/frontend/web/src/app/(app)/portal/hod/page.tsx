'use client';

import Link from 'next/link';
import { usePortalStore } from '@/features/portals/portal-store';
import { useAuthStore } from '@/shared/stores/auth-store';

export default function HodDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const facultyWorkload = usePortalStore((state) => state.facultyWorkload);
  const classes = usePortalStore((state) => state.classes);
  const quizzes = usePortalStore((state) => state.quizzes);
  const studentRoster = usePortalStore((state) => state.studentRoster);

  const overloadedFaculty = facultyWorkload.filter((f) => f.status === 'overloaded');
  const defaultersCount = studentRoster.filter((s) => s.currentAttendance < 75).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-paper border border-rule rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                Department Leadership
              </span>
              <span className="text-xs text-ink-muted">
                Department of Computer Science &amp; Engineering
              </span>
            </div>
            <h1 className="text-xl font-bold text-ink mt-1.5">
              HOD Command Desk: {user?.displayName || 'Prof. Rajesh Verma'}
            </h1>
            <p className="text-xs text-ink-muted mt-0.5">
              School of Engineering &amp; Technology, 24 Faculty Members, 480 Enrolled Students
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/portal/hod/workload"
              className="px-4 py-2 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 whitespace-nowrap"
            >
              Audit Faculty Workloads
            </Link>
            <Link
              href="/portal/hod/attendance-audit"
              className="px-3.5 py-2 rounded-md border border-amber-200 dark:border-amber-900/40 bg-warning-soft hover:bg-amber-100 text-warning text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 whitespace-nowrap"
            >
              {defaultersCount} Attendance Alerts
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Core Department Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-paper border border-rule rounded-lg p-4">
          <div className="text-xs font-medium text-ink-muted">
            Workload Compliance
          </div>
          <div className="text-2xl font-bold font-mono text-ink mt-1">
            22 / 24 <span className="text-xs text-ink-muted font-normal">Compliant</span>
          </div>
          <div className="text-xs text-warning mt-1 font-semibold">
            {overloadedFaculty.length} Overloaded ({overloadedFaculty[0]?.facultyName || 'Dr. Anita Banerjee'})
          </div>
        </div>

        <div className="bg-paper border border-rule rounded-lg p-4">
          <div className="text-xs font-medium text-ink-muted">
            Student Attendance Deficits
          </div>
          <div className="text-2xl font-bold font-mono text-danger mt-1">
            {defaultersCount} Students
          </div>
          <div className="text-xs text-ink-muted mt-1">
            Below 75% examination threshold
          </div>
        </div>

        <div className="bg-paper border border-rule rounded-lg p-4">
          <div className="text-xs font-medium text-ink-muted">
            Department Sessions Today
          </div>
          <div className="text-2xl font-bold font-mono text-success mt-1">
            {classes.length} Sessions
          </div>
          <div className="text-xs text-ink-muted mt-1">
            {classes.filter((c) => c.attendanceMarked).length} attendance locked today
          </div>
        </div>

        <div className="bg-paper border border-rule rounded-lg p-4">
          <div className="text-xs font-medium text-ink-muted">
            Active Tests &amp; Quizzes
          </div>
          <div className="text-2xl font-bold font-mono text-ink mt-1">
            {quizzes.length} Quizzes
          </div>
          <div className="text-xs text-success mt-1 font-semibold">
            Continuous internal assessment
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Class Schedule & Workload Audit */}
        <div className="lg:col-span-2 space-y-6">
          {/* Department Lectures Today */}
          <div className="bg-paper border border-rule rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-ink">
                  Live Department Lectures &amp; Labs ({classes.length})
                </h2>
                <p className="text-xs text-ink-muted">Real-time status synchronized from Faculty desks</p>
              </div>
              <Link
                href="/portal/hod/timetables"
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                View full timetables
              </Link>
            </div>

            <div className="space-y-3">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className="p-3.5 rounded-md border border-rule bg-paper dark:bg-paper-2 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-brand-600">
                        {cls.subjectCode}
                      </span>
                      <span className="text-xs font-semibold text-ink">
                        {cls.subjectName} ({cls.type})
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-semibold capitalize ${
                          cls.attendanceMarked
                            ? 'bg-success-soft text-success dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-warning-soft text-warning dark:bg-amber-950/40 dark:text-amber-300'
                        }`}
                      >
                        {cls.attendanceMarked ? 'Conducted' : 'Scheduled'}
                      </span>
                    </div>
                    <div className="text-xs text-ink-muted mt-1">
                      Faculty: <strong className="text-ink font-medium">{cls.facultyName}</strong>, Room: {cls.room}, Topic: {cls.topic}
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs font-bold text-ink">
                    {cls.startTime}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Actions & Defaulters Snapshot */}
        <div className="space-y-6">
          <div className="bg-paper border border-rule rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-ink-muted normal-case">
                Attendance Deficit Watchlist
              </h3>
              <span className="text-xs font-bold text-danger font-mono">
                {defaultersCount} Students
              </span>
            </div>

            <div className="space-y-2.5">
              {studentRoster
                .filter((s) => s.currentAttendance < 75)
                .map((def) => (
                  <div
                    key={def.id}
                    className="p-3 rounded-md border border-red-200 dark:border-red-900/40 bg-danger-soft flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-ink">
                        {def.name}
                      </div>
                      <div className="text-xs font-mono text-ink-muted">
                        {def.rollNo}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-danger">
                        {def.currentAttendance}%
                      </div>
                      <span className="text-xs font-semibold text-danger bg-red-100 dark:bg-red-950/60 px-1.5 py-0.5 rounded capitalize">
                        Alert
                      </span>
                    </div>
                  </div>
                ))}
            </div>

            <Link
              href="/portal/hod/attendance-audit"
              className="block text-center text-xs font-semibold text-brand-600 hover:underline pt-1"
            >
              Open Defaulter Communication Ledger
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
