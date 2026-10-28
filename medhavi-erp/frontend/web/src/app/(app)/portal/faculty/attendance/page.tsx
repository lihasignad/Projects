'use client';

import { useState } from 'react';
import Link from 'next/link';

interface StudentRosterItem {
  id: string;
  rollNo: string;
  name: string;
  currentAttendance: number;
  status: 'present' | 'absent' | 'late' | 'duty_leave';
}

const INITIAL_ROSTER: StudentRosterItem[] = [
  { id: '1', rollNo: '2023CSE001', name: 'Aarav Singhania', currentAttendance: 68.4, status: 'duty_leave' },
  { id: '2', rollNo: '2023CSE002', name: 'Aakash Verma', currentAttendance: 85.2, status: 'present' },
  { id: '3', rollNo: '2023CSE003', name: 'Ananya Deshmukh', currentAttendance: 92.0, status: 'present' },
  { id: '4', rollNo: '2023CSE004', name: 'Ayush Patel', currentAttendance: 76.5, status: 'present' },
  { id: '5', rollNo: '2023CSE011', name: 'Bhavya Nair', currentAttendance: 88.0, status: 'present' },
  { id: '6', rollNo: '2023CSE018', name: 'Devendra Joshi', currentAttendance: 71.0, status: 'absent' },
  { id: '7', rollNo: '2023CSE024', name: 'Ishaan Mukhopadhyay', currentAttendance: 94.1, status: 'present' },
  { id: '8', rollNo: '2023CSE035', name: 'Manish Chhetri', currentAttendance: 82.3, status: 'present' },
  { id: '9', rollNo: '2023CSE042', name: 'Priya Sharma', currentAttendance: 88.2, status: 'present' },
  { id: '10', rollNo: '2023CSE048', name: 'Rohan Kulkarni', currentAttendance: 69.8, status: 'absent' },
  { id: '11', rollNo: '2023CSE055', name: 'Siddharth Roy', currentAttendance: 81.4, status: 'present' },
  { id: '12', rollNo: '2023CSE062', name: 'Tanvi Agarwal', currentAttendance: 90.6, status: 'present' },
];

/**
 * DESIGN BRIEF: Faculty Roll Call & Attendance Marker
 * - Who uses: Professors at lecture podium recording session attendance within a 2-minute window.
 * - Single most important thing: High-speed, keyboard/touch-friendly toggling between Present/Absent with 1-click bulk shortcuts.
 * - Visual direction: Fast, dense attendance ledger with immediate tally counters and definitive save action.
 * - Palette: Slate (`#0F172A`, `#334155`, `#F8FAFC`), Emerald (`#059669` P), Crimson (`#DC2626` A), Amber (`#D97706` L).
 * - Spacing & radius: 4px/8px rhythm, rounded-lg and rounded-xl containers.
 */

export default function FacultyAttendanceMarkerPage() {
  const [roster, setRoster] = useState<StudentRosterItem[]>(INITIAL_ROSTER);
  const [topic, setTopic] = useState('BCNF Decomposition & Lossless Join Property');
  const [isSaved, setIsSaved] = useState(false);

  const handleSetStatus = (id: string, status: StudentRosterItem['status']) => {
    setRoster((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  const handleMarkAll = (status: StudentRosterItem['status']) => {
    setRoster((prev) => prev.map((item) => ({ ...item, status })));
  };

  const presentCount = roster.filter((r) => r.status === 'present').length;
  const absentCount = roster.filter((r) => r.status === 'absent').length;
  const dutyLeaveCount = roster.filter((r) => r.status === 'duty_leave').length;

  const handleSaveAttendance = () => {
    setIsSaved(true);
    setTimeout(() => {
      alert(`Attendance recorded successfully for CS501 (${presentCount} Present, ${absentCount} Absent). Synced to Student Portals.`);
      setIsSaved(false);
    }, 1000);
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
                Wednesday, 28 Oct 2026, 11:30 AM
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Mark Class Attendance: CS501 DBMS
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Batch: B.Tech CSE Semester 5 (Section A), Room: Lecture Hall LT-2
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleSaveAttendance}
              disabled={isSaved}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
            >
              {isSaved ? 'Saving Record...' : 'Save & Lock Attendance'}
            </button>
          </div>
        </div>

        {/* Topic Input Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-xs font-bold text-slate-500 font-medium whitespace-nowrap">
            Topic Taught Today:
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
          />
        </div>
      </div>

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
                <th className="px-4 py-3 text-right">Historical %</th>
                <th className="px-4 py-3 text-center">Status Selection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {roster.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                    {student.rollNo}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
