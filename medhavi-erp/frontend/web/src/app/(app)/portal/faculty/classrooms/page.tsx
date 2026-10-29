'use client';

/**
 * DESIGN BRIEF: Faculty Classrooms Command Directory
 * - Who uses: University professors & instructors needing instant access to their assigned teaching batches.
 * - Single most important thing: Quickly choose an assigned course classroom to mark attendance, assign today's class, publish quizzes, or share resources.
 * - Visual direction: Dense, structured academic dossier with clear capability tags and high-contrast primary entry CTAs.
 * - Tokens: Paper surface, slate rule borders, brand ink (#1E40AF), emerald (#059669), tabular numerals.
 * - Responsive: Flexible 1-to-2 column grid adapting seamlessly from 360px mobile to 1440px desktop.
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePortalStore } from '@/features/portals/portal-store';

export default function FacultyClassroomsPage() {
  const courses = usePortalStore((state) => state.courses);
  const classes = usePortalStore((state) => state.classes);
  const quizzes = usePortalStore((state) => state.quizzes);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'LECTURE' | 'LAB'>('ALL');

  // Augment courses with live session and batch data
  const classrooms = useMemo(() => {
    return courses.map((course) => {
      const todaySession = classes.find(
        (cls) => cls.subjectCode === course.code || cls.subjectName.toLowerCase() === course.name.toLowerCase()
      );

      const courseQuizzes = quizzes.filter(
        (q) => q.subjectCode === course.code || q.subjectName.toLowerCase() === course.name.toLowerCase()
      );

      const isLab = course.name.toLowerCase().includes('lab') || course.code === 'CS505';

      return {
        ...course,
        batch: course.code === 'CS505'
          ? 'B.Tech CSE Sem 5 (Batch A1)'
          : course.code === 'CS702'
          ? 'B.Tech CSE Sem 7 (Sec B)'
          : 'B.Tech CSE Sem 5 (Sec A)',
        studentsCount: course.code === 'CS505' ? 32 : course.code === 'CS702' ? 52 : 64,
        type: isLab ? ('LAB' as const) : ('LECTURE' as const),
        todaySession: todaySession || {
          topic: `${course.name} Curriculum Lecture`,
          startTime: course.schedule.split(' ').slice(-4, -2).join(' ') || '11:30 AM',
          status: 'scheduled' as const,
          attendanceMarked: false,
        },
        quizzesCount: courseQuizzes.length,
        resourcesCount: course.modules.reduce((acc, m) => acc + m.resources.length, 0),
      };
    });
  }, [courses, classes, quizzes]);

  const filteredClassrooms = useMemo(() => {
    return classrooms.filter((cls) => {
      if (filterType !== 'ALL' && cls.type !== filterType) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchCode = cls.code.toLowerCase().includes(query);
        const matchName = cls.name.toLowerCase().includes(query);
        const matchRoom = cls.room.toLowerCase().includes(query);
        const matchBatch = cls.batch.toLowerCase().includes(query);
        if (!matchCode && !matchName && !matchRoom && !matchBatch) return false;
      }
      return true;
    });
  }, [classrooms, filterType, searchQuery]);

  const totalStudents = classrooms.reduce((acc, c) => acc + c.studentsCount, 0);
  const totalQuizzes = classrooms.reduce((acc, c) => acc + c.quizzesCount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-paper border border-rule rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Link
                href="/portal/faculty"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Faculty Desk
              </Link>
              <span className="text-ink-muted">/</span>
              <span className="text-xs font-medium text-ink-muted">
                Autumn 2025-26 Session
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink mt-1">
              My Assigned Classrooms
            </h1>
            <p className="text-xs text-ink-muted mt-0.5">
              Enter any assigned classroom to conduct today's session, mark student attendance, publish quizzes, and distribute lecture resources.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/portal/faculty/attendance"
              className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg border border-rule bg-paper hover:bg-paper-2 text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              Daily Attendance Register
            </Link>
            <Link
              href="/portal/faculty/quizzes"
              className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              + Create New Quiz
            </Link>
          </div>
        </div>
      </div>

      {/* Global Classrooms KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-paper border border-rule rounded-xl p-4">
          <div className="text-xs font-semibold text-ink-muted normal-case">
            Assigned Courses
          </div>
          <div className="text-2xl font-bold tabular-nums text-ink mt-1">
            {classrooms.length} <span className="text-xs font-normal text-ink-muted">Classrooms</span>
          </div>
          <div className="text-[11px] text-brand-600 font-medium mt-1">
            Active Teaching Load
          </div>
        </div>

        <div className="bg-paper border border-rule rounded-xl p-4">
          <div className="text-xs font-semibold text-ink-muted normal-case">
            Enrolled Students
          </div>
          <div className="text-2xl font-bold tabular-nums text-ink mt-1">
            {totalStudents} <span className="text-xs font-normal text-ink-muted">Scholars</span>
          </div>
          <div className="text-[11px] text-ink-muted font-medium mt-1">
            Across B.Tech CSE Cohorts
          </div>
        </div>

        <div className="bg-paper border border-rule rounded-xl p-4">
          <div className="text-xs font-semibold text-ink-muted normal-case">
            Active Quizzes
          </div>
          <div className="text-2xl font-bold tabular-nums text-brand-600 mt-1">
            {totalQuizzes} <span className="text-xs font-normal text-ink-muted">Published</span>
          </div>
          <div className="text-[11px] text-success font-medium mt-1">
            Continuous Assessment Live
          </div>
        </div>

        <div className="bg-paper border border-rule rounded-xl p-4">
          <div className="text-xs font-semibold text-ink-muted normal-case">
            Average Attendance Rate
          </div>
          <div className="text-2xl font-bold tabular-nums text-success mt-1">
            85.6%
          </div>
          <div className="text-[11px] text-success font-medium mt-1">
            Above 75% Regulatory Norm
          </div>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-paper border border-rule rounded-xl p-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-ink-muted normal-case px-1">
            Type:
          </span>
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
              filterType === 'ALL'
                ? 'bg-brand-600 text-white font-semibold'
                : 'bg-paper-2 text-ink hover:bg-paper-3'
            }`}
          >
            All Classrooms ({classrooms.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('LECTURE')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
              filterType === 'LECTURE'
                ? 'bg-brand-600 text-white font-semibold'
                : 'bg-paper-2 text-ink hover:bg-paper-3'
            }`}
          >
            Theory Lectures
          </button>
          <button
            type="button"
            onClick={() => setFilterType('LAB')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
              filterType === 'LAB'
                ? 'bg-brand-600 text-white font-semibold'
                : 'bg-paper-2 text-ink hover:bg-paper-3'
            }`}
          >
            Practical Labs
          </button>
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by code, title, batch, or room..."
            className="w-full h-9 px-3 text-xs rounded-lg border border-rule bg-paper text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
        </div>
      </div>

      {/* Classrooms Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredClassrooms.map((cls) => {
          const syllabusPct = Math.round((cls.modulesCompleted / cls.totalModules) * 100);

          return (
            <div
              key={cls.id}
              className="bg-paper border border-rule rounded-xl p-5 shadow-sm hover:border-brand-600/50 transition-colors flex flex-col justify-between space-y-4"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-900/60">
                        {cls.code}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-paper-2 text-ink-muted font-medium">
                        {cls.credits} Credits
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-paper-2 text-ink-muted font-medium">
                        {cls.type === 'LAB' ? 'Practical Lab' : 'Theory Lecture'}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-ink tracking-tight mt-1">
                      {cls.name}
                    </h2>
                    <p className="text-xs text-ink-muted font-medium">
                      {cls.batch} · <span className="font-semibold text-ink">{cls.studentsCount} Students</span>
                    </p>
                  </div>

                  <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 flex-shrink-0">
                    {cls.attendancePercentage}% Attendance
                  </span>
                </div>

                {/* Classroom Schedule & Room */}
                <div className="mt-4 p-3 rounded-lg bg-paper-2 border border-rule flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-ink-muted block text-[11px]">Room Allocation</span>
                    <span className="font-semibold text-ink">{cls.room}</span>
                  </div>
                  <div>
                    <span className="text-ink-muted block text-[11px]">Assigned Slot</span>
                    <span className="font-semibold text-ink">{cls.schedule}</span>
                  </div>
                  <div>
                    <span className="text-ink-muted block text-[11px]">Today's Session</span>
                    <span className="font-semibold text-brand-600">
                      {cls.todaySession.attendanceMarked ? 'Conducted' : 'Ready to Start'}
                    </span>
                  </div>
                </div>

                {/* Syllabus Progress */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink-muted font-medium">Syllabus Coverage</span>
                    <span className="font-mono font-bold text-ink tabular-nums">
                      {cls.modulesCompleted} / {cls.totalModules} Units ({syllabusPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-paper-2 overflow-hidden border border-rule">
                    <div
                      className="h-full bg-brand-600 rounded-full"
                      style={{ width: `${syllabusPct}%` }}
                    />
                  </div>
                </div>

                {/* Capability Badges Strip */}
                <div className="mt-4 pt-3 border-t border-rule grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded bg-paper-2">
                    <span className="text-[11px] text-ink-muted block">Quizzes</span>
                    <span className="font-bold text-ink tabular-nums">{cls.quizzesCount} Live</span>
                  </div>
                  <div className="p-2 rounded bg-paper-2">
                    <span className="text-[11px] text-ink-muted block">Materials</span>
                    <span className="font-bold text-ink tabular-nums">{cls.resourcesCount} Files</span>
                  </div>
                  <div className="p-2 rounded bg-paper-2">
                    <span className="text-[11px] text-ink-muted block">Conducted</span>
                    <span className="font-bold text-ink tabular-nums">{cls.totalClasses} Lectures</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-2 flex items-center justify-between gap-2">
                <Link
                  href={`/portal/faculty/classrooms/${cls.id}`}
                  className="flex-1 text-center py-2.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                >
                  Enter Classroom
                </Link>
                <Link
                  href={`/portal/faculty/classrooms/${cls.id}?tab=attendance`}
                  className="py-2.5 px-3 rounded-lg border border-rule bg-paper hover:bg-paper-2 text-ink text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 whitespace-nowrap"
                >
                  Attendance
                </Link>
                <Link
                  href={`/portal/faculty/classrooms/${cls.id}?tab=quizzes`}
                  className="py-2.5 px-3 rounded-lg border border-rule bg-paper hover:bg-paper-2 text-ink text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 whitespace-nowrap"
                >
                  + Quiz
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {filteredClassrooms.length === 0 && (
        <div className="text-center py-12 bg-paper border border-rule rounded-xl p-8">
          <p className="text-sm font-semibold text-ink">No assigned classrooms matched your query.</p>
          <p className="text-xs text-ink-muted mt-1">Try resetting your search filter or view all classrooms.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setFilterType('ALL');
            }}
            className="mt-3 px-4 py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold shadow-sm hover:bg-brand-700"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
