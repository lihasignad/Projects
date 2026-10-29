'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePortalStore } from '@/features/portals/portal-store';
import { useAuthStore } from '@/shared/stores/auth-store';

export default function FacultyDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const classes = usePortalStore((state) => state.classes);
  const addClass = usePortalStore((state) => state.addClass);
  const quizSubmissions = usePortalStore((state) => state.quizSubmissions);

  const [showClassModal, setShowClassModal] = useState(false);
  const [subjectCode, setSubjectCode] = useState('CS501');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0] ?? '2026-10-29');
  const [startTime, setStartTime] = useState('11:30 AM');
  const [endTime, setEndTime] = useState('12:30 PM');
  const [room, setRoom] = useState('Lecture Hall LT-2');
  const [classType, setClassType] = useState<'Lecture' | 'Lab' | 'Tutorial'>('Lecture');
  const [batch, setBatch] = useState('B.Tech CSE Sem 5 Sec A (64 Students)');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const subjectNames: Record<string, string> = {
    CS501: 'Database Management Systems',
    CS505: 'Database Systems Practical Lab',
    CS502: 'Operating Systems',
    CS702: 'Cloud Infrastructure Architecture',
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    const created = addClass({
      subjectCode,
      subjectName: subjectNames[subjectCode] || 'Advanced Computer Science',
      facultyName: user?.displayName || 'Dr. Arun Sharma',
      facultyId: user?.id || 'fac-101',
      batch,
      room,
      date,
      startTime,
      endTime,
      topic,
      type: classType,
      studentsCount: 64,
    });

    setShowClassModal(false);
    setTopic('');
    setSuccessBanner(`Class "${created.subjectCode}: ${created.topic}" scheduled successfully! Synced across Student, HOD, and Dean dashboards.`);
    setTimeout(() => setSuccessBanner(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-paper border border-rule rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                Faculty workspace
              </span>
              <span className="text-xs text-ink-muted">
                EMP-CSE-014, Department of CSE
              </span>
            </div>
            <h1 className="text-xl font-bold text-ink mt-1.5">
              Welcome, {user?.displayName || 'Dr. Arun Sharma'}
            </h1>
            <p className="text-xs text-ink-muted mt-0.5">
              Associate Professor, Demo University Academic Console
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/portal/faculty/classrooms"
              className="px-4 py-2 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 whitespace-nowrap"
            >
              My Classrooms
            </Link>
            <button
              type="button"
              onClick={() => setShowClassModal(true)}
              className="px-3.5 py-2 rounded-md border border-rule bg-paper hover:bg-paper-2 text-ink text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 whitespace-nowrap"
            >
              + Schedule Class
            </button>
            <Link
              href="/portal/faculty/attendance"
              className="px-4 py-2 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 whitespace-nowrap"
            >
              Mark Attendance
            </Link>
            <Link
              href="/portal/faculty/quizzes"
              className="px-3.5 py-2 rounded-md border border-rule bg-paper hover:bg-paper-2 dark:bg-paper-2 text-ink text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 whitespace-nowrap hidden sm:inline-block"
            >
              Quizzes &amp; Tests
            </Link>
          </div>
        </div>
      </div>

      {successBanner && (
        <div className="p-3.5 rounded-lg bg-success-soft dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 dark:border-emerald-900/40 text-success text-xs font-medium flex items-center justify-between">
          <span>{successBanner}</span>
          <button onClick={() => setSuccessBanner(null)} className="text-success hover:underline font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-paper border border-rule rounded-lg p-4">
          <div className="text-xs font-medium text-ink-muted">
            Teaching workload
          </div>
          <div className="text-2xl font-bold tabular-nums text-ink mt-1">
            14 <span className="text-xs text-ink-muted font-normal">hrs / week</span>
          </div>
          <div className="text-xs text-success mt-1 font-semibold">
            Optimal (AICTE norm: 14-16 hrs)
          </div>
        </div>

        <div className="bg-paper border border-rule rounded-lg p-4">
          <div className="text-xs font-medium text-ink-muted">
            Active classes &amp; labs
          </div>
          <div className="text-2xl font-bold tabular-nums text-brand-600 mt-1">
            {classes.length} Sessions
          </div>
          <div className="text-xs text-ink-muted mt-1">
            {classes.filter((c) => !c.attendanceMarked).length} pending attendance
          </div>
        </div>

        <div className="bg-paper border border-rule rounded-lg p-4">
          <div className="text-xs font-medium text-ink-muted">
            Quiz submissions received
          </div>
          <div className="text-2xl font-bold tabular-nums text-warning mt-1">
            {quizSubmissions.length} Submissions
          </div>
          <div className="text-xs text-ink-muted mt-1">
            Across active department tests
          </div>
        </div>

        <div className="bg-paper border border-rule rounded-lg p-4">
          <div className="text-xs font-medium text-ink-muted">
            Mentees / Advisees
          </div>
          <div className="text-2xl font-bold tabular-nums text-ink mt-1">
            24 Students
          </div>
          <div className="text-xs text-ink-muted mt-1">
            B.Tech CSE 2023-27 batch
          </div>
        </div>
      </div>

      {/* Main Grid: Teaching Schedule & Assigned Subjects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-paper border border-rule rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-ink">
                  Assigned Classes &amp; Labs ({classes.length})
                </h2>
                <p className="text-xs text-ink-muted">
                  Autumn session schedule, synchronized to student timetable
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowClassModal(true)}
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                + Add Session
              </button>
            </div>

            <div className="space-y-3">
              {classes.map((cls) => {
                const isPending = !cls.attendanceMarked;
                return (
                  <div
                    key={cls.id}
                    className={`p-4 rounded-md border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      isPending
                        ? 'border-emerald-200 dark:border-emerald-900/40 bg-success-soft/60 dark:bg-emerald-950/40'
                        : 'border-rule bg-paper'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            isPending
                              ? 'bg-emerald-700 text-white'
                              : 'bg-paper-3 text-ink-2'
                          }`}
                        >
                          {isPending ? 'Active Pending' : 'Completed'}
                        </span>
                        <span className="text-sm font-semibold text-ink">
                          {cls.subjectCode}, {cls.subjectName} ({cls.type})
                        </span>
                      </div>
                      <div className="text-xs text-ink-2 mt-1">
                        Batch: <strong className="text-ink">{cls.batch}</strong>, Room: {cls.room}
                      </div>
                      <div className="text-xs text-ink-muted mt-0.5">
                        Topic: <strong className="text-ink-2">{cls.topic}</strong>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5">
                      <div className="tabular-nums text-xs font-bold text-ink">
                        {cls.startTime} - {cls.endTime}
                      </div>
                      <div className="flex items-center space-x-1.5 mt-1">
                        <Link
                          href={`/portal/faculty/classrooms/course-${cls.subjectCode.toLowerCase()}`}
                          className="px-2.5 py-1 rounded border border-rule bg-paper hover:bg-paper-2 text-ink text-xs font-medium transition-colors whitespace-nowrap"
                        >
                          Classroom
                        </Link>
                        {isPending ? (
                          <Link
                            href={`/portal/faculty/attendance?classId=${cls.id}&subjectCode=${cls.subjectCode}`}
                            className="px-3 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 whitespace-nowrap"
                          >
                            Roll Call
                          </Link>
                        ) : (
                          <span className="text-xs text-ink-muted font-medium">
                            Locked
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Assigned Courses & Quick Links */}
        <div className="space-y-6">
          <div className="bg-paper border border-rule rounded-lg p-5 space-y-4">
            <h3 className="text-xs font-semibold text-ink-muted normal-case">
              Assigned subjects this semester
            </h3>
            <div className="space-y-3">
              <Link
                href="/portal/faculty/classrooms/course-cs501"
                className="block p-3 rounded-md border border-rule bg-paper hover:border-brand-600/50 transition-colors dark:bg-paper-2"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-brand-600">CS501</span>
                  <span className="text-xs text-ink-muted">4 Credits, 64 Students</span>
                </div>
                <div className="text-xs font-semibold text-ink mt-1">
                  Database Management Systems
                </div>
                <div className="text-xs text-ink-muted mt-0.5 flex items-center justify-between">
                  <span>Syllabus: 68% Completed</span>
                  <span className="text-brand-600 font-semibold text-[11px]">Enter &rarr;</span>
                </div>
              </Link>

              <Link
                href="/portal/faculty/classrooms/course-cs502"
                className="block p-3 rounded-md border border-rule bg-paper hover:border-brand-600/50 transition-colors dark:bg-paper-2"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-brand-600">CS502</span>
                  <span className="text-xs text-ink-muted">4 Credits, 60 Students</span>
                </div>
                <div className="text-xs font-semibold text-ink mt-1">
                  Operating Systems
                </div>
                <div className="text-xs text-ink-muted mt-0.5 flex items-center justify-between">
                  <span>Syllabus: 40% Completed</span>
                  <span className="text-brand-600 font-semibold text-[11px]">Enter &rarr;</span>
                </div>
              </Link>

              <Link
                href="/portal/faculty/classrooms/course-cs505"
                className="block p-3 rounded-md border border-rule bg-paper hover:border-brand-600/50 transition-colors dark:bg-paper-2"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-brand-600">CS505</span>
                  <span className="text-xs text-ink-muted">2 Credits, 32 Students</span>
                </div>
                <div className="text-xs font-semibold text-ink mt-1">
                  Database Systems Lab
                </div>
                <div className="text-xs text-ink-muted mt-0.5 flex items-center justify-between">
                  <span>Experiments: 7 of 10 Completed</span>
                  <span className="text-brand-600 font-semibold text-[11px]">Enter &rarr;</span>
                </div>
              </Link>

              <Link
                href="/portal/faculty/classrooms"
                className="block text-center py-2 text-xs font-semibold text-brand-600 hover:underline pt-1"
              >
                View All Assigned Classrooms
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Class Modal */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40" role="dialog" aria-modal="true">
          <div className="bg-paper rounded-lg max-w-lg w-full p-6 shadow-2xl border border-rule space-y-4">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <div>
                <h3 className="text-base font-bold text-ink">
                  Schedule New Class Session
                </h3>
                <p className="text-xs text-ink-muted">
                  This class will immediately appear in Student, HOD, and Dean timetables.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowClassModal(false)}
                className="text-ink-muted hover:text-ink p-1"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-ink mb-1">
                    Subject Code
                  </label>
                  <select
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="w-full p-2.5 rounded-md border border-rule bg-paper text-ink font-mono"
                  >
                    <option value="CS501">CS501 - Database Management Systems</option>
                    <option value="CS505">CS505 - Database Systems Lab</option>
                    <option value="CS502">CS502 - Operating Systems</option>
                    <option value="CS702">CS702 - Cloud Architecture</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-ink mb-1">
                    Session Type
                  </label>
                  <select
                    value={classType}
                    onChange={(e) => setClassType(e.target.value as 'Lecture' | 'Lab' | 'Tutorial')}
                    className="w-full p-2.5 rounded-md border border-rule bg-paper text-ink"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Lab">Practical Lab</option>
                    <option value="Tutorial">Tutorial / Problem Solving</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">
                  Class Topic / Syllabus Module
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Query Optimization, B-Tree Indexing & Execution Plans"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-rule bg-paper text-ink"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-ink mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 rounded-md border border-rule bg-paper text-ink tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-medium text-ink mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2 rounded-md border border-rule bg-paper text-ink tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-medium text-ink mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-2 rounded-md border border-rule bg-paper text-ink tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-ink mb-1">
                    Assigned Room / Lab
                  </label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full p-2.5 rounded-md border border-rule bg-paper text-ink"
                  />
                </div>
                <div>
                  <label className="block font-medium text-ink mb-1">
                    Student Batch
                  </label>
                  <input
                    type="text"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className="w-full p-2.5 rounded-md border border-rule bg-paper text-ink"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-rule">
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  className="px-4 py-2 rounded-md border border-rule text-ink hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 whitespace-nowrap"
                >
                  Confirm &amp; Publish Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
