'use client';

import { useState } from 'react';
import { MOCK_STUDENT, MOCK_ATTENDANCE_SUMMARY } from '@/features/portals/portals-mock-data';

/**
 * DESIGN BRIEF: Student Attendance Compliance Tracker & Leave Application
 * - Who uses: Students auditing their class attendance against the mandatory 75% university examination rule.
 * - Single most important thing: Subject-wise attendance % and precise calculation of classes required to regain eligibility.
 * - Visual direction: High-clarity tabular tracker with distinct warning callouts and leave submission modal.
 * - Palette: Slate (`#0F172A`, `#334155`, `#F8FAFC`), Emerald (`#059669`), Amber (`#D97706`), Brand Ink (`#2563EB`).
 * - Spacing & radius: 4px/8px grid, rounded-xl containers with subtle 1px border.
 */

export default function StudentAttendancePage() {
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);
  const [leaveReason, setLeaveReason] = useState('Medical Leave / Health Indisposition');
  const [leaveDates, setLeaveDates] = useState('2026-10-28 to 2026-10-30');

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    setLeaveSubmitted(true);
    setTimeout(() => {
      setShowLeaveModal(false);
      setLeaveSubmitted(false);
      alert('Leave request forwarded to Faculty Advisor (Dr. Arvind Rao) for verification.');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]">
                Attendance Compliance
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {MOCK_STUDENT.rollNo}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Semester Attendance Records
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Minimum 75% aggregate attendance required per subject under Medhavi Academic Regulations Section 4.2.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowLeaveModal(true)}
            className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
          >
            Apply for Duty / Medical Leave
          </button>
        </div>
      </div>

      {/* Aggregate Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400">
            Overall Aggregate
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {MOCK_STUDENT.attendancePercentage}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Eligible for End-Sem Exam
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400">
            Total Classes Conducted
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            126 <span className="text-xs text-slate-400 font-normal">hours</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            106 attended / 20 missed
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400">
            Shortfall Warnings
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            1 Subject
          </div>
          <div className="text-xs text-slate-500 mt-1">
            CS504 Theory of Computation (71.4%)
          </div>
        </div>
      </div>

      {/* Subject-by-Subject Attendance Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Subject-wise Attendance Breakdown
          </h2>
          <span className="text-xs text-slate-500">
            Updated daily by faculty post-lecture
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-500 font-semibold">
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Faculty</th>
                <th className="px-4 py-3 text-right">Conducted</th>
                <th className="px-4 py-3 text-right">Attended</th>
                <th className="px-4 py-3 text-right">Attendance %</th>
                <th className="px-4 py-3 text-center">Eligibility</th>
                <th className="px-4 py-3">Recovery Needed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {MOCK_ATTENDANCE_SUMMARY.map((rec) => {
                const classesNeeded = rec.percentage < 75 ? Math.ceil((0.75 * rec.conductedSessions - rec.attendedSessions) / 0.25) : 0;

                return (
                  <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      <div className="font-mono font-bold text-brand-600 dark:text-brand-400">
                        {rec.subjectCode}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">{rec.subjectName}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {rec.facultyName}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-800 dark:text-slate-200">
                      {rec.conductedSessions}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-800 dark:text-slate-200">
                      {rec.attendedSessions}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold">
                      <span
                        className={
                          rec.percentage >= 75
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }
                      >
                        {rec.percentage}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-medium ${
                          rec.percentage >= 75
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {rec.percentage >= 75 ? 'ELIGIBLE' : 'SHORTFALL'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {classesNeeded > 0 ? (
                        <span className="text-amber-700 dark:text-amber-300 font-medium">
                          Attend next {classesNeeded} classes consecutively
                        </span>
                      ) : (
                        <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                          Above quota (+{rec.attendedSessions - Math.ceil(rec.conductedSessions * 0.75)} buffer)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Apply for Duty / Medical Leave
            </h3>
            <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Leave Category
                </label>
                <select
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  <option value="Medical Leave / Health Indisposition">Medical Leave (Doctor Certificate Attached)</option>
                  <option value="Official University Duty (Sports / Hackathon)">Official University Duty (Approved by Dean)</option>
                  <option value="Family Bereavement / Emergency">Family Emergency</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Leave Duration (Dates)
                </label>
                <input
                  type="text"
                  value={leaveDates}
                  onChange={(e) => setLeaveDates(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Justification / Supporting Details
                </label>
                <textarea
                  rows={3}
                  defaultValue="Advised bed rest for acute viral fever by University Health Centre."
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
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
                  className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
                >
                  {leaveSubmitted ? 'Submitting...' : 'Submit to Advisor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
