'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePortalStore } from '@/features/portals/portal-store';
import { useAuthStore } from '@/shared/stores/auth-store';

/**
 * DESIGN BRIEF: Faculty Schedule & Instructor Overview
 * - Who uses: University professors and teaching faculty managing daily lectures, labs, and evaluations.
 * - Single most important thing: Imminent lecture details, direct 1-click action to mark attendance, create classes, and pending grading count.
 * - Visual direction: Dense, practical instructor dashboard with clear schedule chronology and grading priorities.
 * - Palette: Slate (`#0F172A`, `#334155`, `#F8FAFC`), Brand Ink (`#2563EB`), Emerald (`#059669`), Amber (`#D97706`).
 * - Spacing & radius: 4px/8px rhythm, rounded-xl containers with subtle 1px border.
 */

export default function FacultyDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const classes = usePortalStore((state) => state.classes);
  const addClass = usePortalStore((state) => state.addClass);
  const quizSubmissions = usePortalStore((state) => state.quizSubmissions);

  const [showClassModal, setShowClassModal] = useState(false);
  const [subjectCode, setSubjectCode] = useState('CS501');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState('2026-10-28');
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                Faculty Workspace
              </span>
              <span className="text-xs text-slate-500 font-mono">
                EMP-CSE-014 · Department of CSE
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Welcome, {user?.displayName || 'Dr. Arun Sharma'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Associate Professor · Medhavi Skills University Academic Console
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowClassModal(true)}
              className="px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
            >
              + Schedule Class
            </button>
            <Link
              href="/portal/faculty/attendance"
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-[0.99]"
            >
              Mark Attendance
            </Link>
            <Link
              href="/portal/faculty/quizzes"
              className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
            >
              Quizzes &amp; Tests
            </Link>
          </div>
        </div>
      </div>

      {successBanner && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-sm">
          <span>{successBanner}</span>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-600 dark:text-emerald-400 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400">
            Teaching Workload
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            14 <span className="text-xs text-slate-400 font-normal">hrs / week</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
            Optimal (AICTE norm: 14-16 hrs)
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400">
            Active Classes &amp; Labs
          </div>
          <div className="text-2xl font-bold font-mono text-brand-600 dark:text-brand-400 mt-1">
            {classes.length} Sessions
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {classes.filter((c) => !c.attendanceMarked).length} pending attendance
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400">
            Quiz Submissions Received
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {quizSubmissions.length} Submissions
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across active department tests
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

      {/* Main Grid: Teaching Schedule & Assigned Subjects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Assigned Classes &amp; Labs ({classes.length})
                </h2>
                <p className="text-xs text-slate-500">Autumn Session Schedule · Synchronized to Student Timetable</p>
              </div>
              <button
                type="button"
                onClick={() => setShowClassModal(true)}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
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
                    className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      isPending
                        ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${
                            isPending
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {isPending ? 'Active Pending' : 'Completed'}
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {cls.subjectCode}, {cls.subjectName} ({cls.type})
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Batch: <strong className="text-slate-800 dark:text-slate-200">{cls.batch}</strong>, Room: {cls.room}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Topic: <strong className="text-slate-700 dark:text-slate-300">{cls.topic}</strong>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                      <div className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                        {cls.startTime} - {cls.endTime}
                      </div>
                      {isPending ? (
                        <Link
                          href={`/portal/faculty/attendance?classId=${cls.id}&subjectCode=${cls.subjectCode}`}
                          className="mt-1 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-[0.99]"
                        >
                          Mark Roll Call
                        </Link>
                      ) : (
                        <span className="mt-1 text-[11px] text-slate-400 font-medium">
                          Attendance Locked
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
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
                  <span className="text-[11px] text-slate-500 font-mono">2 Credits, 32 Stds</span>
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

      {/* Schedule Class Modal */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Schedule New Class Session
                </h3>
                <p className="text-xs text-slate-500">
                  This class will immediately appear in Student, HOD, and Dean timetables.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowClassModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Subject Code
                  </label>
                  <select
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                  >
                    <option value="CS501">CS501 - Database Management Systems</option>
                    <option value="CS505">CS505 - Database Systems Lab</option>
                    <option value="CS502">CS502 - Operating Systems</option>
                    <option value="CS702">CS702 - Cloud Architecture</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Session Type
                  </label>
                  <select
                    value={classType}
                    onChange={(e) => setClassType(e.target.value as 'Lecture' | 'Lab' | 'Tutorial')}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Lab">Practical Lab</option>
                    <option value="Tutorial">Tutorial / Problem Solving</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Class Topic / Syllabus Module
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Query Optimization, B-Tree Indexing & Execution Plans"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Room / Lab
                  </label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Student Batch
                  </label>
                  <input
                    type="text"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
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
