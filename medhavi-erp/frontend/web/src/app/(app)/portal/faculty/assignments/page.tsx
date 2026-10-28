'use client';

import { useState } from 'react';
import Link from 'next/link';

interface StudentSubmissionItem {
  id: string;
  rollNo: string;
  name: string;
  submittedAt: string;
  fileName: string;
  fileSize: string;
  maxMarks: number;
  score: number | null;
  status: 'PENDING' | 'GRADED';
}

const INITIAL_SUBMISSIONS: StudentSubmissionItem[] = [
  { id: 'sub-1', rollNo: '2023CSE042', name: 'Priya Sharma', submittedAt: '2026-10-24 14:22', fileName: 'Normalization_Schema_CS501.pdf', fileSize: '2.4 MB', maxMarks: 20, score: 19, status: 'GRADED' },
  { id: 'sub-2', rollNo: '2023CSE011', name: 'Aarav Singhania', submittedAt: '2026-10-25 09:12', fileName: 'ER_Diagram_Assignment.pdf', fileSize: '3.1 MB', maxMarks: 20, score: 17, status: 'GRADED' },
  { id: 'sub-3', rollNo: '2023CSE003', name: 'Ananya Deshmukh', submittedAt: '2026-10-25 18:40', fileName: 'SQL_Triggers_Assignment.sql', fileSize: '180 KB', maxMarks: 20, score: null, status: 'PENDING' },
  { id: 'sub-4', rollNo: '2023CSE018', name: 'Devendra Joshi', submittedAt: '2026-10-26 11:05', fileName: 'Assignment_Unit2_BCNF.pdf', fileSize: '1.9 MB', maxMarks: 20, score: null, status: 'PENDING' },
];

/**
 * DESIGN BRIEF: Faculty Assignment Grading Workbench
 * - Who uses: University professors evaluating student homework and practical assignments.
 * - Single most important thing: Quickly score pending submissions with inline grading and instant feedback release.
 * - Visual direction: Clean tabular evaluation ledger with immediate grade persistence.
 * - Palette: Slate (`#0F172A`, `#334155`, `#F8FAFC`), Brand Ink (`#2563EB`), Emerald (`#059669`).
 * - Spacing & radius: 4px/8px rhythm, rounded-xl containers with subtle 1px border.
 */

export default function FacultyAssignmentsPage() {
  const [submissions, setSubmissions] = useState<StudentSubmissionItem[]>(INITIAL_SUBMISSIONS);
  const [editingScores, setEditingScores] = useState<Record<string, number>>({});

  const handleScoreChange = (id: string, val: number) => {
    setEditingScores((prev) => ({ ...prev, [id]: val }));
  };

  const handleSaveScore = (id: string) => {
    const scoreVal = editingScores[id];
    if (scoreVal === undefined) return;
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, score: scoreVal, status: 'GRADED' } : s))
    );
    alert(`Score ${scoreVal}/20 saved and published to student.`);
  };

  const pendingCount = submissions.filter((s) => s.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
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
              <span className="text-xs text-slate-500">
                CS501 DBMS, Assignment 2
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Assignment Submissions &amp; Grading
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Assignment 2: Schema Normalization &amp; BCNF Functional Dependency Proofs (20 Marks)
            </p>
          </div>

          <div className="text-right self-start sm:self-auto">
            <div className="text-[10px] font-semibold text-slate-400">Pending Evaluation</div>
            <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {pendingCount} Submissions
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Student Submission Ledger ({submissions.length} Total)
          </h2>
          <span className="text-xs text-slate-500">
            Max Marks: 20
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-500 font-semibold">
                <th className="px-4 py-3">Roll No &amp; Student</th>
                <th className="px-4 py-3">Submission Timestamp</th>
                <th className="px-4 py-3">Attached File</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Awarded Score (Max 20)</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {sub.rollNo}
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">{sub.name}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                    {sub.submittedAt}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-brand-600 dark:text-brand-400 hover:underline cursor-pointer">
                      {sub.fileName}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">{sub.fileSize}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-medium ${
                        sub.status === 'GRADED'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {sub.status === 'GRADED' ? (
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {sub.score} / 20
                      </span>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        max="20"
                        placeholder="Marks"
                        value={editingScores[sub.id] ?? ''}
                        onChange={(e) => handleScoreChange(sub.id, Number(e.target.value))}
                        className="w-20 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-right font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
                      />
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {sub.status === 'PENDING' ? (
                      <button
                        type="button"
                        onClick={() => handleSaveScore(sub.id)}
                        className="px-3 py-1 rounded bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
                      >
                        Submit Grade
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = prompt('Enter revised score (0-20):', String(sub.score));
                          if (updated !== null) {
                            handleScoreChange(sub.id, Number(updated));
                            setSubmissions((prev) =>
                              prev.map((s) => (s.id === sub.id ? { ...s, score: Number(updated) } : s))
                            );
                          }
                        }}
                        className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-medium"
                      >
                        Edit Score
                      </button>
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
