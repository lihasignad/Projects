'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePortalStore } from '@/features/portals/portal-store';

interface ManualSubmission {
  id: string;
  name: string;
  rollNo: string;
  fileName: string;
  fileSize: string;
  submittedAt: string;
  score: number | null;
  status: 'GRADED' | 'PENDING';
}

const INITIAL_MANUAL_SUBS: ManualSubmission[] = [
  {
    id: 'sub-01',
    name: 'Priya Sharma',
    rollNo: '2023CSE042',
    fileName: 'Normalization_Schema_CS501.pdf',
    fileSize: '2.4 MB',
    submittedAt: '2026-10-24 14:22',
    score: 19,
    status: 'GRADED',
  },
  {
    id: 'sub-02',
    name: 'Aarav Singhania',
    rollNo: '2023CSE011',
    fileName: 'ER_Diagram_Assignment.pdf',
    fileSize: '3.1 MB',
    submittedAt: '2026-10-25 09:12',
    score: 17,
    status: 'GRADED',
  },
  {
    id: 'sub-03',
    name: 'Ananya Deshmukh',
    rollNo: '2023CSE003',
    fileName: 'SQL_Triggers_Assignment.sql',
    fileSize: '180 KB',
    submittedAt: '2026-10-25 18:40',
    score: null,
    status: 'PENDING',
  },
  {
    id: 'sub-04',
    name: 'Devendra Joshi',
    rollNo: '2023CSE018',
    fileName: 'Assignment_Unit2_BCNF.pdf',
    fileSize: '1.9 MB',
    submittedAt: '2026-10-26 11:05',
    score: null,
    status: 'PENDING',
  },
];

export default function FacultyAssignmentsWorkbenchPage() {
  const quizzes = usePortalStore((state) => state.quizzes);
  const quizSubmissions = usePortalStore((state) => state.quizSubmissions);

  const [submissions, setSubmissions] = useState<ManualSubmission[]>(INITIAL_MANUAL_SUBS);
  const [editingScores, setEditingScores] = useState<Record<string, number>>({});
  const [banner, setBanner] = useState<string | null>(null);

  const handleScoreChange = (id: string, val: number) => {
    setEditingScores((prev) => ({ ...prev, [id]: val }));
  };

  const handleSaveScore = (id: string) => {
    const val = editingScores[id];
    if (val === undefined) return;
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, score: val, status: 'GRADED' } : s))
    );
    setBanner(`Score of ${val}/20 recorded for assignment submission.`);
    setTimeout(() => setBanner(null), 4000);
  };

  const pendingAssignmentsCount = submissions.filter((s) => s.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-paper border border-rule rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Link
                href="/portal/faculty"
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                Faculty Desk
              </Link>
              <span className="text-ink-muted">|</span>
              <span className="text-xs text-ink-muted">
                CS501 &amp; CS502 Submissions
              </span>
            </div>
            <h1 className="text-xl font-bold text-ink mt-1.5">
              Assessment &amp; Assignment Evaluations Workbench
            </h1>
            <p className="text-xs text-ink-muted mt-0.5">
              Review student homework submissions, view automated quiz scores, and publish final internal marks.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="px-3 py-1.5 rounded-md bg-warning-soft text-warning border border-amber-200 dark:border-amber-900/40 dark:border-amber-900/40 text-xs font-semibold">
              {pendingAssignmentsCount} Homework Pending
            </span>
            <span className="px-3 py-1.5 rounded-md bg-success-soft text-success border border-emerald-200 dark:border-emerald-900/40 dark:border-emerald-900/40 text-xs font-semibold">
              {quizSubmissions.length} Quizzes Auto-Graded
            </span>
          </div>
        </div>
      </div>

      {banner && (
        <div className="p-3.5 rounded-lg bg-success-soft dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-success text-xs font-medium flex items-center justify-between">
          <span>{banner}</span>
          <button onClick={() => setBanner(null)} className="text-success hover:underline font-semibold" aria-label="Dismiss banner">
            ✕
          </button>
        </div>
      )}

      {/* Section 1: Live Interactive Quiz Submissions from Portal Store */}
      <div className="bg-paper border border-rule rounded-lg overflow-hidden">
        <div className="p-4 border-b border-rule flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-ink">
              Live Student Quiz Submissions ({quizSubmissions.length})
            </h2>
            <p className="text-xs text-ink-muted">
              Auto-graded instantaneously when students submit on the Student Portal.
            </p>
          </div>
          <span className="text-xs text-success font-medium">
            Real-time sync active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-paper border-b border-rule text-xs font-semibold text-ink-muted normal-case">
                <th className="px-4 py-3">Student Name &amp; Roll</th>
                <th className="px-4 py-3">Assessment Title</th>
                <th className="px-4 py-3 text-right">Score</th>
                <th className="px-4 py-3 text-right">Percentage</th>
                <th className="px-4 py-3 text-center">Outcome</th>
                <th className="px-4 py-3 text-right">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {quizSubmissions.map((sub) => {
                const quiz = quizzes.find((q) => q.id === sub.quizId);
                const isPriya = sub.rollNo === '2023CSE042' || sub.studentName.includes('Priya');
                return (
                  <tr
                    key={sub.id}
                    className={`transition-colors ${
                      isPriya ? 'bg-brand-50 font-semibold' : 'hover:bg-paper-2'
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-ink">
                      <div className="flex items-center space-x-1.5">
                        <span>{sub.studentName}</span>
                        {isPriya && (
                          <span className="px-1.5 py-0.5 rounded text-[11px] bg-brand-600 text-white font-normal capitalize">
                            Active student
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-ink-muted">{sub.rollNo}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-ink">
                        {quiz?.title || 'Interactive Course Quiz'}
                      </div>
                      <div className="text-xs font-mono text-brand-600">
                        {quiz?.subjectCode || 'CS501'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-ink">
                      {sub.score} / {sub.totalMarks}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-ink-2">
                      {sub.percentage}%
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${
                          sub.passed
                            ? 'bg-success-soft text-success border border-emerald-200 dark:border-emerald-900/40'
                            : 'bg-danger-soft text-danger border border-red-200 dark:border-red-900/40'
                        }`}
                      >
                        {sub.passed ? 'Passed' : 'Retest Required'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-ink-muted text-xs">
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
      <div className="bg-paper border border-rule rounded-lg overflow-hidden">
        <div className="p-4 border-b border-rule flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink">
            Homework File Uploads &amp; Written Reports
          </h2>
          <span className="text-xs text-ink-muted">Max Marks: 20</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-paper border-b border-rule text-xs font-semibold text-ink-muted normal-case">
                <th className="px-4 py-3">Roll Number</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Submitted File</th>
                <th className="px-4 py-3">Submission Time</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Inline Score / Publish</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-paper-2 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-ink">
                    {sub.rollNo}
                  </td>
                  <td className="px-4 py-3 font-medium text-ink">
                    {sub.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-brand-600 font-mono text-xs">
                      {sub.fileName}
                    </span>
                    <span className="text-ink-muted text-[11px] ml-1.5">({sub.fileSize})</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-ink-muted text-xs">
                    {sub.submittedAt}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${
                        sub.status === 'GRADED'
                          ? 'bg-success-soft text-success border border-emerald-200 dark:border-emerald-900/40'
                          : 'bg-warning-soft text-warning border border-amber-200 dark:border-amber-900/40'
                      }`}
                    >
                      {sub.status.toLowerCase()}
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
                        className="w-16 px-2 py-1 text-right rounded border border-rule bg-paper text-xs font-mono"
                      />
                      <span className="text-ink-muted font-mono">/ 20</span>
                      <button
                        type="button"
                        onClick={() => handleSaveScore(sub.id)}
                        className="px-3 py-1 rounded bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
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
