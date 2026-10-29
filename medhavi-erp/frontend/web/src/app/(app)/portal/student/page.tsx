'use client';

import Link from 'next/link';
import { usePortalStore } from '@/features/portals/portal-store';

export default function StudentDashboardPage() {
  const studentProfile = usePortalStore((state) => state.studentProfile);
  const quizzes = usePortalStore((state) => state.quizzes);
  const courses = usePortalStore((state) => state.courses);
  const invoices = usePortalStore((state) => state.invoices);
  const classes = usePortalStore((state) => state.classes);

  const activeQuizzes = quizzes.filter((q) => q.status === 'active');
  const pendingInvoice = invoices.find((inv) => inv.status === 'PENDING');
  const isAttendanceSafe = studentProfile.attendancePercentage >= 75;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Attention Needed */}
      <div className="bg-paper border border-rule rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-success-soft text-success border border-emerald-200 dark:border-emerald-900/40 dark:border-emerald-900/40">
                Enrollment active
              </span>
              <span className="text-xs text-ink-muted font-mono">
                {studentProfile.rollNo}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-ink mt-1.5">
              Welcome back, {studentProfile.fullName}
            </h1>
            <p className="text-xs text-ink-muted mt-0.5">
              {studentProfile.program}, Semester {studentProfile.semester} ({studentProfile.batch})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/portal/student/quizzes"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="whitespace-nowrap">Take active quiz ({activeQuizzes.length})</span>
            </Link>
            <Link
              href="/portal/student/profile"
              className="inline-flex items-center px-3.5 py-2 rounded-md border border-rule bg-paper hover:bg-paper-2 dark:bg-paper-2 text-ink text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              <span className="whitespace-nowrap">View profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Card with Live Teacher Sync */}
        <div className="bg-paper border border-rule rounded-lg p-4">
          <div className="text-xs font-medium text-ink-muted flex items-center justify-between">
            <span>Overall attendance</span>
            <span className="text-xs text-success font-medium">Synced</span>
          </div>
          <div className="text-2xl font-bold font-mono text-ink mt-1">
            {studentProfile.attendancePercentage}%
          </div>
          <div className="text-xs mt-1">
            {isAttendanceSafe ? (
              <span className="text-success font-semibold">
                Compliant (Above 75% cutoff)
              </span>
            ) : (
              <span className="text-danger font-semibold">
                Deficit alert (&lt; 75% cutoff)
              </span>
            )}
          </div>
        </div>

        <div className="bg-paper border border-rule rounded-lg p-4">
          <div className="text-xs font-medium text-ink-muted">
            Cumulative GPA
          </div>
          <div className="text-2xl font-bold font-mono text-ink mt-1">
            {studentProfile.cgpa} <span className="text-xs text-ink-muted font-normal">/ 10</span>
          </div>
          <div className="text-xs text-ink-muted mt-1 font-mono">
            {studentProfile.creditsEarned} of {studentProfile.totalCredits} credits earned
          </div>
        </div>

        <div className="bg-paper border border-rule rounded-lg p-4">
          <div className="text-xs font-medium text-ink-muted">
            Active quizzes
          </div>
          <div className="text-2xl font-bold font-mono text-brand-600 mt-1">
            {activeQuizzes.length} <span className="text-xs text-ink-muted font-normal">Active</span>
          </div>
          <div className="text-xs text-ink-muted mt-1 truncate">
            {activeQuizzes[0]?.title || 'No pending tests'}
          </div>
        </div>

        <div className="bg-paper border border-rule rounded-lg p-4">
          <div className="text-xs font-medium text-ink-muted">
            Fee balance
          </div>
          <div className="text-2xl font-bold font-mono text-ink mt-1">
            ₹{pendingInvoice?.balanceAmount.toLocaleString('en-IN') ?? '0'}
          </div>
          <div className="text-xs text-ink-muted mt-1">
            Exam fee due 15 Nov 2026
          </div>
        </div>
      </div>

      {/* Main Two Columns: Today Schedule + Active Quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today Schedule & Enrolled Courses */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today Schedule Panel (Synchronized from Teacher ID) */}
          <div className="bg-paper border border-rule rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-ink">
                  Today&apos;s Lecture Schedule ({classes.length} Sessions)
                </h2>
                <p className="text-xs text-ink-muted">
                  Academic Session Autumn 2025-26, live schedule from faculty
                </p>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-200 font-medium">
                {classes.filter((c) => !c.attendanceMarked).length} Upcoming
              </span>
            </div>

            <div className="space-y-3">
              {classes.map((cls) => {
                const isPending = !cls.attendanceMarked;
                return (
                  <div
                    key={cls.id}
                    className={`p-3.5 rounded-md border flex items-start justify-between transition-colors ${
                      isPending
                        ? 'border-brand-200 dark:border-brand-900/50 bg-brand-50/70 dark:bg-brand-950/50'
                        : 'border-rule bg-paper'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded font-mono ${
                            isPending
                              ? 'bg-brand-600 text-white'
                              : 'bg-success-soft text-success dark:bg-emerald-950/40 dark:text-emerald-300'
                          }`}
                        >
                          {isPending ? 'Upcoming' : 'Attended'}
                        </span>
                        <span className="text-xs font-semibold text-ink">
                          {cls.subjectCode}, {cls.subjectName} ({cls.type})
                        </span>
                      </div>
                      <div className="text-xs text-ink-2 mt-1">
                        Room: <strong className="text-ink">{cls.room}</strong>, Faculty: {cls.facultyName}
                      </div>
                      <div className="text-xs text-ink-muted mt-0.5">
                        Topic: <strong className="text-ink-2">{cls.topic}</strong>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-ink">
                        {cls.startTime} - {cls.endTime}
                      </div>
                      <div className="text-xs text-ink-muted mt-1 font-mono">
                        {cls.date}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enrolled Courses Grid */}
          <div className="bg-paper border border-rule rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-ink">
                  Semester 5 Enrolled Courses
                </h2>
                <p className="text-xs text-ink-muted">
                  4 Theory Courses + 2 Laboratory Practicals
                </p>
              </div>
              <Link
                href="/portal/student/courses"
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                View syllabus
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {courses.map((course) => {
                const isLow = course.attendancePercentage < 75;
                return (
                  <div
                    key={course.id}
                    className="p-3.5 rounded-md border border-rule bg-paper dark:bg-paper-2 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-brand-600">
                        {course.code}
                      </span>
                      <span className="text-xs font-mono text-ink-muted">
                        {course.credits} Credits
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-ink line-clamp-1">
                      {course.name}
                    </div>
                    <div className="text-xs text-ink-muted">
                      Faculty: {course.facultyName}
                    </div>
                    <div className="pt-2 border-t border-rule flex items-center justify-between text-xs">
                      <span className="text-ink-muted">Attendance:</span>
                      <span
                        className={`font-mono font-bold ${
                          isLow
                            ? 'text-danger'
                            : 'text-success'
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
          <div className="bg-paper border border-rule rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-ink-muted normal-case">
                Active assessments ({activeQuizzes.length})
              </h3>
            </div>

            <div className="space-y-3">
              {activeQuizzes.map((quiz) => (
                <div key={quiz.id} className="p-3.5 rounded-md border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-700 text-white font-mono">
                      Active now
                    </span>
                    <span className="font-mono text-xs font-bold text-ink">
                      {quiz.durationMinutes} mins, {quiz.totalMarks} marks
                    </span>
                  </div>
                  <div className="text-xs font-bold text-ink">
                    {quiz.title}
                  </div>
                  <div className="text-xs text-ink-muted">
                    Course: <strong className="text-ink">{quiz.subjectCode}</strong>, {quiz.facultyName}
                  </div>
                  <div className="pt-2">
                    <Link
                      href={`/portal/student/quizzes/${quiz.id}`}
                      className="w-full inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                    >
                      <span className="whitespace-nowrap">Take assessment</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/portal/student/quizzes"
              className="block text-center text-xs font-semibold text-brand-600 hover:underline pt-1"
            >
              Browse all assessments
            </Link>
          </div>

          {/* Academic Mentor Card */}
          <div className="bg-paper border border-rule rounded-lg p-5 space-y-3">
            <h3 className="text-xs font-semibold text-ink-muted normal-case">
              Assigned faculty mentor
            </h3>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-200 flex items-center justify-center font-bold text-sm">
                AR
              </div>
              <div>
                <div className="text-xs font-bold text-ink">
                  {studentProfile.advisorName}
                </div>
                <div className="text-xs text-ink-muted font-mono">
                  {studentProfile.advisorEmail}
                </div>
              </div>
            </div>
            <div className="text-xs text-ink-muted">
              Department of Computer Science &amp; Engineering, Office: Faculty Block 2, Cabin 14
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
