'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { usePortalStore, type RosterStudent } from '@/features/portals/portal-store';

/**
 * DESIGN BRIEF: Faculty Roll Call & Attendance Marker
 * - Who uses: Professors at lecture podium recording session attendance within a 2-minute window.
 * - Single most important thing: High-speed, keyboard/touch-friendly toggling between Present/Absent with 1-click bulk shortcuts and immediate real-time sync across Student, HOD, and Dean dashboards.
 * - Visual direction: Fast, dense attendance ledger with immediate tally counters and definitive save action.
 * - Palette: Slate (`#0F172A`, `#334155`, `#F8FAFC`), Emerald (`#059669` P), Crimson (`#DC2626` A), Blue (`#2563EB` OD).
 * - Spacing & radius: 4px/8px rhythm, rounded-lg and rounded-xl containers.
 */

function AttendanceMarkerContent() {
  const searchParams = useSearchParams();
  const queryClassId = searchParams.get('classId');

  const classes = usePortalStore((state) => state.classes);
  const studentRoster = usePortalStore((state) => state.studentRoster);
  const markClassAttendance = usePortalStore((state) => state.markClassAttendance);

  const [selectedClassId, setSelectedClassId] = useState<string>(
    queryClassId || classes[0]?.id || 'cls-501'
  );
  const [localRoster, setLocalRoster] = useState<RosterStudent[]>(studentRoster);
  const [topic, setTopic] = useState('');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  useEffect(() => {
    if (selectedClass) {
      setTopic(selectedClass.topic);
    }
  }, [selectedClass]);

  useEffect(() => {
    setLocalRoster(studentRoster);
  }, [studentRoster]);

  const handleSetStatus = (id: string, status: RosterStudent['status']) => {
    setLocalRoster((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  const handleMarkAll = (status: RosterStudent['status']) => {
    setLocalRoster((prev) => prev.map((item) => ({ ...item, status })));
  };

  const presentCount = localRoster.filter((r) => r.status === 'present').length;
  const absentCount = localRoster.filter((r) => r.status === 'absent').length;
  const dutyLeaveCount = localRoster.filter((r) => r.status === 'duty_leave').length;

  const handleSaveAttendance = () => {
    if (!selectedClass) return;
    setIsSaved(true);

    markClassAttendance(
      selectedClass.id,
      selectedClass.subjectCode,
      topic || selectedClass.topic,
      localRoster
    );

    setTimeout(() => {
      setIsSaved(false);
      setSuccessBanner(
        `Attendance recorded successfully for ${selectedClass.subjectCode} (${presentCount} Present, ${absentCount} Absent, ${dutyLeaveCount} Duty Leave). Student profile, HOD attendance audit, and Dean analytics updated in real-time!`
      );
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Session Context */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Link
                href="/portal/faculty"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Faculty Desk
              </Link>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-xs font-mono text-slate-500">
                {selectedClass?.date || 'Today'} · {selectedClass?.startTime} - {selectedClass?.endTime}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Mark Class Attendance: {selectedClass?.subjectCode} {selectedClass?.subjectName}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Batch: {selectedClass?.batch} · Room: {selectedClass?.room} · Type: {selectedClass?.type}
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleSaveAttendance}
              disabled={isSaved}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-[0.99]"
            >
              {isSaved ? 'Synchronizing Attendance...' : 'Save & Lock Attendance'}
            </button>
          </div>
        </div>

        {/* Class Selection & Topic Input Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-xs font-bold text-slate-500 whitespace-nowrap">
              Select Session:
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-slate-100 font-mono"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.subjectCode} - {cls.topic.slice(0, 32)}... ({cls.attendanceMarked ? '✓ Saved' : 'Pending'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 flex items-center space-x-2">
            <label className="text-xs font-bold text-slate-500 whitespace-nowrap">
              Topic Taught:
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
            />
          </div>
        </div>
      </div>

      {/* Success Synchronization Banner */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 text-xs space-y-2 shadow-sm">
          <div className="flex items-center justify-between font-bold">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-ping"></span>
              <span>Attendance Synchronized Across All Portals</span>
            </div>
            <button
              onClick={() => setSuccessBanner(null)}
              className="text-emerald-700 dark:text-emerald-300 hover:underline text-[11px]"
            >
              Dismiss
            </button>
          </div>
          <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
            {successBanner}
          </p>
          <div className="pt-1 flex items-center space-x-3 text-[11px] font-semibold">
            <Link href="/portal/student/attendance" className="underline text-brand-700 dark:text-brand-300">
              View Student Attendance Tracker &rarr;
            </Link>
            <span>·</span>
            <Link href="/portal/hod/attendance-audit" className="underline text-brand-700 dark:text-brand-300">
              View HOD Attendance Audit &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Tally Stats & Quick Bulk Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center space-x-6 text-xs">
          <div className="flex items-center space-x-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600 dark:text-slate-400">Present:</span>
            <strong className="font-mono text-emerald-600 dark:text-emerald-400 text-sm">{presentCount}</strong>
          </div>
          <div className="flex items-center space-x-2">
            <span className="h-3 w-3 rounded-full bg-rose-500"></span>
            <span className="text-slate-600 dark:text-slate-400">Absent:</span>
            <strong className="font-mono text-rose-600 dark:text-rose-400 text-sm">{absentCount}</strong>
          </div>
          <div className="flex items-center space-x-2">
            <span className="h-3 w-3 rounded-full bg-blue-500"></span>
            <span className="text-slate-600 dark:text-slate-400">Duty Leave:</span>
            <strong className="font-mono text-blue-600 dark:text-blue-400 text-sm">{dutyLeaveCount}</strong>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-medium">Quick Bulk:</span>
          <button
            type="button"
            onClick={() => handleMarkAll('present')}
            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
          >
            Mark All Present
          </button>
          <button
            type="button"
            onClick={() => handleMarkAll('absent')}
            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Roster Roll Call Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-500 font-semibold">
                <th className="px-4 py-3">Roll Number</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3 text-right">Live Attendance %</th>
                <th className="px-4 py-3 text-center">Status Selection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {localRoster.map((student) => {
                const isPriya = student.rollNo === '2023CSE042' || student.name.includes('Priya');
                return (
                  <tr
                    key={student.id}
                    className={`transition-colors ${
                      isPriya
                        ? 'bg-brand-50/50 dark:bg-brand-950/20 font-semibold'
                        : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center space-x-1.5">
                        <span>{student.rollNo}</span>
                        {isPriya && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-brand-600 text-white font-normal uppercase">
                            Active Student
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                      {student.name}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold">
                      <span
                        className={
                          student.currentAttendance >= 75
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }
                      >
                        {student.currentAttendance}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleSetStatus(student.id, 'present')}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                            student.status === 'present'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          Present (P)
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSetStatus(student.id, 'absent')}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                            student.status === 'absent'
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          Absent (A)
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSetStatus(student.id, 'duty_leave')}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                            student.status === 'duty_leave'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          Duty Leave (OD)
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function FacultyAttendanceMarkerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-400">Loading Attendance Register...</div>}>
      <AttendanceMarkerContent />
    </Suspense>
  );
}
