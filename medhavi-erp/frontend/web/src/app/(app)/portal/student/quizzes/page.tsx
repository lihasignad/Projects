'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePortalStore } from '@/features/portals/portal-store';

/**
 * DESIGN BRIEF: Student Quizzes & Online Assessments
 * - Who uses: Students preparing for mid-terms, surprise tests, and laboratory vivas.
 * - Single most important thing: Quickly identify open quizzes published by teachers with countdowns and inspect past attempt performance.
 * - Visual direction: Clean card & tabular list with immediate start buttons and past score badges.
 * - Palette: Slate (`#0F172A`, `#475569`, `#F8FAFC`), Emerald (`#059669`), Brand Ink (`#2563EB`), Rose (`#E11D48`).
 * - Spacing: 4px/8px grid, rounded-xl containers with subtle 1px border.
 */

export default function StudentQuizzesPage() {
  const quizzes = usePortalStore((state) => state.quizzes);
  const quizSubmissions = usePortalStore((state) => state.quizSubmissions);

  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all');

  const filteredQuizzes = quizzes.filter((q) => {
    if (filter === 'all') return true;
    return q.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              Academic Assessment Portal
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Autumn 2025-26 · Live Teacher Assessments
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            Quizzes &amp; Online Assessments ({quizzes.length})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Internal assessments, chapter evaluations, and computer-based tests synchronized across department portals.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg self-start sm:self-auto">
          {(['all', 'active', 'upcoming', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                filter === tab
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Quizzes Grid / List */}
      <div className="space-y-4">
        {filteredQuizzes.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              No assessments found in this category.
            </div>
          </div>
        ) : (
          filteredQuizzes.map((quiz) => {
            const submission = quizSubmissions.find((s) => s.quizId === quiz.id);

            return (
              <div
                key={quiz.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                        {quiz.subjectCode}
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {quiz.subjectName}
                      </span>
                      {quiz.status === 'active' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-medium animate-pulse motion-reduce:animate-none">
                          Open Now
                        </span>
                      )}
                      {quiz.status === 'upcoming' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-medium">
                          Scheduled
                        </span>
                      )}
                      {quiz.status === 'completed' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
                          Evaluated
                        </span>
                      )}
                    </div>

                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                      {quiz.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400">
                      <span>Faculty: <strong className="text-slate-700 dark:text-slate-300 font-normal">{quiz.facultyName}</strong></span>
                      <span>Duration: <strong className="font-mono text-slate-700 dark:text-slate-300">{quiz.durationMinutes} mins</strong></span>
                      <span>Total Marks: <strong className="font-mono text-slate-700 dark:text-slate-300">{quiz.totalMarks}</strong></span>
                      <span>Questions: <strong className="font-mono text-slate-700 dark:text-slate-300">{quiz.questionsCount || quiz.questions.length}</strong></span>
                    </div>
                  </div>

                  {/* Action / Result Pill */}
                  <div className="flex items-center gap-3 self-end md:self-center">
                    {quiz.status === 'active' && (
                      <Link
                        href={`/portal/student/quizzes/${quiz.id}`}
                        className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
                      >
                        Start Assessment &rarr;
                      </Link>
                    )}

                    {quiz.status === 'upcoming' && (
                      <button
                        disabled
                        className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-medium cursor-not-allowed"
                      >
                        Starts Next Week
                      </button>
                    )}

                    {quiz.status === 'completed' && (
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                            {submission ? `${submission.score} / ${submission.totalMarks}` : `${quiz.totalMarks * 0.9} / ${quiz.totalMarks}`} Marks
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Score: {submission?.percentage || 90}% (PASSED)
                          </div>
                        </div>
                        <Link
                          href={`/portal/student/quizzes/${quiz.id}`}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
                        >
                          View Answers
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
