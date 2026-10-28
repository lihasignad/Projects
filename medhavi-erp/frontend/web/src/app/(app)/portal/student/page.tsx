'use client';

import Link from 'next/link';
import { usePortalStore } from '@/features/portals/portal-store';

/**
 * DESIGN BRIEF: Student Overview Dashboard
 * - Who uses: Undergraduate & Postgraduate students checking daily schedule, tests, and attendance before class.
 * - Single most important thing: Current class location/time, imminent quizzes due, and overall attendance vs 75% cutoff with live synchronization from teacher activity.
 * - Visual direction: Clean, academic-editorial layout with prominent schedule focal point and clear action triggers.
 * - Palette: Slate (`#0F172A`, `#475569`, `#F8FAFC`), Emerald (`#059669`), Amber (`#D97706`), Ink Blue (`#2563EB`).
 * - Spacing & radius: 4px/8px rhythm, rounded-lg (8px) and rounded-xl (12px) container radius.
 */

export default function StudentDashboardPage() {
  const studentProfile = usePortalStore((state) => state.studentProfile);
  const quizzes = usePortalStore((state) => state.quizzes);
  const courses = usePortalStore((state) => state.courses);
  const invoices = usePortalStore((state) => state.invoices);
  const classes = usePortalStore((state) => state.classes);

  const activeQuizzes = quizzes.filter((q) => q.status === 'active');
  const pendingInvoice = invoices.find((inv) => inv.status === 'PENDING');
  const lowAttendanceCourse = courses.find((c) => c.attendancePercentage < 75);

  const isAttendanceSafe = studentProfile.attendancePercentage >= 75;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Attention Needed */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Enrollment Active
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {studentProfile.rollNo}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Welcome back, {studentProfile.fullName}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {studentProfile.program}, Semester {studentProfile.semester} ({studentProfile.batch})
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
              <span>Take Active Quiz ({activeQuizzes.length})</span>
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

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Card with Live Teacher Sync */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 font-medium flex items-center justify-between">
            <span>Overall Attendance</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Synced</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {studentProfile.attendancePercentage}%
          </div>
          <div className="text-[11px] mt-1">
            {isAttendanceSafe ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Compliant (Above 75% cutoff)
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                Deficit Alert (&lt; 75% Cutoff)
              </span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 font-medium">
            Cumulative GPA
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {studentProfile.cgpa} <span className="text-xs text-slate-400 font-normal">/ 10</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
            {studentProfile.creditsEarned} of {studentProfile.totalCredits} Credits Earned
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 font-medium">
            Active Quizzes
          </div>
          <div className="text-2xl font-bold font-mono text-brand-600 dark:text-brand-400 mt-1">
            {activeQuizzes.length} <span className="text-xs text-slate-400 font-normal">Active</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {activeQuizzes[0]?.title || 'No pending tests'}
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
          {/* Today Schedule Panel (Synchronized from Teacher ID) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Today&apos;s Lecture Schedule ({classes.length} Sessions)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Academic Session Autumn 2025-26 · Live Schedule from Faculty
                </p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-medium">
                {classes.filter((c) => !c.attendanceMarked).length} Upcoming
              </span>
            </div>

            <div className="space-y-3">
              {classes.map((cls) => {
                const isPending = !cls.attendanceMarked;
                return (
                  <div
                    key={cls.id}
                    className={`p-3.5 rounded-lg border flex items-start justify-between transition-colors ${
                      isPending
                        ? 'border-brand-200 dark:border-brand-900/60 bg-brand-50/50 dark:bg-brand-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${
                            isPending
                              ? 'bg-brand-600 text-white'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {isPending ? 'Upcoming' : 'Attended'}
                        </span>
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {cls.subjectCode}, {cls.subjectName} ({cls.type})
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Room: <strong className="text-slate-800 dark:text-slate-200">{cls.room}</strong>, Faculty: {cls.facultyName}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Topic: <strong className="text-slate-700 dark:text-slate-300">{cls.topic}</strong>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-slate-900 dark:text-slate-100">
                        {cls.startTime} - {cls.endTime}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 font-mono">
                        {cls.date}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enrolled Courses Grid */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Semester 5 Enrolled Courses
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  4 Theory Courses + 2 Laboratory Practicals
                </p>
              </div>
              <Link
                href="/portal/student/courses"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                View Syllabus &amp; LMS &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {courses.map((course) => {
                const isLow = course.attendancePercentage < 75;
                return (
                  <div
                    key={course.id}
                    className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                        {course.code}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {course.credits} Credits
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                      {course.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Faculty: {course.facultyName}
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Attendance:</span>
                      <span
                        className={`font-mono font-bold ${
                          isLow
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {course.attendancePercentage}% ({course.attendedClasses}/{course.totalClasses})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Active Quizzes & Actions */}
        <div className="space-y-6">
          {/* Active Quizzes Card (Live Teacher Quizzes) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 font-medium">
                Active Assessments ({activeQuizzes.length})
              </h3>
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
            </div>

            <div className="space-y-3">
              {activeQuizzes.map((quiz) => (
                <div key={quiz.id} className="p-3.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-600 text-white font-mono uppercase">
                      Active Now
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                      {quiz.durationMinutes} Mins · {quiz.totalMarks} Marks
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {quiz.title}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Course: <strong className="text-slate-700 dark:text-slate-300">{quiz.subjectCode}</strong> · {quiz.facultyName}
                  </div>
                  <div className="pt-2">
                    <Link
                      href={`/portal/student/quizzes/${quiz.id}`}
                      className="w-full inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 active:scale-[0.99]"
                    >
                      Start Assessment &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/portal/student/quizzes"
              className="block text-center text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline pt-1"
            >
              Browse All Assessments &rarr;
            </Link>
          </div>

          {/* Academic Mentor Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-400 font-medium">
              Assigned Faculty Mentor
            </h3>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-sm">
                AR
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {studentProfile.advisorName}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {studentProfile.advisorEmail}
                </div>
              </div>
            </div>
            <div className="text-[11px] text-slate-500">
              Department of Computer Science &amp; Engineering, Office: Faculty Block 2, Cabin 14
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
