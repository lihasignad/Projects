'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePortalStore } from '@/features/portals/portal-store';

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

const INITIAL_ASSIGNMENT_SUBMISSIONS: StudentSubmissionItem[] = [
  { id: 'sub-1', rollNo: '2023CSE042', name: 'Priya Sharma', submittedAt: '2026-10-24 14:22', fileName: 'Normalization_Schema_CS501.pdf', fileSize: '2.4 MB', maxMarks: 20, score: 19, status: 'GRADED' },
  { id: 'sub-2', rollNo: '2023CSE011', name: 'Aarav Singhania', submittedAt: '2026-10-25 09:12', fileName: 'ER_Diagram_Assignment.pdf', fileSize: '3.1 MB', maxMarks: 20, score: 17, status: 'GRADED' },
  { id: 'sub-3', rollNo: '2023CSE003', name: 'Ananya Deshmukh', submittedAt: '2026-10-25 18:40', fileName: 'SQL_Triggers_Assignment.sql', fileSize: '180 KB', maxMarks: 20, score: null, status: 'PENDING' },
  { id: 'sub-4', rollNo: '2023CSE018', name: 'Devendra Joshi', submittedAt: '2026-10-26 11:05', fileName: 'Assignment_Unit2_BCNF.pdf', fileSize: '1.9 MB', maxMarks: 20, score: null, status: 'PENDING' },
];

/**
 * DESIGN BRIEF: Faculty Assignment & Quiz Grading Workbench
 * - Who uses: University professors evaluating student homework, quizzes, and practical assignments.
 * - Single most important thing: Quickly score pending submissions with inline grading and instant feedback release across portals.
 * - Visual direction: Clean tabular evaluation ledger with immediate grade persistence.
 * - Palette: Slate (`#0F172A`, `#334155`, `#F8FAFC`), Brand Ink (`#2563EB`), Emerald (`#059669`).
 * - Spacing & radius: 4px/8px rhythm, rounded-xl containers with subtle 1px border.
 */

export default function FacultyAssignmentsPage() {
  const quizSubmissions = usePortalStore((state) => state.quizSubmissions);
  const quizzes = usePortalStore((state) => state.quizzes);

  const [submissions, setSubmissions] = useState<StudentSubmissionItem[]>(INITIAL_ASSIGNMENT_SUBMISSIONS);
  const [editingScores, setEditingScores] = useState<Record<string, number>>({});
  const [banner, setBanner] = useState<string | null>(null);

  const handleScoreChange = (id: string, val: number) => {
    setEditingScores((prev) => ({ ...prev, [id]: val }));
  };

  const handleSaveScore = (id: string) => {
    const scoreVal = editingScores[id];
    if (scoreVal === undefined) return;
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, score: scoreVal, status: 'GRADED' } : s))
    );
    setBanner(`Score ${scoreVal}/20 saved and published to student marks card.`);
    setTimeout(() => setBanner(null), 4000);
  };

  const pendingAssignmentsCount = submissions.filter((s) => s.status === 'PENDING').length;

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
              <span className="text-xs text-slate-500 font-mono">
                CS501 &amp; CS502 Submissions
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Assessment &amp; Assignment Evaluations Workbench
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review student homework submissions, view automated quiz scores, and publish final internal marks.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold">
              {pendingAssignmentsCount} Homework Pending
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
              {quizSubmissions.length} Quizzes Auto-Graded
            </span>
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

      {/* Section 1: Live Interactive Quiz Submissions from Portal Store */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Live Student Quiz Submissions ({quizSubmissions.length})
            </h2>
            <p className="text-[11px] text-slate-500">
              Auto-graded instantaneously when students submit on the Student Portal.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
            Real-time Sync Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-500 font-semibold">
                <th className="px-4 py-3">Student Name &amp; Roll</th>
                <th className="px-4 py-3">Assessment Title</th>
                <th className="px-4 py-3 text-right">Score</th>
                <th className="px-4 py-3 text-right">Percentage</th>
                <th className="px-4 py-3 text-center">Outcome</th>
                <th className="px-4 py-3 text-right">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {quizSubmissions.map((sub) => {
                const quiz = quizzes.find((q) => q.id === sub.quizId);
                const isPriya = sub.rollNo === '2023CSE042' || sub.studentName.includes('Priya');
                return (
                  <tr
                    key={sub.id}
                    className={`transition-colors ${
                      isPriya ? 'bg-brand-50/50 dark:bg-brand-950/20 font-semibold' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      <div className="flex items-center space-x-1.5">
                        <span>{sub.studentName}</span>
                        {isPriya && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-brand-600 text-white font-normal uppercase">
                            Active Student
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">{sub.rollNo}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {quiz?.title || 'Interactive Course Quiz'}
                      </div>
                      <div className="text-[11px] font-mono text-brand-600 dark:text-brand-400">
                        {quiz?.subjectCode || 'CS501'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      {sub.score} / {sub.totalMarks}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {sub.percentage}%
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sub.passed
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {sub.passed ? 'PASSED' : 'RETEST REQUIRED'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-500 text-[11px]">
                      {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Homework & Lab Submissions with Inline Scoring */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Homework File Uploads &amp; Written Reports
          </h2>
          <span className="text-xs font-mono text-slate-500">Max Marks: 20</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-500 font-semibold">
                <th className="px-4 py-3">Roll Number</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Submitted File</th>
                <th className="px-4 py-3">Submission Time</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Inline Score / Publish</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                    {sub.rollNo}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                    {sub.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-brand-600 dark:text-brand-400 font-mono text-[11px]">
                      {sub.fileName}
                    </span>
                    <span className="text-slate-400 text-[10px] ml-1.5">({sub.fileSize})</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">
                    {sub.submittedAt}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sub.status === 'GRADED'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        placeholder={sub.score !== null ? String(sub.score) : 'Marks'}
                        value={editingScores[sub.id] !== undefined ? editingScores[sub.id] : sub.score !== null ? sub.score : ''}
                        onChange={(e) => handleScoreChange(sub.id, Number(e.target.value))}
                        className="w-16 px-2 py-1 text-right rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                      />
                      <span className="text-slate-400 font-mono">/ 20</span>
                      <button
                        type="button"
                        onClick={() => handleSaveScore(sub.id)}
                        className="px-2.5 py-1 rounded bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
                      >
                        Save
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
