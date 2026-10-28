'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePortalStore } from '@/features/portals/portal-store';

/**
 * DESIGN BRIEF: Student Attendance Compliance Tracker & Leave Application
 * - Who uses: Students auditing their class attendance against the mandatory 75% university examination rule.
 * - Single most important thing: Subject-wise attendance % and precise calculation of classes required to regain eligibility, synchronized with faculty roll calls.
 * - Visual direction: High-clarity tabular tracker with distinct warning callouts and leave submission modal.
 * - Palette: Slate (`#0F172A`, `#334155`, `#F8FAFC`), Emerald (`#059669`), Amber (`#D97706`), Brand Ink (`#2563EB`).
 * - Spacing & radius: 4px/8px grid, rounded-xl containers with subtle 1px border.
 */

export default function StudentAttendancePage() {
  const studentProfile = usePortalStore((state) => state.studentProfile);
  const attendanceRecords = usePortalStore((state) => state.attendanceRecords);

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);
  const [leaveReason, setLeaveReason] = useState('Medical Leave / Health Indisposition');
  const [leaveDates, setLeaveDates] = useState('2026-10-28 to 2026-10-30');
  const [banner, setBanner] = useState<string | null>(null);

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    setLeaveSubmitted(true);
    setTimeout(() => {
      setShowLeaveModal(false);
      setLeaveSubmitted(false);
      setBanner('Leave request forwarded to Faculty Advisor (Dr. Arun Sharma) and HOD for official condonation verification.');
      setTimeout(() => setBanner(null), 5000);
    }, 800);
  };

  const isOverallCompliant = studentProfile.attendancePercentage >= 75;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Attendance Compliance Record
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {studentProfile.rollNo}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Semester Attendance Records: {studentProfile.fullName}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Minimum 75% aggregate attendance required per subject under Medhavi Academic Regulations Section 4.2.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setShowLeaveModal(true)}
              className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
            >
              Apply for Duty / Medical Leave
            </button>
          </div>
        </div>
      </div>

      {banner && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between">
          <span>{banner}</span>
          <button onClick={() => setBanner(null)} className="text-emerald-600 hover:underline">
            ✕
          </button>
        </div>
      )}

      {/* Aggregate Overview Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Current Overall Attendance
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {studentProfile.attendancePercentage}%
          </div>
          <div className="text-xs mt-1">
            {isOverallCompliant ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ Full Examination Eligibility Maintained
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                ⚠ Deficit Warning: Below 75% University Threshold
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="text-slate-500 text-[11px]">Enrolled Subjects</div>
            <div className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">
              {attendanceRecords.length} Courses
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="text-slate-500 text-[11px]">Total Attended</div>
            <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">
              {attendanceRecords.reduce((acc, a) => acc + a.attendedSessions, 0)} Sessions
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="text-slate-500 text-[11px]">Total Conducted</div>
            <div className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">
              {attendanceRecords.reduce((acc, a) => acc + a.conductedSessions, 0)} Sessions
            </div>
          </div>
        </div>
      </div>

      {/* Subject-Wise Ledger */}
      <div className="space-y-4">
        {attendanceRecords.map((subject) => {
          const isWarning = subject.percentage < 75;
          return (
            <div
              key={subject.id}
              className={`bg-white dark:bg-slate-900 border rounded-xl overflow-hidden shadow-sm transition-colors ${
                isWarning
                  ? 'border-amber-300 dark:border-amber-900/60'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                      {subject.subjectCode}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <span className="text-xs text-slate-500">Instructor: {subject.facultyName}</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {subject.subjectName}
                  </h2>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
                      <span className={isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
                        {subject.percentage}%
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      {subject.attendedSessions} of {subject.conductedSessions} Classes Attended
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Class Audit Trail for This Course */}
              <div className="p-4 bg-slate-50/50 dark:bg-slate-950/40">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Recent Session Roll Call Audit
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {subject.recentSessions.map((session, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-slate-500">
                          {session.date}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase font-mono ${
                            session.status === 'present'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : session.status === 'duty_leave'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {session.status}
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate" title={session.topic}>
                        {session.topic}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leave Application Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Apply for Duty / Medical Leave
            </h3>
            <p className="text-xs text-slate-500">
              Official condonations are reviewed by the Faculty Advisor and Dean&apos;s Office.
            </p>
            <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Absence
                </label>
                <input
                  type="text"
                  required
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Leave Duration (Dates)
                </label>
                <input
                  type="text"
                  required
                  value={leaveDates}
                  onChange={(e) => setLeaveDates(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={leaveSubmitted}
                  className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
                >
                  {leaveSubmitted ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
