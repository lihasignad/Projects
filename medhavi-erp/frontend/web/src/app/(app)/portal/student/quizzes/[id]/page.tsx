'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { usePortalStore } from '@/features/portals/portal-store';

/**
 * DESIGN BRIEF: Interactive Quiz Runner & Evaluation View
 * - Who uses: Students taking timed computer-based assessments or reviewing faculty feedback.
 * - Single most important thing: Uninterrupted, focused question answering with prominent time-remaining & instant grade transparency synced to faculty grading desk.
 * - Visual direction: Focused, high-contrast examination canvas with sidebar question palette and crystal clear explanation cards.
 * - Palette: Slate (`#0F172A`, `#334155`, `#F8FAFC`), Brand Ink (`#2563EB`), Emerald (`#059669`), Crimson (`#DC2626`).
 * - Spacing & radius: 4px/8px grid, rounded-xl containers with subtle 1px border.
 */

export default function StudentQuizRunnerPage() {
  const params = useParams();
  const quizId = params?.id as string;

  const quizzes = usePortalStore((state) => state.quizzes);
  const studentProfile = usePortalStore((state) => state.studentProfile);
  const submitQuiz = usePortalStore((state) => state.submitQuiz);
  const quizSubmissions = usePortalStore((state) => state.quizSubmissions);

  // Fallback to active quiz if id not directly matched
  const quiz = quizzes.find((q) => q.id === quizId) || quizzes[0]!;
  const existingSub = quizSubmissions.find((s) => s.quizId === quiz.id);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>(
    existingSub?.answers || {}
  );
  const [secondsRemaining, setSecondsRemaining] = useState(quiz.durationMinutes * 60);
  const [isSubmitted, setIsSubmitted] = useState(quiz.status === 'completed' || !!existingSub);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (isSubmitted || secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, secondsRemaining]);

  const currentQ = quiz.questions[currentQuestionIndex] ?? quiz.questions[0]!;

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // Evaluation calculation
  const calculateResult = () => {
    let score = 0;
    quiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctOptionId) {
        score += q.points;
      }
    });
    const percentage = Math.round((score / quiz.totalMarks) * 100);
    const passed = score >= quiz.passingMarks;
    return { score, percentage, passed };
  };

  const { score, percentage, passed } = calculateResult();

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    setIsSubmitted(true);

    const res = calculateResult();
    submitQuiz({
      quizId: quiz.id,
      studentId: studentProfile.id,
      studentName: studentProfile.fullName,
      rollNo: studentProfile.rollNo,
      score: res.score,
      totalMarks: quiz.totalMarks,
      percentage: res.percentage,
      passed: res.passed,
      timeSpentSeconds: quiz.durationMinutes * 60 - secondsRemaining,
      answers: selectedAnswers,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Bar / Navigation and Timer */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Link
              href="/portal/student/quizzes"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
            >
              <span>Back to Assessments</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-xs font-mono text-slate-500">
              {quiz.subjectCode}, {quiz.batch}
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {quiz.title}
          </h1>
        </div>

        {/* Timer or Completion Badge */}
        {!isSubmitted ? (
          <div className="flex items-center space-x-3 self-end sm:self-auto">
            <div className="text-right">
              <div className="text-[10px] font-semibold text-slate-400">
                Time Remaining
              </div>
              <div
                className={`text-xl sm:text-2xl font-mono font-bold ${
                  secondsRemaining < 300
                    ? 'text-rose-600 dark:text-rose-400 animate-pulse motion-reduce:animate-none'
                    : 'text-slate-900 dark:text-slate-100'
                }`}
              >
                {formatTime(secondsRemaining)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-[0.99]"
            >
              Submit Assessment
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4 self-end sm:self-auto">
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                Score: {score} / {quiz.totalMarks} ({percentage}%)
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  passed
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                {passed ? 'PASSED · EVALUATION SYNCED' : 'RETEST REQUIRED'}
              </span>
            </div>
            <Link
              href="/portal/student/quizzes"
              className="px-3.5 py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold"
            >
              Return to Quizzes
            </Link>
          </div>
        )}
      </div>

      {/* Main Examination Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Area (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="text-xs font-bold text-brand-600 dark:text-brand-400 font-mono">
                QUESTION {currentQuestionIndex + 1} OF {quiz.questions.length}
              </div>
              <div className="text-xs font-mono font-semibold text-slate-500">
                {currentQ.points} Points
              </div>
            </div>

            {/* Prompt */}
            <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
              {currentQ.prompt}
            </div>

            {currentQ.codeSnippet && (
              <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto border border-slate-800">
                <code>{currentQ.codeSnippet}</code>
              </pre>
            )}

            {/* Options */}
            <div className="space-y-2.5 pt-2">
              {currentQ.options.map((opt, oIdx) => {
                const isSelected = selectedAnswers[currentQ.id] === opt.id;
                const isCorrect = opt.id === currentQ.correctOptionId;

                let optionStyles = 'border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:bg-slate-50 dark:hover:bg-slate-800/60';

                if (isSubmitted) {
                  if (isCorrect) {
                    optionStyles = 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100 font-semibold';
                  } else if (isSelected && !isCorrect) {
                    optionStyles = 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100';
                  } else {
                    optionStyles = 'border-slate-200 dark:border-slate-800 opacity-60';
                  }
                } else if (isSelected) {
                  optionStyles = 'border-brand-600 bg-brand-50/70 dark:bg-brand-950/40 text-brand-900 dark:text-brand-200 ring-2 ring-brand-500/20 font-semibold';
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isSubmitted}
                    onClick={() => handleSelectOption(currentQ.id, opt.id)}
                    className={`w-full text-left p-3.5 rounded-lg border text-xs sm:text-sm flex items-start space-x-3 transition-colors ${optionStyles}`}
                  >
                    <span className="font-mono font-bold text-slate-400 mt-0.5">
                      {String.fromCharCode(65 + oIdx)}.
                    </span>
                    <span className="flex-1">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Post-Submission Explanation */}
            {isSubmitted && (
              <div className="mt-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="font-bold text-slate-700 dark:text-slate-300">
                  Concept Explanation:
                </div>
                <div className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {currentQ.explanation}
                </div>
              </div>
            )}

            {/* Next / Previous Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Previous question
              </button>

              <button
                type="button"
                disabled={currentQuestionIndex === quiz.questions.length - 1}
                onClick={() => setCurrentQuestionIndex((prev) => Math.min(quiz.questions.length - 1, prev + 1))}
                className="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Next question
              </button>
            </div>
          </div>
        </div>

        {/* Question Palette Sidebar (1 Col) */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
            <div className="text-xs font-bold text-slate-400 font-medium">
              Question Palette
            </div>
            <div className="grid grid-cols-4 gap-2">
              {quiz.questions.map((q, idx) => {
                const isAnswered = !!selectedAnswers[q.id];
                const isCurrent = idx === currentQuestionIndex;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-9 rounded-lg font-mono text-xs font-bold transition-colors ${
                      isCurrent
                        ? 'ring-2 ring-brand-500 bg-brand-600 text-white shadow-sm'
                        : isAnswered
                        ? 'bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="text-[11px] space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded bg-brand-100 dark:bg-brand-900 inline-block"></span>
                <span>Answered ({Object.keys(selectedAnswers).length})</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded bg-slate-100 dark:bg-slate-800 inline-block"></span>
                <span>Unattempted ({quiz.questions.length - Object.keys(selectedAnswers).length})</span>
              </div>
            </div>

            {!isSubmitted && (
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="w-full mt-3 py-2 px-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
              >
                Submit Assessment
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Submit Assessment for Immediate Evaluation?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              You have answered <strong className="font-mono text-slate-900 dark:text-slate-100">{Object.keys(selectedAnswers).length}</strong> out of <strong className="font-mono text-slate-900 dark:text-slate-100">{quiz.questions.length}</strong> questions.
              Your evaluation will be recorded instantly and sent to your Instructor&apos;s evaluation workbench.
            </p>
            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
              >
                Return to Test
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-[0.99]"
              >
                Confirm &amp; Grade Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
