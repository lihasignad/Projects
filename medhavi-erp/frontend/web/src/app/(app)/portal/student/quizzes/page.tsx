'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePortalStore } from '@/features/portals/portal-store';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-paper border border-rule rounded-lg p-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-600">
              Academic Assessment Portal
            </span>
            <span className="text-xs text-ink-muted">
              Autumn 2025-26, live teacher assessments
            </span>
          </div>
          <h1 className="text-xl font-bold text-ink mt-1.5">
            Quizzes &amp; Online Assessments ({quizzes.length})
          </h1>
          <p className="text-xs text-ink-muted mt-0.5">
            Internal assessments, chapter evaluations, and computer-based tests synchronized across department portals.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 bg-paper-2 p-1 rounded-md self-start sm:self-auto border border-rule">
          {(['all', 'active', 'upcoming', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
                filter === tab
                  ? 'bg-paper text-ink shadow-sm font-semibold'
                  : 'text-ink-muted hover:text-ink'
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
          <div className="text-center py-12 bg-paper border border-rule rounded-lg">
            <div className="text-xs text-ink-muted font-medium">
              No assessments found in this category.
            </div>
          </div>
        ) : (
          filteredQuizzes.map((quiz) => {
            const submission = quizSubmissions.find((s) => s.quizId === quiz.id);

            return (
              <div
                key={quiz.id}
                className="bg-paper border border-rule rounded-lg p-5 hover:border-brand-200 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-brand-600">
                        {quiz.subjectCode}
                      </span>
                      <span className="text-xs text-ink-muted">,</span>
                      <span className="text-xs font-medium text-ink-2">
                        {quiz.subjectName}
                      </span>
                      {quiz.status === 'active' && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-danger-soft text-danger border border-red-200 dark:border-red-900/40">
                          Open now
                        </span>
                      )}
                      {quiz.status === 'upcoming' && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-warning-soft text-warning border border-amber-200 dark:border-amber-900/40">
                          Scheduled
                        </span>
                      )}
                      {quiz.status === 'completed' && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-success-soft text-success border border-emerald-200 dark:border-emerald-900/40">
                          Evaluated
                        </span>
                      )}
                    </div>

                    <h2 className="text-sm sm:text-base font-bold text-ink">
                      {quiz.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-ink-muted">
                      <span>Faculty: <strong className="text-ink font-medium">{quiz.facultyName}</strong></span>
                      <span>Duration: <strong className="font-mono text-ink">{quiz.durationMinutes} mins</strong></span>
                      <span>Total Marks: <strong className="font-mono text-ink">{quiz.totalMarks}</strong></span>
                      <span>Questions: <strong className="font-mono text-ink">{quiz.questionsCount || quiz.questions.length}</strong></span>
                    </div>
                  </div>

                  {/* Action / Result Pill */}
                  <div className="flex items-center gap-3 self-end md:self-center">
                    {quiz.status === 'active' && (
                      <Link
                        href={`/portal/student/quizzes/${quiz.id}`}
                        className="px-4 py-2 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 whitespace-nowrap"
                      >
                        Start assessment
                      </Link>
                    )}

                    {quiz.status === 'upcoming' && (
                      <button
                        disabled
                        className="px-4 py-2 rounded-md bg-paper-3 text-ink-muted text-xs font-medium cursor-not-allowed"
                      >
                        Starts next week
                      </button>
                    )}

                    {quiz.status === 'completed' && (
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-xs font-bold font-mono text-success">
                            {submission ? `${submission.score} / ${submission.totalMarks}` : `${quiz.totalMarks * 0.9} / ${quiz.totalMarks}`} Marks
                          </div>
                          <div className="text-[11px] text-ink-muted">
                            Score: {submission?.percentage || 90}% (Passed)
                          </div>
                        </div>
                        <Link
                          href={`/portal/student/quizzes/${quiz.id}`}
                          className="px-3.5 py-1.5 rounded-md border border-rule bg-paper hover:bg-paper-2 text-ink text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                        >
                          View answers
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
