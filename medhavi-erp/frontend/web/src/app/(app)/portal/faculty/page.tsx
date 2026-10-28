'use client';

import Link from 'next/link';

/**
 * DESIGN BRIEF: Faculty Schedule & Instructor Overview
 * - Who uses: University professors and teaching faculty managing daily lectures, labs, and evaluations.
 * - Single most important thing: Imminent lecture details, direct 1-click action to mark attendance, and pending grading count.
 * - Visual direction: Dense, practical instructor dashboard with clear schedule chronology and grading priorities.
 * - Palette: Slate (`#0F172A`, `#334155`, `#F8FAFC`), Brand Ink (`#2563EB`), Emerald (`#059669`), Amber (`#D97706`).
 * - Spacing & radius: 4px/8px rhythm, rounded-xl containers with subtle 1px border.
 */

export default function FacultyDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]">
                Faculty Workspace
              </span>
              <span className="text-xs text-slate-500">
                EMP-CSE-014
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Welcome, Dr. Arvind Rao
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Associate Professor, Department of Computer Science &amp; Engineering
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/portal/faculty/attendance"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
            >
              Take Attendance Now
            </Link>
            <Link
              href="/portal/faculty/quizzes"
              className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
            >
              Create Quiz
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400">
            Teaching Workload
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            14 <span className="text-xs text-slate-400 font-normal">hrs / week</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            Optimal (AICTE norm: 14-16 hrs)
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400">
            Today&apos;s Lectures
          </div>
          <div className="text-2xl font-bold font-mono text-brand-600 dark:text-brand-400 mt-1">
            2 Sessions
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Next: 11:30 AM in LT-2
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400">
            Pending Quiz Evaluations
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            12 Submissions
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            CS501 Mid-Term
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400">
            Mentees / Advisees
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            24 Students
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            B.Tech CSE 2023-27 Batch
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Teaching Schedule & Assigned Subjects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Today&apos;s Assigned Classes &amp; Labs
                </h2>
                <p className="text-xs text-slate-500">Wednesday, Autumn Session</p>
              </div>
              <Link
                href="/portal/faculty/attendance"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Launch Roll Call
              </Link>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white font-mono uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]">
                      Active Next
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      CS501, Database Management Systems (Lecture)
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Batch: <strong className="text-slate-800 dark:text-slate-200">B.Tech CSE Sem 5 Sec A (64 Students)</strong>, Room: Lecture Hall LT-2
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Topic: Normalization to BCNF and Canonical Covers
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                  <div className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                    11:30 AM - 12:30 PM
                  </div>
                  <Link
                    href="/portal/faculty/attendance"
                    className="mt-1 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
                  >
                    Mark Roll Call
                  </Link>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    CS505, Database Systems Practical Lab (Batch A1)
                  </span>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Batch: B.Tech CSE Sem 5 (32 Students), Room: Computer Lab 3
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Experiment: PostgreSQL Query Optimization &amp; Index Profiling
                  </div>
                </div>
                <div className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                  02:00 PM - 04:00 PM
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Assigned Courses & Quick Links */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 font-medium">
              Assigned Subjects This Semester
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-brand-600">CS501</span>
                  <span className="text-[11px] text-slate-500 font-mono">4 Credits, 64 Stds</span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">
                  Database Management Systems
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Syllabus: 68% Completed (Unit 3 of 5)
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-brand-600">CS505</span>
                  <span className="text-[11px] text-slate-500 font-mono">2 Credits, 64 Stds</span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">
                  Database Systems Lab
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Experiments: 7 of 10 Completed
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-brand-600">CS702</span>
                  <span className="text-[11px] text-slate-500 font-mono">3 Credits, 52 Stds</span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">
                  Cloud Infrastructure Architecture
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Elective Course, Final Year
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
