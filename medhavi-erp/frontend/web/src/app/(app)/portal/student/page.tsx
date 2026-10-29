'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePortalStore } from '@/features/portals/portal-store';

// Helper: Format dates strictly as "15 Nov 2026"
function formatDate(dateInput: string | Date): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

// Helper: Format time as "9:30 AM" (strip leading zero from single-digit hour)
function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  return timeStr.replace(/^0(\d:)/, '$1');
}

// Helper: Format time range: "9:30 AM – 11:00 AM"
function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTime(startTime)} – ${formatTime(endTime)}`;
}

// Helper: Parse "09:30 AM" or "9:30 AM" into minutes from midnight
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match || !match[1] || !match[2] || !match[3]) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

interface UpcomingItem {
  id: string;
  title: string;
  category: 'assignment' | 'quiz' | 'exam' | 'fee';
  categoryLabel: string;
  detail: string;
  dueDate: string;
  actionUrl: string;
  isActive?: boolean;
}

export default function StudentDashboardPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const studentProfile = usePortalStore((state) => state.studentProfile);
  const quizzes = usePortalStore((state) => state.quizzes);
  const courses = usePortalStore((state) => state.courses);
  const invoices = usePortalStore((state) => state.invoices);
  const classes = usePortalStore((state) => state.classes);

  const activeQuizzes = useMemo(
    () => quizzes.filter((q) => q.status === 'active'),
    [quizzes]
  );
  const pendingInvoice = useMemo(
    () => invoices.find((inv) => inv.status === 'PENDING'),
    [invoices]
  );

  // Real current date in IST formatted as "29 Oct 2026"
  const todayIstFormatted = useMemo(() => {
    return formatDate(new Date());
  }, []);

  // Current time in IST in minutes
  const istNowMinutes = useMemo(() => {
    const now = new Date();
    const istStr = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour12: false });
    const parts = istStr.split(':').map(Number);
    const h = parts[0] ?? 0;
    const m = parts[1] ?? 0;
    return h * 60 + m;
  }, []);

  // Sort today's schedule by start time ascending
  const sortedClasses = useMemo(() => {
    return [...classes].sort((a, b) => {
      return parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime);
    });
  }, [classes]);

  // Determine current or next session
  const highlightedIndex = useMemo(() => {
    if (sortedClasses.length === 0) return -1;

    // 1. Current in-progress session
    const currentIdx = sortedClasses.findIndex((c) => {
      const start = parseTimeToMinutes(c.startTime);
      const end = parseTimeToMinutes(c.endTime);
      return istNowMinutes >= start && istNowMinutes <= end;
    });
    if (currentIdx !== -1) return currentIdx;

    // 2. Next upcoming session by start time
    const upcomingIdx = sortedClasses.findIndex((c) => {
      const start = parseTimeToMinutes(c.startTime);
      return start > istNowMinutes;
    });
    if (upcomingIdx !== -1) return upcomingIdx;

    // 3. Next session by unmarked attendance
    const pendingIdx = sortedClasses.findIndex((c) => !c.attendanceMarked);
    if (pendingIdx !== -1) return pendingIdx;

    // 4. Default to first session
    return 0;
  }, [sortedClasses, istNowMinutes]);

  const nextSession = highlightedIndex >= 0 ? sortedClasses[highlightedIndex] : null;

  // Time remaining string for next session
  const nextSessionTimeRemaining = useMemo(() => {
    if (!nextSession) return '';
    const start = parseTimeToMinutes(nextSession.startTime);
    const end = parseTimeToMinutes(nextSession.endTime);

    if (istNowMinutes >= start && istNowMinutes <= end) {
      const rem = end - istNowMinutes;
      return `In progress · ends in ${rem} min`;
    }
    if (istNowMinutes < start) {
      const diff = start - istNowMinutes;
      if (diff >= 60) {
        const hrs = Math.floor(diff / 60);
        const mins = diff % 60;
        return mins > 0 ? `Starts in ${hrs}h ${mins}m` : `Starts in ${hrs}h`;
      }
      return `Starts in ${diff} min`;
    }
    return `Scheduled at ${formatTime(nextSession.startTime)}`;
  }, [nextSession, istNowMinutes]);

  // Attendance metrics & compliance calculation
  const attendanceData = useMemo(() => {
    const totalConducted = courses.reduce((acc, c) => acc + c.totalClasses, 0);
    const totalAttended = courses.reduce((acc, c) => acc + c.attendedClasses, 0);
    const percent =
      totalConducted > 0
        ? Math.round((totalAttended / totalConducted) * 1000) / 10
        : studentProfile.attendancePercentage;

    // Cushion: max classes student can miss while maintaining >= 75%
    // attended / (conducted + m) >= 0.75  =>  0.75m <= attended - 0.75*conducted
    const missable = Math.max(
      0,
      Math.floor((totalAttended - 0.75 * totalConducted) / 0.75)
    );

    // If deficit: classes needed consecutively to reach 75%
    const needed = Math.max(
      0,
      Math.ceil((0.75 * totalConducted - totalAttended) / 0.25)
    );

    const deficitSubjects = courses.filter((c) => c.attendancePercentage < 75);

    return {
      percentage: percent,
      missable,
      needed,
      deficitSubjects,
      isCompliant: percent >= 75,
    };
  }, [courses, studentProfile.attendancePercentage]);

  // Fee balance and due calculation
  const feeData = useMemo(() => {
    if (!pendingInvoice) {
      return { balance: 0, dueText: 'No pending dues', hasDue: false };
    }
    const due = new Date(pendingInvoice.dueDate);
    const now = new Date();
    const utcDue = Date.UTC(due.getFullYear(), due.getMonth(), due.getDate());
    const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.ceil((utcDue - utcNow) / (1000 * 60 * 60 * 24));

    let dueText = 'Due today';
    if (diffDays > 0) {
      dueText = `Due in ${diffDays} days`;
    } else if (diffDays < 0) {
      dueText = `Overdue by ${Math.abs(diffDays)} days`;
    }

    return {
      balance: pendingInvoice.balanceAmount,
      dueDateFormatted: formatDate(pendingInvoice.dueDate),
      dueText,
      hasDue: true,
    };
  }, [pendingInvoice]);

  // "Coming up this week" items: assignments, quizzes, exams, fee deadlines sorted by date
  const upcomingItems = useMemo(() => {
    const items: UpcomingItem[] = [];

    // Assignments
    items.push({
      id: 'asg-os-1',
      title: 'Semaphore Synchronization Lab Report',
      category: 'assignment',
      categoryLabel: 'Assignment',
      detail: 'CS502 · Dr. Sneha Joshi',
      dueDate: '2026-11-02',
      actionUrl: '/portal/student/courses',
    });

    items.push({
      id: 'asg-toc-1',
      title: 'Problem Set 3: DFA Minimization Proofs',
      category: 'assignment',
      categoryLabel: 'Assignment',
      detail: 'CS504 · Dr. Anita Banerjee',
      dueDate: '2026-11-05',
      actionUrl: '/portal/student/courses',
    });

    // Quizzes from store
    quizzes.forEach((q) => {
      if (q.status === 'active' || q.status === 'upcoming') {
        items.push({
          id: `quiz-${q.id}`,
          title: q.title,
          category: 'quiz',
          categoryLabel: q.status === 'active' ? 'Active quiz' : 'Quiz',
          detail: `${q.subjectCode} · ${q.facultyName}`,
          dueDate: q.deadline || '2026-11-04',
          actionUrl:
            q.status === 'active'
              ? `/portal/student/quizzes/${q.id}`
              : '/portal/student/quizzes',
          isActive: q.status === 'active',
        });
      }
    });

    // Exams
    items.push({
      id: 'exam-cs501',
      title: 'Mid-Term Exam: Database Systems',
      category: 'exam',
      categoryLabel: 'Exam',
      detail: 'CS501 · Lecture Hall LT-2',
      dueDate: '2026-11-10',
      actionUrl: '/portal/student/results',
    });

    // Fee deadline
    if (pendingInvoice && pendingInvoice.status === 'PENDING') {
      items.push({
        id: `fee-${pendingInvoice.id}`,
        title: pendingInvoice.description,
        category: 'fee',
        categoryLabel: 'Fee deadline',
        detail: `₹${pendingInvoice.balanceAmount.toLocaleString('en-IN')} · Accounts Office`,
        dueDate: pendingInvoice.dueDate,
        actionUrl: '/portal/student/fees',
      });
    }

    return items.sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  }, [quizzes, pendingInvoice]);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  }, []);

  const studentFirstName = studentProfile.fullName.split(' ')[0] || studentProfile.fullName;

  // Error State
  if (hasError) {
    return (
      <div className="bg-paper border border-rule rounded-lg p-8 text-center max-w-lg mx-auto space-y-3">
        <div className="w-10 h-10 mx-auto rounded-full bg-red-50 dark:bg-red-950/40 text-danger flex items-center justify-center">
          <svg className="w-5 h-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-sm font-semibold text-ink">Unable to load portal records</h2>
        <p className="text-xs text-ink-muted">
          Could not connect to the academic schedule service. Please check your network and retry.
        </p>
        <button
          type="button"
          onClick={handleRetry}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
        >
          <span>Retry connection</span>
        </button>
      </div>
    );
  }

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading student portal">
        {/* Hero Banner Skeleton */}
        <div className="bg-paper border border-rule rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-28 bg-paper-3 rounded" />
              <div className="h-6 w-40 bg-paper-3 rounded" />
              <div className="h-3 w-56 bg-paper-3 rounded" />
            </div>
            <div className="h-8 w-24 bg-paper-3 rounded" />
          </div>
          <div className="pt-3 border-t border-rule flex items-center justify-between">
            <div className="h-4 w-64 bg-paper-3 rounded" />
            <div className="h-4 w-32 bg-paper-3 rounded" />
          </div>
        </div>

        {/* 3 Metric Cards Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-paper border border-rule rounded-lg p-4 space-y-2">
            <div className="h-3 w-28 bg-paper-3 rounded" />
            <div className="h-7 w-20 bg-paper-3 rounded" />
            <div className="h-3 w-44 bg-paper-3 rounded" />
          </div>
          <div className="bg-paper border border-rule rounded-lg p-4 space-y-2">
            <div className="h-3 w-28 bg-paper-3 rounded" />
            <div className="h-7 w-20 bg-paper-3 rounded" />
            <div className="h-3 w-44 bg-paper-3 rounded" />
          </div>
          <div className="bg-paper border border-rule rounded-lg p-4 space-y-2">
            <div className="h-3 w-28 bg-paper-3 rounded" />
            <div className="h-7 w-20 bg-paper-3 rounded" />
            <div className="h-3 w-44 bg-paper-3 rounded" />
          </div>
        </div>

        {/* Columns Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-paper border border-rule rounded-lg p-5 space-y-4">
              <div className="h-4 w-48 bg-paper-3 rounded" />
              <div className="space-y-3">
                <div className="h-14 bg-paper-2 rounded" />
                <div className="h-14 bg-paper-2 rounded" />
                <div className="h-14 bg-paper-2 rounded" />
              </div>
            </div>
            <div className="bg-paper border border-rule rounded-lg p-5 space-y-4">
              <div className="h-4 w-48 bg-paper-3 rounded" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="h-24 bg-paper-2 rounded" />
                <div className="h-24 bg-paper-2 rounded" />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-paper border border-rule rounded-lg p-5 space-y-4">
              <div className="h-4 w-40 bg-paper-3 rounded" />
              <div className="space-y-3">
                <div className="h-12 bg-paper-2 rounded" />
                <div className="h-12 bg-paper-2 rounded" />
                <div className="h-12 bg-paper-2 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="bg-paper border border-rule rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-success-soft text-success border border-emerald-200 dark:border-emerald-900/40">
                Enrollment active
              </span>
              <span className="text-xs text-ink-muted font-mono" title="Student enrollment number">
                {studentProfile.rollNo}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-semibold text-ink mt-1.5">
              Hi, {studentFirstName}
            </h1>
            <p className="text-xs text-ink-muted mt-0.5">
              {studentProfile.program}, Semester {studentProfile.semester} ({studentProfile.batch})
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Render quiz CTA only when active quizzes exist */}
            {activeQuizzes.length > 0 && (
              <Link
                href="/portal/student/quizzes"
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
              >
                <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="whitespace-nowrap tabular-nums">
                  Take active quiz ({activeQuizzes.length})
                </span>
              </Link>
            )}
            <Link
              href="/portal/student/profile"
              className="inline-flex items-center px-3 py-1.5 rounded-md border border-rule bg-paper hover:bg-paper-2 dark:bg-paper-2 text-ink text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              <span className="whitespace-nowrap">My profile</span>
            </Link>
          </div>
        </div>

        {/* Lead the hero with the next class: subject, room, and time remaining */}
        {nextSession ? (
          <div className="mt-4 pt-3.5 border-t border-rule flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-semibold text-xs px-2 py-0.5 rounded bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300">
                Next class
              </span>
              <span className="font-semibold text-ink">
                {nextSession.subjectName} ({nextSession.subjectCode})
              </span>
              <span className="text-ink-muted">·</span>
              <span className="text-ink-2">
                Room <strong className="text-ink font-medium">{nextSession.room}</strong>
              </span>
              <span className="text-ink-muted">·</span>
              <span className="text-brand-600 font-medium tabular-nums">
                {nextSessionTimeRemaining}
              </span>
            </div>
            <div className="text-ink-muted tabular-nums sm:text-right">
              {formatTimeRange(nextSession.startTime, nextSession.endTime)}
            </div>
          </div>
        ) : (
          <div className="mt-4 pt-3.5 border-t border-rule text-xs text-ink-muted">
            All classes completed for today · {todayIstFormatted}
          </div>
        )}
      </div>

      {/* 3 Metric Cards Grid (Active quizzes stat card removed) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Attendance Card */}
        <div className="bg-paper border border-rule rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs font-medium text-ink-muted">
              Overall attendance
            </div>
            <div className="text-2xl font-bold text-ink mt-1 tabular-nums">
              {attendanceData.percentage}%
            </div>
            <p className="text-xs text-ink-2 mt-1">
              {attendanceData.isCompliant
                ? `You can miss ${attendanceData.missable} more classes and stay above 75%.`
                : `Need to attend ${attendanceData.needed} consecutive classes to reach 75%.`}
            </p>
          </div>

          {attendanceData.deficitSubjects.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-rule text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-danger truncate">
                  Below 75%: {attendanceData.deficitSubjects.map((s) => `${s.code} (${s.attendancePercentage}%)`).join(', ')}
                </span>
                <Link
                  href="/portal/student/attendance"
                  className="text-brand-600 hover:underline font-semibold flex-shrink-0"
                >
                  View subjects
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* CGPA Card (No monospace styling) */}
        <div className="bg-paper border border-rule rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs font-medium text-ink-muted">
              Cumulative GPA
            </div>
            <div className="text-2xl font-bold text-ink mt-1 tabular-nums">
              {studentProfile.cgpa} <span className="text-xs text-ink-muted font-normal">/ 10</span>
            </div>
            <p className="text-xs text-ink-muted mt-1 tabular-nums">
              {studentProfile.creditsEarned} of {studentProfile.totalCredits} credits earned
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-rule text-xs flex items-center justify-between">
            <span className="text-ink-muted">Academic Standing:</span>
            <span className="text-success font-semibold">Exemplary (First Class)</span>
          </div>
        </div>

        {/* Fee Balance Card with Primary 'Pay now' Button */}
        <div className="bg-paper border border-rule rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs font-medium text-ink-muted">
              Fee balance
            </div>
            <div className="text-2xl font-bold text-ink mt-1 tabular-nums">
              ₹{feeData.balance.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-ink-2 mt-1">
              {feeData.dueText}
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-rule">
            {feeData.balance > 0 ? (
              <Link
                href="/portal/student/fees"
                className="w-full inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
              >
                Pay now
              </Link>
            ) : (
              <div className="text-xs text-success font-medium py-1">
                All semester dues cleared
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Two Columns: Today's Schedule & Enrolled Courses + Coming Up This Week */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Schedule & Courses */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule Panel: Single card, divided rows, no nested boxes */}
          <div className="bg-paper border border-rule rounded-lg overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-rule flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-ink">
                  Today&apos;s schedule
                </h2>
                <p className="text-xs text-ink-muted mt-0.5 tabular-nums">
                  {todayIstFormatted} · {sortedClasses.length} sessions scheduled
                </p>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-200 font-medium tabular-nums">
                {sortedClasses.filter((c) => !c.attendanceMarked).length} Upcoming
              </span>
            </div>

            {sortedClasses.length === 0 ? (
              <div className="py-8 text-center px-4">
                <div className="w-8 h-8 mx-auto rounded-full bg-paper-2 flex items-center justify-center text-ink-muted mb-2">
                  <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-ink">No lectures scheduled today</p>
                <p className="text-xs text-ink-muted mt-0.5">
                  There are no lecture or lab sessions scheduled for your batch today.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-rule">
                {sortedClasses.map((cls, idx) => {
                  const isCurrentOrNext = idx === highlightedIndex;
                  return (
                    <div
                      key={cls.id}
                      className={`px-4 sm:px-5 py-3.5 flex items-start justify-between gap-4 transition-colors ${
                        isCurrentOrNext
                          ? 'bg-brand-50/70 dark:bg-brand-950/40 border-l-2 border-brand-600'
                          : 'hover:bg-paper-2/60'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {isCurrentOrNext && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-600 text-white">
                              Next session
                            </span>
                          )}
                          {cls.attendanceMarked && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded bg-success-soft text-success">
                              Attended
                            </span>
                          )}
                          {!isCurrentOrNext && !cls.attendanceMarked && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded bg-paper-3 text-ink-2">
                              Upcoming
                            </span>
                          )}
                          <span className="text-xs font-semibold text-ink truncate">
                            {cls.subjectCode} · {cls.subjectName}
                          </span>
                          <span className="text-xs text-ink-muted">
                            ({cls.type})
                          </span>
                        </div>
                        <div className="text-xs text-ink-2 mt-1">
                          Room: <strong className="text-ink font-medium">{cls.room}</strong> · Faculty: {cls.facultyName}
                        </div>
                        <div className="text-xs text-ink-muted mt-0.5">
                          Topic: <span className="text-ink-2">{cls.topic}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-semibold text-ink tabular-nums">
                          {formatTimeRange(cls.startTime, cls.endTime)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Enrolled Courses Grid */}
          <div className="bg-paper border border-rule rounded-lg p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-ink">
                  Semester 5 Enrolled Courses
                </h2>
                <p className="text-xs text-ink-muted mt-0.5">
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
                      <span className="text-xs font-semibold text-brand-600">
                        {course.code}
                      </span>
                      <span className="text-xs text-ink-muted tabular-nums">
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
                        className={`font-semibold tabular-nums ${
                          isLow ? 'text-danger' : 'text-success'
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

        {/* Right 1 Col: Coming Up This Week & Faculty Mentor */}
        <div className="space-y-6">
          {/* Coming up this week Panel (Replaces Active assessments) */}
          <div className="bg-paper border border-rule rounded-lg overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-rule flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  Coming up this week
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Assignments, quizzes, exams, and fee deadlines
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-paper-2 text-ink-muted tabular-nums">
                {upcomingItems.length}
              </span>
            </div>

            {upcomingItems.length === 0 ? (
              <div className="py-8 text-center px-4">
                <div className="w-8 h-8 mx-auto rounded-full bg-paper-2 flex items-center justify-center text-ink-muted mb-2">
                  <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-ink">Nothing due this week</p>
                <p className="text-xs text-ink-muted mt-0.5">
                  All assignments, assessments, and fee deadlines are clear.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-rule">
                {upcomingItems.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 hover:bg-paper-2/50 transition-colors space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            item.category === 'quiz'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                              : item.category === 'exam'
                              ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'
                              : item.category === 'fee'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300'
                              : 'bg-paper-3 text-ink-2'
                          }`}
                        >
                          {item.categoryLabel}
                        </span>
                        <span className="text-xs font-medium text-ink-muted tabular-nums">
                          {formatDate(item.dueDate)}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-ink">
                        <Link href={item.actionUrl} className="hover:underline">
                          {item.title}
                        </Link>
                      </div>
                      <div className="text-xs text-ink-muted">
                        {item.detail}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-ink">
                  {studentProfile.advisorName}
                </div>
                <div className="text-xs text-ink-muted truncate">
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
