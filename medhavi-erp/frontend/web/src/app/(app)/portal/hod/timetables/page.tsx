'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePortalStore } from '@/features/portals/portal-store';

interface TimetableSlot {
  day: string;
  time: string;
  courseCode: string;
  courseName: string;
  batch: string;
  room: string;
  faculty: string;
  isLiveSession?: boolean;
}

const BASE_CSE_SLOTS: TimetableSlot[] = [
  { day: 'Monday', time: '09:30 - 10:30', courseCode: 'CS502', courseName: 'Operating Systems', batch: 'CSE-5A', room: 'LT-4', faculty: 'Dr. Sneha Joshi' },
  { day: 'Monday', time: '11:30 - 12:30', courseCode: 'CS501', courseName: 'Database Systems', batch: 'CSE-5A', room: 'LT-2', faculty: 'Dr. Arun Sharma' },
  { day: 'Monday', time: '02:00 - 04:00', courseCode: 'CS505', courseName: 'DBMS Lab (Batch 1)', batch: 'CSE-5A', room: 'Lab 3', faculty: 'Dr. Arun Sharma' },
  { day: 'Tuesday', time: '09:30 - 10:30', courseCode: 'CS503', courseName: 'Computer Networks', batch: 'CSE-5A', room: 'SC-1', faculty: 'Prof. Ramanathan' },
  { day: 'Tuesday', time: '11:30 - 12:30', courseCode: 'CS504', courseName: 'Automata Theory', batch: 'CSE-5A', room: 'Sem Hall B', faculty: 'Dr. Anita Banerjee' },
  { day: 'Wednesday', time: '11:30 - 12:30', courseCode: 'CS501', courseName: 'Database Systems', batch: 'CSE-5A', room: 'LT-2', faculty: 'Dr. Arun Sharma' },
  { day: 'Wednesday', time: '02:00 - 04:00', courseCode: 'CS506', courseName: 'OS Lab (Batch 2)', batch: 'CSE-5A', room: 'Lab 2', faculty: 'Dr. Sneha Joshi' },
  { day: 'Thursday', time: '09:30 - 10:30', courseCode: 'CS502', courseName: 'Operating Systems', batch: 'CSE-5A', room: 'LT-4', faculty: 'Dr. Sneha Joshi' },
  { day: 'Friday', time: '11:30 - 12:30', courseCode: 'CS501', courseName: 'Database Systems', batch: 'CSE-5A', room: 'LT-2', faculty: 'Dr. Arun Sharma' },
];

/**
 * DESIGN BRIEF: HOD Department Timetables & Lab Allocation
 * - Who uses: Head of Department verifying room assignments, lab occupancy, and faculty scheduling conflicts.
 * - Single most important thing: Clash-free lab and lecture hall allocation across academic batches synchronized with teacher activity.
 * - Visual direction: Clear weekly timetable matrix with prominent room tags and batch pills.
 * - Palette: Slate (`#0F172A`, `#334155`, `#F8FAFC`), Brand Ink (`#2563EB`), Emerald (`#059669`).
 * - Spacing & radius: 4px/8px rhythm, rounded-xl containers with subtle 1px border.
 */

export default function HodTimetablesPage() {
  const classes = usePortalStore((state) => state.classes);
  const [selectedDay, setSelectedDay] = useState<string>('All');

  // Convert newly created classes to timetable slots
  const liveClassSlots: TimetableSlot[] = classes.map((c) => ({
    day: 'Wednesday', // Current active session day
    time: `${c.startTime} - ${c.endTime}`,
    courseCode: c.subjectCode,
    courseName: `${c.subjectName} (${c.topic})`,
    batch: c.batch.split(' ')[0] ?? c.batch,
    room: c.room,
    faculty: c.facultyName,
    isLiveSession: true,
  }));

  const combinedSlots = [...liveClassSlots, ...BASE_CSE_SLOTS];

  const filteredSlots = selectedDay === 'All'
    ? combinedSlots
    : combinedSlots.filter((s) => s.day === selectedDay);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Link
                href="/portal/hod"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                HOD Desk
              </Link>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-xs text-slate-500 font-mono">
                Department of Computer Science
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Department Master Timetables &amp; Lab Allocations
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Lecture halls, smart classrooms, and computing lab schedules for Autumn 2025-26.
            </p>
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {(['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const).map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  selectedDay === day
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timetable Ledger */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-500 font-semibold">
                <th className="px-4 py-3">Day &amp; Time Slot</th>
                <th className="px-4 py-3">Course Code &amp; Title</th>
                <th className="px-4 py-3">Batch</th>
                <th className="px-4 py-3">Assigned Room / Lab</th>
                <th className="px-4 py-3">Instructor</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSlots.map((slot, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-slate-900 dark:text-slate-100">
                    <div>{slot.day}</div>
                    <div className="text-[11px] text-slate-400 font-normal">{slot.time}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                      {slot.courseCode}
                    </span>
                    <span className="ml-1.5 font-medium text-slate-800 dark:text-slate-200">
                      {slot.courseName}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                    {slot.batch}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                    {slot.room}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    {slot.faculty}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {slot.isLiveSession ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono uppercase">
                        Live Podium
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        Regular
                      </span>
                    )}
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
