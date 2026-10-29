'use client';

import { useState } from 'react';
import { MOCK_STUDENT, MOCK_SEMESTER_RESULTS } from '@/features/portals/portals-mock-data';

/**
 * DESIGN BRIEF: Student Examination Results & Official Grade Cards
 * - Who uses: Students auditing their internal assessments, external theory marks, SGPA, and cumulative CGPA.
 * - Single most important thing: Semester-by-semester credit audit, letter grades (O, A+, A), and transcript generation.
 * - Visual direction: Clean academic transcript layout with tabular numbers and instant grade-sheet print/download.
 * - Palette: Slate (`#0F172A`, `#334155`, `#F8FAFC`), Emerald (`#059669`), Brand Ink (`#2563EB`).
 * - Spacing & radius: 4px/8px rhythm, rounded-xl containers with subtle 1px border.
 */

export default function StudentResultsPage() {
  const [selectedSem, setSelectedSem] = useState<number>(4);
  const activeResult = MOCK_SEMESTER_RESULTS.find((r) => r.semester === selectedSem) || MOCK_SEMESTER_RESULTS[0]!;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]">
                Examination &amp; Grading System
              </span>
              <span className="text-xs text-slate-500">
                {MOCK_STUDENT.rollNo}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Examination Results &amp; Grade Cards
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              10-Point Choice Based Credit System (CBCS) grading scale as per UGC Guidelines.
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 transition-colors self-start sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
          >
            Download Provisional Transcript
          </button>
        </div>
      </div>

      {/* CGPA Performance Stat Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400">
            Cumulative CGPA
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {MOCK_STUDENT.cgpa} <span className="text-xs text-slate-400 font-normal">/ 10.0</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            First Class with Distinction
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400">
            Latest Semester SGPA
          </div>
          <div className="text-2xl font-bold font-mono text-brand-600 dark:text-brand-400 mt-1">
            {activeResult.sgpa}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Semester {activeResult.semester} Examination
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400">
            Total Credits Earned
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {MOCK_STUDENT.creditsEarned} <span className="text-xs text-slate-400 font-normal">/ {MOCK_STUDENT.totalCredits}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Degree completion on track (60%)
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-[11px] font-semibold text-slate-400">
            Active Backlogs
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            0 Backlogs
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            All registered courses cleared
          </div>
        </div>
      </div>

      {/* Semester Selector Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {MOCK_SEMESTER_RESULTS.map((res) => (
          <button
            key={res.semester}
            type="button"
            onClick={() => setSelectedSem(res.semester)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              selectedSem === res.semester
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            Semester {res.semester} Grade Card (SGPA {res.sgpa})
          </button>
        ))}
      </div>

      {/* Detailed Grade Card Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Semester {activeResult.semester}, Statement of Marks
            </h2>
            <div className="text-xs text-slate-500 mt-0.5">
              Exam Session: {activeResult.academicSession}, Exam Date: {activeResult.examDate}
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]">
            RESULT: {activeResult.status}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-500 font-semibold">
                <th className="px-4 py-3">Subject Code &amp; Title</th>
                <th className="px-4 py-3 text-center">Credits</th>
                <th className="px-4 py-3 text-right">Internal (30/50)</th>
                <th className="px-4 py-3 text-right">External (70/50)</th>
                <th className="px-4 py-3 text-right">Total (100)</th>
                <th className="px-4 py-3 text-center">Letter Grade</th>
                <th className="px-4 py-3 text-center">Grade Point</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeResult.subjects.map((sub) => (
                <tr key={sub.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-mono font-bold text-brand-600 dark:text-brand-400">
                      {sub.code}
                    </div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {sub.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-slate-700 dark:text-slate-300">
                    {sub.credits}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                    {sub.internalMarks}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                    {sub.externalMarks}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                    {sub.totalMarks}
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-bold text-brand-600 dark:text-brand-400 text-sm">
                    {sub.letterGrade}
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {sub.gradePoint}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]">
                      {sub.status}
                    </span>
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
