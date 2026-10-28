'use client';

import Link from 'next/link';
import { MOCK_STUDENT, MOCK_QUIZZES, MOCK_COURSES, MOCK_INVOICES } from '@/features/portals/portals-mock-data';

/**
 * DESIGN BRIEF: Student Overview Dashboard
 * - Who uses: Undergraduate & Postgraduate students checking daily schedule, tests, and attendance before class.
 * - Single most important thing: Current class location/time, imminent quizzes due, and overall attendance vs 75% cutoff.
 * - Visual direction: Clean, academic-editorial layout with prominent schedule focal point and clear action triggers.
 * - Palette: Slate (`#0F172A`, `#475569`, `#F8FAFC`), Emerald (`#059669`), Amber (`#D97706`), Ink Blue (`#2563EB`).
 * - Spacing & radius: 4px/8px rhythm, rounded-lg (8px) and rounded-xl (12px) container radius.
 */

export default function StudentDashboardPage() {
  const activeQuiz = MOCK_QUIZZES.find((q) => q.status === 'active');
  const pendingInvoice = MOCK_INVOICES.find((inv) => inv.status === 'PENDING');
  const lowAttendanceCourse = MOCK_COURSES.find((c) => c.attendancePercentage < 75);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Attention Needed */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]">
                Enrollment Active
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {MOCK_STUDENT.rollNo}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Welcome back, {MOCK_STUDENT.fullName}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {MOCK_STUDENT.program}, Semester {MOCK_STUDENT.semester} ({MOCK_STUDENT.batch})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/portal/student/quizzes"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
            >
              <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Take Active Quiz</span>
            </Link>
            <Link
              href="/portal/student/profile"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
            >
              <span>View 360° Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Critical Action Banner if attendance or fee needs attention */}
      {lowAttendanceCourse && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-start space-x-3 text-xs">
          <svg aria-hidden="true" className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <div className="font-semibold text-amber-900 dark:text-amber-200">
              Attendance Shortfall Alert in {lowAttendanceCourse.name} ({lowAttendanceCourse.code})
            </div>
            <div className="text-amber-700 dark:text-amber-300 mt-0.5">
              Your attendance is currently <strong className="font-mono">{lowAttendanceCourse.attendancePercentage}%</strong> (below 75% university examination eligibility threshold). You need to attend the next 4 consecutive classes to regain compliance.
            </div>
          </div>
          <Link
            href="/portal/student/attendance"
            className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-medium text-[11px] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
          >
            Check Records
          </Link>
        </div>
      )}

      {/* 4 Quick Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 font-medium">
            Overall Attendance
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {MOCK_STUDENT.attendancePercentage}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Safe (&gt;75% required by MSU)
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 font-medium">
            Cumulative CGPA
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {MOCK_STUDENT.cgpa} <span className="text-xs text-slate-400 font-normal">/ 10.0</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {MOCK_STUDENT.creditsEarned} of {MOCK_STUDENT.totalCredits} credits earned
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 font-medium">
            Active Quizzes
          </div>
          <div className="text-2xl font-bold font-mono text-brand-600 dark:text-brand-400 mt-1">
            1 <span className="text-xs text-slate-400 font-normal">due this week</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            CS501 Mid-Term Assessment
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 font-medium">
            Fee Balance
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            ₹{pendingInvoice?.balanceAmount.toLocaleString('en-IN') ?? '0'}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Exam fee due 15 Nov 2026
          </div>
        </div>
      </div>

      {/* Main Two Columns: Today Schedule + Active Quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today Schedule & Enrolled Courses */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today Schedule Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Today&apos;s Lecture Schedule
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Wednesday, Academic Session Autumn 2025-26
                </p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]">
                3 Sessions Scheduled
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-lg border border-brand-200 dark:border-brand-900/60 bg-brand-50/50 dark:bg-brand-950/20 flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-brand-600 text-white font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]">
                      NEXT UP
                    </span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      CS501, Database Management Systems
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Room: <strong className="text-slate-800 dark:text-slate-200">Lecture Hall LT-2</strong>, Faculty: Dr. Arvind Rao
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Topic: BCNF Normalization & Multivalued Dependencies
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-slate-900 dark:text-slate-100">
                    11:30 AM - 12:30 PM
                  </div>
                  <div className="text-[11px] text-brand-600 dark:text-brand-400 mt-1">
                    Starts in 35 mins
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    CS503, Computer Networks
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Room: Smart Classroom SC-1, Faculty: Prof. Ramanathan
                  </div>
                </div>
                <div className="text-right font-mono text-xs font-medium text-slate-700 dark:text-slate-300">
                  02:00 PM - 03:00 PM
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    CS504, Theory of Computation
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Room: Seminar Hall B, Faculty: Dr. Anita Banerjee
                  </div>
                </div>
                <div className="text-right font-mono text-xs font-medium text-slate-700 dark:text-slate-300">
                  03:30 PM - 05:00 PM
                </div>
              </div>
            </div>
          </div>

          {/* Enrolled Courses Snapshot */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Current Semester Courses
              </h2>
              <Link
                href="/portal/student/courses"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                View LMS Modules
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MOCK_COURSES.map((course) => (
                <div
                  key={course.id}
                  className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                      {course.code}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]">
                      {course.credits} Credits
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                    {course.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {course.facultyName}
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Attendance:</span>
                    <span
                      className={`font-mono font-semibold ${
                        course.attendancePercentage >= 75
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {course.attendancePercentage}% ({course.attendedClasses}/{course.totalClasses})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Active Assessment Card & Advisor Information */}
        <div className="space-y-6">
          {/* Active Quiz Card */}
          {activeQuiz && (
            <div className="bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-900 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-medium animate-pulse motion-reduce:animate-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]">
                  Assessment Live
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  {activeQuiz.durationMinutes} mins
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {activeQuiz.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Subject: {activeQuiz.subjectCode} - {activeQuiz.subjectName}
              </p>
              <div className="p-3 rounded bg-slate-50 dark:bg-slate-950 text-xs space-y-1">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Total Marks:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{activeQuiz.totalMarks}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Questions:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{activeQuiz.questionsCount} MCQs</span>
                </div>
              </div>
              <Link
                href={`/portal/student/quizzes/${activeQuiz.id}`}
                className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                Start Assessment Now
              </Link>
            </div>
          )}

          {/* Academic Advisor Dossier */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 font-medium">
              Assigned Faculty Advisor
            </h3>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-sm">
                AR
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {MOCK_STUDENT.advisorName}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Associate Professor, CSE
                </div>
                <div className="text-[11px] text-brand-600 dark:text-brand-400 font-mono">
                  {MOCK_STUDENT.advisorEmail}
                </div>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              Office Hours: Tuesday &amp; Thursday, 04:00 PM - 05:00 PM (Cabin F-204)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
