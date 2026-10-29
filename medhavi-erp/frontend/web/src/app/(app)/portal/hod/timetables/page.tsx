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

export default function HodTimetablesPage() {
  const classes = usePortalStore((state) => state.classes);
  const [selectedDay, setSelectedDay] = useState<string>('All');

  const liveClassSlots: TimetableSlot[] = classes.map((c) => ({
    day: 'Wednesday',
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
      <div className="bg-paper border border-rule rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Link
                href="/portal/hod"
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                HOD Desk
              </Link>
              <span className="text-ink-muted">|</span>
              <span className="text-xs text-ink-muted">
                Department of Computer Science
              </span>
            </div>
            <h1 className="text-xl font-bold text-ink mt-1.5">
              Department Master Timetables &amp; Lab Allocations
            </h1>
            <p className="text-xs text-ink-muted mt-0.5">
              Lecture halls, smart classrooms, and computing lab schedules for Autumn 2025-26.
            </p>
          </div>

          <div className="flex items-center space-x-1 bg-paper-2 p-1 rounded-md border border-rule">
            {(['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const).map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
                  selectedDay === day
                    ? 'bg-paper text-ink shadow-sm font-semibold'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timetable Matrix Table */}
      <div className="bg-paper border border-rule rounded-lg overflow-hidden">
        <div className="p-4 border-b border-rule flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink">
            Weekly Time Table Grid ({filteredSlots.length} Slots Displayed)
          </h2>
          <span className="text-xs text-ink-muted">
            Showing scheduled classes for: <strong className="text-ink">{selectedDay}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-paper-2 border-b border-rule text-xs font-semibold text-ink-muted normal-case">
                <th className="px-4 py-3">Day &amp; Time Slot</th>
                <th className="px-4 py-3">Course Code &amp; Title</th>
                <th className="px-4 py-3">Batch</th>
                <th className="px-4 py-3">Assigned Room / Lab</th>
                <th className="px-4 py-3">Instructor</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {filteredSlots.map((slot, idx) => (
                <tr key={idx} className="hover:bg-paper-2 transition-colors">
                  <td className="px-4 py-3 font-semibold text-ink">
                    <div>{slot.day}</div>
                    <div className="text-xs text-ink-muted font-normal font-mono">{slot.time}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-brand-600">
                      {slot.courseCode}
                    </span>
                    <span className="ml-1.5 font-medium text-ink">
                      {slot.courseName}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-ink-muted">
                    {slot.batch}
                  </td>
                  <td className="px-4 py-3 font-semibold text-ink">
                    {slot.room}
                  </td>
                  <td className="px-4 py-3 text-ink-2">
                    {slot.faculty}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {slot.isLiveSession ? (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-success-soft text-success border border-emerald-200 dark:border-emerald-900/40 capitalize">
                        Live podium
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-paper-3 text-ink-muted">
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
