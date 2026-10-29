'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/shared/stores/auth-store';

interface TimetableSlot {
  id: string;
  day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT';
  timeIndex: number; // 0 to 5
  timeLabel: string;
  subjectCode: string;
  subjectName: string;
  room: string;
  instructor: string;
  type: 'THEORY' | 'LAB' | 'WORKSHOP';
}

const TIME_SLOTS = [
  '09:00 - 10:00 AM',
  '10:00 - 11:00 AM',
  '11:15 - 12:15 PM',
  '01:15 - 02:15 PM',
  '02:15 - 03:15 PM',
  '03:30 - 05:00 PM',
];

const DAYS = [
  { key: 'MON', label: 'Monday' },
  { key: 'TUE', label: 'Tuesday' },
  { key: 'WED', label: 'Wednesday' },
  { key: 'THU', label: 'Thursday' },
  { key: 'FRI', label: 'Friday' },
  { key: 'SAT', label: 'Saturday' },
] as const;

const INITIAL_SCHEDULE: TimetableSlot[] = [
  // Monday
  {
    id: 'slot-1',
    day: 'MON',
    timeIndex: 0,
    timeLabel: '09:00 - 10:00 AM',
    subjectCode: 'CS302',
    subjectName: 'Computer Architecture',
    room: 'Hall 204',
    instructor: 'Dr. R. Subba',
    type: 'THEORY',
  },
  {
    id: 'slot-2',
    day: 'MON',
    timeIndex: 1,
    timeLabel: '10:00 - 11:00 AM',
    subjectCode: 'CS301',
    subjectName: 'Data Structures & Algo',
    room: 'Lab 3',
    instructor: 'Prof. S. Sharma',
    type: 'THEORY',
  },
  {
    id: 'slot-3',
    day: 'MON',
    timeIndex: 2,
    timeLabel: '11:15 - 12:15 PM',
    subjectCode: 'MA301',
    subjectName: 'Discrete Mathematics',
    room: 'Hall 204',
    instructor: 'Dr. P. Pradhan',
    type: 'THEORY',
  },
  {
    id: 'slot-4',
    day: 'MON',
    timeIndex: 5,
    timeLabel: '03:30 - 05:00 PM',
    subjectCode: 'CS301L',
    subjectName: 'Data Structures Lab (Section A)',
    room: 'Computing Lab 1',
    instructor: 'Prof. S. Sharma',
    type: 'LAB',
  },
  // Tuesday
  {
    id: 'slot-5',
    day: 'TUE',
    timeIndex: 0,
    timeLabel: '09:00 - 10:00 AM',
    subjectCode: 'CS303',
    subjectName: 'Operating Systems',
    room: 'Hall 204',
    instructor: 'Prof. A. Pradhan',
    type: 'THEORY',
  },
  {
    id: 'slot-6',
    day: 'TUE',
    timeIndex: 1,
    timeLabel: '10:00 - 11:00 AM',
    subjectCode: 'CS302',
    subjectName: 'Computer Architecture',
    room: 'Hall 204',
    instructor: 'Dr. R. Subba',
    type: 'THEORY',
  },
  {
    id: 'slot-7',
    day: 'TUE',
    timeIndex: 5,
    timeLabel: '03:30 - 05:00 PM',
    subjectCode: 'CS303L',
    subjectName: 'OS Kernel & Unix Workshop',
    room: 'Computing Lab 2',
    instructor: 'Prof. A. Pradhan',
    type: 'LAB',
  },
  // Wednesday
  {
    id: 'slot-8',
    day: 'WED',
    timeIndex: 1,
    timeLabel: '10:00 - 11:00 AM',
    subjectCode: 'CS301',
    subjectName: 'Data Structures & Algo',
    room: 'Hall 204',
    instructor: 'Prof. S. Sharma',
    type: 'THEORY',
  },
  {
    id: 'slot-9',
    day: 'WED',
    timeIndex: 2,
    timeLabel: '11:15 - 12:15 PM',
    subjectCode: 'MA301',
    subjectName: 'Discrete Mathematics',
    room: 'Hall 204',
    instructor: 'Dr. P. Pradhan',
    type: 'THEORY',
  },
  // Thursday
  {
    id: 'slot-10',
    day: 'THU',
    timeIndex: 0,
    timeLabel: '09:00 - 10:00 AM',
    subjectCode: 'CS303',
    subjectName: 'Operating Systems',
    room: 'Hall 204',
    instructor: 'Prof. A. Pradhan',
    type: 'THEORY',
  },
  {
    id: 'slot-11',
    day: 'THU',
    timeIndex: 3,
    timeLabel: '01:15 - 02:15 PM',
    subjectCode: 'VOC201',
    subjectName: 'Industry Apprenticeship Prep',
    room: 'Seminar Room B',
    instructor: 'Industry Mentor',
    type: 'WORKSHOP',
  },
  // Friday
  {
    id: 'slot-12',
    day: 'FRI',
    timeIndex: 1,
    timeLabel: '10:00 - 11:00 AM',
    subjectCode: 'CS301',
    subjectName: 'Data Structures & Algo',
    room: 'Hall 204',
    instructor: 'Prof. S. Sharma',
    type: 'THEORY',
  },
  {
    id: 'slot-13',
    day: 'FRI',
    timeIndex: 5,
    timeLabel: '03:30 - 05:00 PM',
    subjectCode: 'PRJ301',
    subjectName: 'Project Evaluation & Code Review',
    room: 'Innovation Studio',
    instructor: 'Faculty Panel',
    type: 'WORKSHOP',
  },
];

export default function TimetablesPage() {
  const selectedInstitute = useAuthStore((state) => state.selectedInstitute);

  const [selectedCohort, setSelectedCohort] = useState('B.Tech CSE - Semester 3 (Section A)');
  const [schedule, setSchedule] = useState<TimetableSlot[]>(INITIAL_SCHEDULE);
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);

  // Form states for new slot
  const [newDay, setNewDay] = useState<'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT'>('MON');
  const [newTimeIdx, setNewTimeIdx] = useState(0);
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newRoom, setNewRoom] = useState('Hall 204');
  const [newInstructor, setNewInstructor] = useState('');
  const [newType, setNewType] = useState<'THEORY' | 'LAB' | 'WORKSHOP'>('THEORY');

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectCode || !newSubjectName) return;

    const newSlot: TimetableSlot = {
      id: `slot-${Date.now()}`,
      day: newDay,
      timeIndex: Number(newTimeIdx),
      timeLabel: (TIME_SLOTS[Number(newTimeIdx)] ?? '09:00 - 10:00 AM') as string,
      subjectCode: newSubjectCode.toUpperCase(),
      subjectName: newSubjectName,
      room: newRoom,
      instructor: newInstructor || 'Faculty',
      type: newType,
    };

    setSchedule([...schedule, newSlot]);
    setIsAddSlotOpen(false);
    setNewSubjectCode('');
    setNewSubjectName('');
    setNewInstructor('');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Page Title & Operational Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Weekly Timetable & Room Matrix
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              0 Conflicts Detected
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Master teaching timetable, lecture halls, and laboratory allocations for {selectedInstitute?.name || 'Demo University'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <Link
            href="/academics"
            className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            &larr; Programs Catalog
          </Link>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            <svg aria-hidden="true" className="w-3.5 h-3.5 mr-1.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Schedule
          </button>

          <button
            type="button"
            onClick={() => setIsAddSlotOpen(true)}
            className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            <svg aria-hidden="true" className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Class Slot
          </button>
        </div>
      </div>

      {/* Cohort Selector & Info Bar */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <label htmlFor="cohort-select" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Selected Cohort:
          </label>
          <select
            id="cohort-select"
            value={selectedCohort}
            onChange={(e) => setSelectedCohort(e.target.value)}
            className="h-9 px-3 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="B.Tech CSE - Semester 3 (Section A)">B.Tech CSE: Semester 3 (Section A)</option>
            <option value="B.Tech CSE - Semester 5 (Section A)">B.Tech CSE: Semester 5 (Section A)</option>
            <option value="B.Des Product - Semester 3">B.Des Industrial Design: Semester 3</option>
            <option value="MBA Vocational - Semester 1">MBA Vocational: Semester 1</option>
          </select>
        </div>

        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            <span className="text-slate-600 dark:text-slate-400">Theory Lecture</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600 dark:text-slate-400">Practical Lab</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span className="text-slate-600 dark:text-slate-400">Workshop/Studio</span>
          </div>
        </div>
      </div>

      {/* Master Interactive Weekly Grid */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 normal-case">
              <tr>
                <th className="py-3 px-3 w-28 border-r border-slate-200 dark:border-slate-800 text-center">
                  Time Slot
                </th>
                {DAYS.map((d) => (
                  <th key={d.key} className="py-3 px-3 text-center border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {TIME_SLOTS.map((timeLabel, timeIdx) => {
                // Check if lunch break slot
                const isLunchTime = timeIdx === 3 && timeLabel.startsWith('01:15');

                return (
                  <tr key={timeIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                    <td className="py-3 px-2 font-mono text-[11px] font-semibold text-slate-600 dark:text-slate-400 text-center border-r border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/30">
                      {timeLabel}
                    </td>

                    {DAYS.map((day) => {
                      const slot = schedule.find(
                        (s) => s.day === day.key && s.timeIndex === timeIdx
                      );

                      return (
                        <td
                          key={day.key}
                          className="py-2 px-2 border-r border-slate-200 dark:border-slate-800 last:border-r-0 align-top min-w-[140px] h-20"
                        >
                          {slot ? (
                            <div
                              className={`h-full p-2 rounded border text-left flex flex-col justify-between transition-colors ${
                                slot.type === 'THEORY'
                                  ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/60 text-sky-950 dark:text-sky-200'
                                  : slot.type === 'LAB'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200'
                                  : 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60 text-purple-950 dark:text-purple-200'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                                  <span>{slot.subjectCode}</span>
                                  <span className="font-sans px-1 rounded bg-white/70 dark:bg-black/40 text-[9px]">
                                    {slot.room}
                                  </span>
                                </div>
                                <div className="font-semibold text-[11px] mt-0.5 leading-tight line-clamp-2">
                                  {slot.subjectName}
                                </div>
                              </div>
                              <div className="text-[10px] opacity-80 mt-1 truncate">
                                Instructor: {slot.instructor}
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800/60 rounded text-[10px] text-slate-300 dark:text-slate-700">
                              Free Slot
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Timetable Slot */}
      {isAddSlotOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 max-w-md w-full text-slate-900 dark:text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setIsAddSlotOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              aria-label="Close dialog"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-base font-bold mb-1">Add Timetable Lecture Slot</h3>
            <p className="text-xs text-slate-500 mb-4">
              Allocate a subject period for {selectedCohort}.
            </p>

            <form onSubmit={handleAddSlot} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Day of Week
                  </label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value as any)}
                    className="w-full h-9 px-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {DAYS.map((d) => (
                      <option key={d.key} value={d.key}>{d.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Time Period Slot
                  </label>
                  <select
                    value={newTimeIdx}
                    onChange={(e) => setNewTimeIdx(Number(e.target.value))}
                    className="w-full h-9 px-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {TIME_SLOTS.map((t, idx) => (
                      <option key={idx} value={idx}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubjectCode}
                    onChange={(e) => setNewSubjectCode(e.target.value)}
                    placeholder="e.g. CS305"
                    className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 uppercase font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Room / Lab *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    placeholder="e.g. Hall 204 or Lab 3"
                    className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="e.g. Database Management Systems"
                  className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Instructor
                  </label>
                  <input
                    type="text"
                    value={newInstructor}
                    onChange={(e) => setNewInstructor(e.target.value)}
                    placeholder="e.g. Prof. R. Sharma"
                    className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Session Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full h-9 px-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="THEORY">Theory Lecture</option>
                    <option value="LAB">Practical Lab</option>
                    <option value="WORKSHOP">Workshop / Studio</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddSlotOpen(false)}
                  className="px-3 py-2 rounded border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
