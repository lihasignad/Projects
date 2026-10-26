'use client';

import { useState, useMemo } from 'react';
import { useAuthStore } from '@/shared/stores/auth-store';

interface AttendanceStudent {
  id: string;
  rollNumber: string;
  name: string;
  historicalAttendance: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks: string;
}

const INITIAL_ROSTER: AttendanceStudent[] = [
  {
    id: 'att-1',
    rollNumber: 'MSU/2024/BCSE042',
    name: 'Aarav Sharma',
    historicalAttendance: 86,
    status: 'PRESENT',
    remarks: '',
  },
  {
    id: 'att-2',
    rollNumber: 'MSU/2024/BCSE048',
    name: 'Priya Bhutia',
    historicalAttendance: 71,
    status: 'ABSENT',
    remarks: 'Informed sick leave',
  },
  {
    id: 'att-3',
    rollNumber: 'MSU/2024/BCSE051',
    name: 'Tashi Namgyal',
    historicalAttendance: 92,
    status: 'PRESENT',
    remarks: '',
  },
  {
    id: 'att-4',
    rollNumber: 'MSU/2024/BCSE055',
    name: 'Rohan Verma',
    historicalAttendance: 62,
    status: 'LATE',
    remarks: 'Arrived 15 mins late',
  },
  {
    id: 'att-5',
    rollNumber: 'MSU/2024/BCSE060',
    name: 'Ananya Chetri',
    historicalAttendance: 88,
    status: 'PRESENT',
    remarks: '',
  },
  {
    id: 'att-6',
    rollNumber: 'MSU/2024/BCSE064',
    name: 'Karan Subba',
    historicalAttendance: 64,
    status: 'ABSENT',
    remarks: 'Uninformed',
  },
  {
    id: 'att-7',
    rollNumber: 'MSU/2024/BCSE070',
    name: 'Sonam Lepcha',
    historicalAttendance: 95,
    status: 'PRESENT',
    remarks: '',
  },
  {
    id: 'att-8',
    rollNumber: 'MSU/2024/BCSE075',
    name: 'Bikram Gurung',
    historicalAttendance: 78,
    status: 'PRESENT',
    remarks: '',
  },
];

export default function DailyAttendancePage() {
  const selectedInstitute = useAuthStore((state) => state.selectedInstitute);

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedProgram, setSelectedProgram] = useState('B.Tech CSE - Semester 3');
  const [selectedSlot, setSelectedSlot] = useState('CS301: Data Structures & Algorithms (10:00 AM - 11:00 AM)');
  const [searchQuery, setSearchQuery] = useState('');
  const [roster, setRoster] = useState<AttendanceStudent[]>(INITIAL_ROSTER);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status updates
  const setStudentStatus = (id: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    setRoster((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  const setStudentRemarks = (id: string, remarks: string) => {
    setRoster((prev) =>
      prev.map((s) => (s.id === id ? { ...s, remarks } : s))
    );
  };

  const markAll = (status: 'PRESENT' | 'ABSENT') => {
    setRoster((prev) => prev.map((s) => ({ ...s, status })));
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = roster.length;
    const present = roster.filter((s) => s.status === 'PRESENT').length;
    const absent = roster.filter((s) => s.status === 'ABSENT').length;
    const late = roster.filter((s) => s.status === 'LATE').length;
    const excused = roster.filter((s) => s.status === 'EXCUSED').length;
    const rate = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 0;
    return { total, present, absent, late, excused, rate };
  }, [roster]);

  const filteredRoster = useMemo(() => {
    if (!searchQuery) return roster;
    return roster.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [roster, searchQuery]);

  const handleSaveAttendance = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    }, 600);
  };

  const handleExportCSV = () => {
    const headers = 'Roll Number,Student Name,Date,Program,Slot,Attendance Status,Remarks\n';
    const rows = roster
      .map(
        (s) =>
          `"${s.rollNumber}","${s.name}","${date}","${selectedProgram}","${selectedSlot}","${s.status}","${s.remarks}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Attendance_${date}_${selectedProgram.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Daily Attendance Register
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Session Live
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Record classroom presence and automated defaulter alerts for {selectedInstitute?.name || 'Medhavi Skills University'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="w-3.5 h-3.5 mr-1.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Sheet
          </button>

          <button
            type="button"
            onClick={handleSaveAttendance}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors disabled:opacity-75"
          >
            {isSubmitting ? (
              <span>Saving Records...</span>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Lock & Submit Register
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccess && (
        <div
          role="alert"
          className="rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 p-3 text-xs flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold">
              Attendance register successfully committed! Defaulter notifications sent to parent SMS gateway.
            </span>
          </div>
          <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">ID: ATT-{Date.now().toString().slice(-6)}</span>
        </div>
      )}

      {/* Operational Controls Bar */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Date Selector */}
        <div>
          <label htmlFor="att-date" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Date of Session
          </label>
          <input
            id="att-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-9 px-3 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
          />
        </div>

        {/* Program / Batch */}
        <div>
          <label htmlFor="att-program" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Program & Cohort
          </label>
          <select
            id="att-program"
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="w-full h-9 px-2.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="B.Tech CSE - Semester 3">B.Tech CSE — Sem 3 (Section A)</option>
            <option value="B.Tech CSE - Semester 5">B.Tech CSE — Sem 5 (Section A)</option>
            <option value="B.Des Industrial - Semester 3">B.Des Industrial Design — Sem 3</option>
            <option value="MBA Vocational - Semester 1">MBA Vocational — Sem 1</option>
            <option value="Diploma Hospitality - Semester 2">Diploma Hospitality — Sem 2</option>
          </select>
        </div>

        {/* Course / Timetable Slot */}
        <div className="sm:col-span-2">
          <label htmlFor="att-slot" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Course Subject & Time Slot
          </label>
          <select
            id="att-slot"
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            className="w-full h-9 px-2.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="CS301: Data Structures & Algorithms (10:00 AM - 11:00 AM)">
              CS301: Data Structures & Algorithms (10:00 AM - 11:00 AM) • Lab 3 • Prof. S. Sharma
            </option>
            <option value="CS302: Computer Organization (11:15 AM - 12:15 PM)">
              CS302: Computer Architecture (11:15 AM - 12:15 PM) • Hall 204 • Dr. R. Subba
            </option>
            <option value="CS303: Operating Systems (02:00 PM - 03:00 PM)">
              CS303: Operating Systems (02:00 PM - 03:00 PM) • Lab 1 • Prof. A. Pradhan
            </option>
          </select>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Enrolled</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">{metrics.total}</div>
        </div>
        <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20 p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Present</div>
          <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1">{metrics.present}</div>
        </div>
        <div className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/20 p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">Absent</div>
          <div className="text-xl font-bold font-mono text-rose-700 dark:text-rose-400 mt-1">{metrics.absent}</div>
        </div>
        <div className="rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Late (0.5x)</div>
          <div className="text-xl font-bold font-mono text-amber-700 dark:text-amber-400 mt-1">{metrics.late}</div>
        </div>
        <div className="rounded-lg border border-sky-200 dark:border-sky-900/60 bg-sky-50/60 dark:bg-sky-950/20 p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">Excused</div>
          <div className="text-xl font-bold font-mono text-sky-700 dark:text-sky-400 mt-1">{metrics.excused}</div>
        </div>
        <div className="rounded-lg border border-brand-200 dark:border-brand-900/60 bg-brand-50/60 dark:bg-brand-950/20 p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-400">Effective Rate</div>
          <div className="text-xl font-bold font-mono text-brand-700 dark:text-brand-400 mt-1">{metrics.rate}%</div>
        </div>
      </div>

      {/* Roster Table Card */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-3 sm:px-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-950/30">
          <div className="w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Quick search student name or roll..."
              className="w-full h-8 px-2.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500 text-[11px] font-medium hidden sm:inline">Bulk actions:</span>
            <button
              type="button"
              onClick={() => markAll('PRESENT')}
              className="px-2.5 py-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-bold"
            >
              All Present
            </button>
            <button
              type="button"
              onClick={() => markAll('ABSENT')}
              className="px-2.5 py-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[11px] font-bold"
            >
              All Absent
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 sm:px-4">#</th>
                <th className="py-2.5 px-3 sm:px-4">Roll Number</th>
                <th className="py-2.5 px-3 sm:px-4">Student Name</th>
                <th className="py-2.5 px-3 sm:px-4">Cumulative %</th>
                <th className="py-2.5 px-3 sm:px-4 text-center">Session Attendance Status</th>
                <th className="py-2.5 px-3 sm:px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRoster.map((student, idx) => {
                const isDefaulter = student.historicalAttendance < 75;

                return (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3 sm:px-4 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                    <td className="py-3 px-3 sm:px-4 font-mono font-semibold text-slate-900 dark:text-slate-100">
                      {student.rollNumber}
                    </td>
                    <td className="py-3 px-3 sm:px-4 font-medium text-slate-800 dark:text-slate-200">
                      {student.name}
                    </td>
                    <td className="py-3 px-3 sm:px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                          isDefaulter
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        }`}
                      >
                        {student.historicalAttendance}% {isDefaulter && '⚠️'}
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:px-4">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          type="button"
                          onClick={() => setStudentStatus(student.id, 'PRESENT')}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                            student.status === 'PRESENT'
                              ? 'bg-emerald-600 text-white shadow'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50'
                          }`}
                        >
                          P
                        </button>
                        <button
                          type="button"
                          onClick={() => setStudentStatus(student.id, 'ABSENT')}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                            student.status === 'ABSENT'
                              ? 'bg-rose-600 text-white shadow'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-50'
                          }`}
                        >
                          A
                        </button>
                        <button
                          type="button"
                          onClick={() => setStudentStatus(student.id, 'LATE')}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                            student.status === 'LATE'
                              ? 'bg-amber-600 text-white shadow'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-50'
                          }`}
                        >
                          L
                        </button>
                        <button
                          type="button"
                          onClick={() => setStudentStatus(student.id, 'EXCUSED')}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                            student.status === 'EXCUSED'
                              ? 'bg-sky-600 text-white shadow'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-sky-50'
                          }`}
                        >
                          E
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3 sm:px-4">
                      <input
                        type="text"
                        value={student.remarks}
                        onChange={(e) => setStudentRemarks(student.id, e.target.value)}
                        placeholder="Optional remarks..."
                        className="w-full h-7 px-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
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
