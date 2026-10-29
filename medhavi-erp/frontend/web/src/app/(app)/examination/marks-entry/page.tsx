'use client';

import { useState, useMemo } from 'react';
import { useAuthStore } from '@/shared/stores/auth-store';

interface StudentExamRecord {
  id: string;
  rollNumber: string;
  name: string;
  internalMarks: number; // max 40
  externalMarks: number; // max 60
  moderationAdjustment: number;
  remarks: string;
}

const INITIAL_EXAM_ROSTER: StudentExamRecord[] = [
  {
    id: 'ex-1',
    rollNumber: 'MSU/2024/BCSE042',
    name: 'Aarav Sharma',
    internalMarks: 36,
    externalMarks: 52,
    moderationAdjustment: 0,
    remarks: '',
  },
  {
    id: 'ex-2',
    rollNumber: 'MSU/2024/BCSE048',
    name: 'Priya Bhutia',
    internalMarks: 28,
    externalMarks: 39,
    moderationAdjustment: 0,
    remarks: '',
  },
  {
    id: 'ex-3',
    rollNumber: 'MSU/2024/BCSE051',
    name: 'Tashi Namgyal',
    internalMarks: 38,
    externalMarks: 56,
    moderationAdjustment: 0,
    remarks: '',
  },
  {
    id: 'ex-4',
    rollNumber: 'MSU/2024/BCSE055',
    name: 'Rohan Verma',
    internalMarks: 22,
    externalMarks: 31,
    moderationAdjustment: 2,
    remarks: 'Moderated +2 grace',
  },
  {
    id: 'ex-5',
    rollNumber: 'MSU/2024/BCSE060',
    name: 'Ananya Chetri',
    internalMarks: 35,
    externalMarks: 48,
    moderationAdjustment: 0,
    remarks: '',
  },
  {
    id: 'ex-6',
    rollNumber: 'MSU/2024/BCSE064',
    name: 'Karan Subba',
    internalMarks: 18,
    externalMarks: 24,
    moderationAdjustment: 0,
    remarks: 'Needs remedial exam',
  },
  {
    id: 'ex-7',
    rollNumber: 'MSU/2024/BCSE070',
    name: 'Sonam Lepcha',
    internalMarks: 39,
    externalMarks: 58,
    moderationAdjustment: 0,
    remarks: 'Subject Topper',
  },
];

function calculateGrade(total: number) {
  if (total >= 90) return { grade: 'O', point: 10, label: 'Outstanding' };
  if (total >= 80) return { grade: 'A+', point: 9, label: 'Excellent' };
  if (total >= 70) return { grade: 'A', point: 8, label: 'Very Good' };
  if (total >= 60) return { grade: 'B+', point: 7, label: 'Good' };
  if (total >= 50) return { grade: 'B', point: 6, label: 'Above Average' };
  if (total >= 40) return { grade: 'C', point: 5, label: 'Pass' };
  return { grade: 'F', point: 0, label: 'Fail' };
}

export default function MarksEntryPage() {
  const selectedInstitute = useAuthStore((state) => state.selectedInstitute);

  const [examCycle, setExamCycle] = useState('Monsoon 2025 Mid-Semester Assessment');
  const [selectedProgram, setSelectedProgram] = useState('B.Tech Computer Science');
  const [selectedSemester, setSelectedSemester] = useState(3);
  const [selectedSubject, setSelectedSubject] = useState('CS301: Data Structures & Algorithms');
  const [records, setRecords] = useState<StudentExamRecord[]>(INITIAL_EXAM_ROSTER);
  const [moderationState, setModerationState] = useState<'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED'>('SUBMITTED');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Update marks
  const updateInternal = (id: string, val: number) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, internalMarks: Math.min(40, Math.max(0, val)) } : r))
    );
  };

  const updateExternal = (id: string, val: number) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, externalMarks: Math.min(60, Math.max(0, val)) } : r))
    );
  };

  const updateModeration = (id: string, val: number) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, moderationAdjustment: val } : r))
    );
  };

  // Metrics
  const analytics = useMemo(() => {
    const totalCount = records.length;
    const totals = records.map((r) => r.internalMarks + r.externalMarks + r.moderationAdjustment);
    const avg = totals.length > 0 ? Math.round(totals.reduce((a, b) => a + b, 0) / totals.length) : 0;
    const highest = totals.length > 0 ? Math.max(...totals) : 0;
    const passed = totals.filter((t) => t >= 40).length;
    const passRate = totalCount > 0 ? Math.round((passed / totalCount) * 100) : 0;

    return { totalCount, avg, highest, passRate };
  }, [records]);

  const handlePublishResults = () => {
    setModerationState('PUBLISHED');
    setIsPublishModalOpen(false);
    setNotificationMsg('Examination marks successfully moderated and published to student portals!');
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  const handleExportCSV = () => {
    const headers = 'Roll Number,Name,Internal (40),External (60),Moderation,Final Score (100),Letter Grade,Grade Point,Status\n';
    const rows = records
      .map((r) => {
        const total = r.internalMarks + r.externalMarks + r.moderationAdjustment;
        const g = calculateGrade(total);
        return `"${r.rollNumber}","${r.name}",${r.internalMarks},${r.externalMarks},${r.moderationAdjustment},${total},"${g.grade}",${g.point},"${total >= 40 ? 'PASS' : 'FAIL'}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GradeSheet_${selectedSubject.split(':')[0]}_${examCycle.replace(/\s+/g, '_')}.csv`);
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
              Examination Marks & Moderation Console
            </h1>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                moderationState === 'PUBLISHED'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : moderationState === 'APPROVED'
                  ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              State: {moderationState}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Internal assessment entry, external paper scores, and Board of Examiners moderation for {selectedInstitute?.name || 'Medhavi Skills University'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            <svg aria-hidden="true" className="w-3.5 h-3.5 mr-1.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Grade Sheet
          </button>

          {moderationState !== 'PUBLISHED' && (
            <button
              type="button"
              onClick={() => setIsPublishModalOpen(true)}
              className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <svg aria-hidden="true" className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Publish Official Results
            </button>
          )}
        </div>
      </div>

      {/* Notification Banner */}
      {notificationMsg && (
        <div
          role="alert"
          className="rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 p-3 text-xs flex items-center space-x-2"
        >
          <svg aria-hidden="true" className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold">{notificationMsg}</span>
        </div>
      )}

      {/* Evaluation Context Selectors */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label htmlFor="exam-cycle" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Examination Session
          </label>
          <select
            id="exam-cycle"
            value={examCycle}
            onChange={(e) => setExamCycle(e.target.value)}
            className="w-full h-9 px-2.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
          >
            <option value="Monsoon 2025 Mid-Semester Assessment">Monsoon 2025 Mid-Semester Assessment</option>
            <option value="Spring 2025 End-Semester Examination">Spring 2025 End-Semester Examination</option>
            <option value="Annual Practical Jury 2025">Annual Practical Jury 2025</option>
          </select>
        </div>

        <div>
          <label htmlFor="exam-program" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Program
          </label>
          <select
            id="exam-program"
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="w-full h-9 px-2.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="B.Tech Computer Science">B.Tech Computer Science & Engg</option>
            <option value="B.Des Product Design">B.Des Product & Industrial Design</option>
            <option value="MBA Vocational">MBA Vocational & Entrepreneurship</option>
          </select>
        </div>

        <div>
          <label htmlFor="exam-sem" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Semester
          </label>
          <select
            id="exam-sem"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(Number(e.target.value))}
            className="w-full h-9 px-2.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="exam-subject" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Subject
          </label>
          <select
            id="exam-subject"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full h-9 px-2.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold text-brand-600 dark:text-brand-400"
          >
            <option value="CS301: Data Structures & Algorithms">CS301: Data Structures & Algorithms</option>
            <option value="CS302: Computer Architecture">CS302: Computer Architecture</option>
            <option value="MA301: Discrete Mathematics">MA301: Discrete Mathematics</option>
          </select>
        </div>
      </div>

      {/* Cohort Examination Analytics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 normal-case">Total Evaluated</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">{analytics.totalCount} Candidates</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">100% evaluated</div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 normal-case">Class Average Score</div>
          <div className="text-xl font-bold font-mono text-brand-600 dark:text-brand-400 mt-1">{analytics.avg} / 100</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Standard Bell Curve</div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 normal-case">Highest Score</div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">{analytics.highest} / 100</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Grade O (Outstanding)</div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 normal-case">Pass Percentage</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">{analytics.passRate}%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">&ge; 40 Marks threshold</div>
        </div>
      </div>

      {/* Marks Spreadsheet Table */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 normal-case">
              <tr>
                <th className="py-2.5 px-3 sm:px-4">Roll Number</th>
                <th className="py-2.5 px-3 sm:px-4">Candidate Name</th>
                <th className="py-2.5 px-3 sm:px-4 text-center">Internal (Max 40)</th>
                <th className="py-2.5 px-3 sm:px-4 text-center">Written/Lab (Max 60)</th>
                <th className="py-2.5 px-3 sm:px-4 text-center">Moderation (+/-)</th>
                <th className="py-2.5 px-3 sm:px-4 text-center">Grand Total (100)</th>
                <th className="py-2.5 px-3 sm:px-4 text-center">Grade (Points)</th>
                <th className="py-2.5 px-3 sm:px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {records.map((r) => {
                const total = r.internalMarks + r.externalMarks + r.moderationAdjustment;
                const g = calculateGrade(total);
                const isFail = total < 40;

                return (
                  <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 sm:px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {r.rollNumber}
                    </td>
                    <td className="py-3 px-3 sm:px-4 font-medium text-slate-800 dark:text-slate-200">
                      {r.name}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-center">
                      <input
                        type="number"
                        min={0}
                        max={40}
                        value={r.internalMarks}
                        onChange={(e) => updateInternal(r.id, Number(e.target.value))}
                        disabled={moderationState === 'PUBLISHED'}
                        className="w-16 h-8 text-center font-mono font-bold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-center">
                      <input
                        type="number"
                        min={0}
                        max={60}
                        value={r.externalMarks}
                        onChange={(e) => updateExternal(r.id, Number(e.target.value))}
                        disabled={moderationState === 'PUBLISHED'}
                        className="w-16 h-8 text-center font-mono font-bold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-center">
                      <input
                        type="number"
                        min={-10}
                        max={10}
                        value={r.moderationAdjustment}
                        onChange={(e) => updateModeration(r.id, Number(e.target.value))}
                        disabled={moderationState === 'PUBLISHED'}
                        className="w-14 h-8 text-center font-mono text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-center font-mono text-sm font-black">
                      <span className={isFail ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}>
                        {total}
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                          isFail
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {g.grade} ({g.point})
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-[11px] text-slate-500">
                      {r.remarks || <span className="opacity-40">None</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Publish Confirmation */}
      {isPublishModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 max-w-md w-full text-slate-900 dark:text-slate-100 shadow-2xl relative">
            <h3 className="text-base font-bold mb-2 text-rose-600 dark:text-rose-400">
              Confirm Official Result Publication
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              Publishing will lock this mark sheet. Final Letter Grades and SGPA/CGPA credits will immediately be reflected on official grade cards for all {records.length} students of {selectedProgram}.
            </p>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="px-3 py-2 rounded border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublishResults}
                className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              >
                Confirm & Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
