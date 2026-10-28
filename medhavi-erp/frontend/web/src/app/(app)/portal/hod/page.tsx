'use client';

import Link from 'next/link';
import { usePortalStore } from '@/features/portals/portal-store';
import { useAuthStore } from '@/shared/stores/auth-store';

/**
 * DESIGN BRIEF: HOD Department Command Center
 * - Who uses: Head of Department managing faculty, students, and department curriculum.
 * - Single most important thing: Departmental health at a glance (faculty workload distribution, student attendance compliance, syllabus pace) synchronized with all portals.
 * - Visual direction: Dense, authoritative departmental command deck with real numbers and immediate escalation links.
 * - Palette: Slate (`#0F172A`, `#334155`, `#F8FAFC`), Brand Navy (`#1E3A8A`), Emerald (`#059669`), Amber (`#D97706`).
 * - Spacing & radius: 4px/8px rhythm, rounded-xl containers with subtle 1px border.
 */

export default function HodDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const facultyWorkload = usePortalStore((state) => state.facultyWorkload);
  const classes = usePortalStore((state) => state.classes);
  const quizzes = usePortalStore((state) => state.quizzes);
  const studentRoster = usePortalStore((state) => state.studentRoster);
  const totalLecturesConductedToday = usePortalStore((state) => state.totalLecturesConductedToday);

  const overloadedFaculty = facultyWorkload.filter((f) => f.status === 'overloaded');
  const underloadedFaculty = facultyWorkload.filter((f) => f.status === 'underloaded');
  const defaultersCount = studentRoster.filter((s) => s.currentAttendance < 75).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                Department Leadership
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Department of Computer Science &amp; Engineering
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              HOD Command Desk: {user?.displayName || 'Prof. Rajesh Verma'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              School of Engineering &amp; Technology · 24 Faculty Members · 480 Enrolled Students
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/portal/hod/workload"
              className="px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
            >
              Audit Faculty Workloads
            </Link>
            <Link
              href="/portal/hod/attendance-audit"
              className="px-3.5 py-2 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
            >
              {defaultersCount} Attendance Alerts
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Core Department Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400">
            Workload Compliance
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            22 / 24 <span className="text-xs text-slate-400 font-normal">Compliant</span>
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-semibold">
            {overloadedFaculty.length} Overloaded ({overloadedFaculty[0]?.facultyName || 'Dr. Anita Banerjee'})
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400">
            Student Attendance Deficits
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            {defaultersCount} Students
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Below 75% examination threshold
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400">
            Department Sessions Today
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {classes.length} Sessions
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {classes.filter((c) => c.attendanceMarked).length} attendance locked today
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400">
            Active Tests &amp; Quizzes
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {quizzes.length} Quizzes
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
            Continuous internal assessment
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Class Schedule & Workload Audit */}
        <div className="lg:col-span-2 space-y-6">
          {/* Department Lectures Today */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Live Department Lectures &amp; Labs ({classes.length})
                </h2>
                <p className="text-xs text-slate-500">Real-time status synchronized from Faculty desks</p>
              </div>
              <Link
                href="/portal/hod/timetables"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Full Timetables &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                        {cls.subjectCode}
                      </span>
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {cls.subjectName} ({cls.type})
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                          cls.attendanceMarked
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {cls.attendanceMarked ? 'Conducted' : 'Scheduled'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Faculty: <strong className="text-slate-700 dark:text-slate-300 font-medium">{cls.facultyName}</strong> · Room: {cls.room} · Topic: {cls.topic}
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                    {cls.startTime}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Actions & Defaulters Snapshot */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 font-medium">
                Attendance Deficit Watchlist
              </h3>
              <span className="text-xs font-bold text-rose-600 font-mono">
                {defaultersCount} Students
              </span>
            </div>

            <div className="space-y-2.5">
              {studentRoster
                .filter((s) => s.currentAttendance < 75)
                .map((def) => (
                  <div
                    key={def.id}
                    className="p-3 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {def.name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {def.rollNo}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                        {def.currentAttendance}%
                      </div>
                      <span className="text-[9px] font-bold text-rose-700 bg-rose-100 dark:bg-rose-950 px-1.5 py-0.2 rounded">
                        ALERT
                      </span>
                    </div>
                  </div>
                ))}
            </div>

            <Link
              href="/portal/hod/attendance-audit"
              className="block text-center text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline pt-1"
            >
              Open Defaulter Communication Ledger &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
