'use client';

import Link from 'next/link';
import { MOCK_HOD_FACULTY_WORKLOAD } from '@/features/portals/portals-mock-data';

/**
 * DESIGN BRIEF: HOD Department Command Center
 * - Who uses: Head of Department managing 24 faculty members, 480 students, and department curriculum.
 * - Single most important thing: Departmental health at a glance (faculty workload distribution, student attendance compliance, syllabus pace).
 * - Visual direction: Dense, authoritative departmental command deck with real numbers and immediate escalation links.
 * - Palette: Slate (`#0F172A`, `#334155`, `#F8FAFC`), Brand Navy (`#1E3A8A`), Emerald (`#059669`), Amber (`#D97706`).
 * - Spacing & radius: 4px/8px rhythm, rounded-xl containers with subtle 1px border.
 */

export default function HodDashboardPage() {
  const overloadedFaculty = MOCK_HOD_FACULTY_WORKLOAD.filter((f) => f.status === 'overloaded');
  const underloadedFaculty = MOCK_HOD_FACULTY_WORKLOAD.filter((f) => f.status === 'underloaded');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]">
                Department Leadership
              </span>
              <span className="text-xs text-slate-500">
                Department of Computer Science &amp; Engineering
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              HOD Command Desk, Dr. Meenakshi Sundaram
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              School of Engineering &amp; Technology, 24 Faculty Members, 480 Enrolled Students
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
              14 Defaulters Alert
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Core Department Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400">
            Department Faculty
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            24 <span className="text-xs text-slate-400 font-normal">Members</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            4 Professors, 8 Assoc, 12 Asst
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400">
            Avg Department Attendance
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            86.4%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            +3.2% vs previous semester
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400">
            Workload Balance Alerts
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            2 Alerts
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            1 Overloaded, 1 Underloaded
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400">
            Active Courses &amp; Labs
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            18 Subjects
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across B.Tech Years 1 to 4
          </div>
        </div>
      </div>

      {/* Main Grid: Workload Hotspots & Batch Syllabus Pace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Workload Hotspots */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Faculty Teaching Workload Distribution
                </h2>
                <p className="text-xs text-slate-500">
                  UGC/AICTE Norm: Professors (12-14 hrs), Associate (14-16 hrs), Assistant (16-18 hrs)
                </p>
              </div>
              <Link
                href="/portal/hod/workload"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Manage Allocations
              </Link>
            </div>

            <div className="space-y-3">
              {MOCK_HOD_FACULTY_WORKLOAD.slice(0, 4).map((fac) => (
                <div
                  key={fac.facultyId}
                  className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {fac.facultyName}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500">{fac.designation}</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 mt-0.5">
                      Assigned: {fac.assignedSubjects.join(', ')}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-center">
                    <div className="text-right font-mono">
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {fac.totalHoursPerWeek} hrs / week
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {fac.theoryHoursPerWeek} Th + {fac.labHoursPerWeek} Lab
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-medium ${
                        fac.status === 'optimal'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                          : fac.status === 'overloaded'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200'
                      }`}
                    >
                      {fac.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Urgent HOD Attention Required */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 font-medium">
              Department Attention Queue
            </h3>

            <div className="p-3.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 text-xs space-y-2">
              <div className="font-bold text-rose-900 dark:text-rose-200 flex items-center justify-between">
                <span>14 Attendance Defaulters</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-600 font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]">
                  URGENT
                </span>
              </div>
              <p className="text-rose-800 dark:text-rose-300 text-[11px] leading-relaxed">
                14 students in B.Tech CSE Semester 5 currently sit below 75% attendance. Warning notices ready for HOD signature.
              </p>
              <Link
                href="/portal/hod/attendance-audit"
                className="inline-block mt-1 font-bold text-rose-700 dark:text-rose-300 hover:underline text-xs"
              >
                Review Defaulters &amp; Issue Notices
              </Link>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs space-y-2">
              <div className="font-bold text-slate-900 dark:text-slate-100">
                Upcoming Lab Examination Timetable
              </div>
              <p className="text-slate-500 text-[11px]">
                End-sem lab slots for Computer Networks and DBMS practicals require room clash resolution.
              </p>
              <Link
                href="/portal/hod/timetables"
                className="inline-block font-semibold text-brand-600 dark:text-brand-400 hover:underline text-xs"
              >
                View Department Timetable
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
