'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MOCK_QUIZZES } from '@/features/portals/portals-mock-data';

/**
 * DESIGN BRIEF: Interactive Quiz Runner & Evaluation View
 * - Who uses: Students taking timed computer-based assessments or reviewing faculty feedback.
 * - Single most important thing: Uninterrupted, focused question answering with prominent time-remaining & instant grade transparency.
 * - Visual direction: Focused, high-contrast examination canvas with sidebar question palette and crystal clear explanation cards.
 * - Palette: Slate (`#0F172A`, `#334155`, `#F8FAFC`), Brand Ink (`#2563EB`), Emerald (`#059669`), Crimson (`#DC2626`).
 * - Spacing & radius: 4px/8px grid, rounded-xl containers with subtle 1px border.
 */

export default function StudentQuizRunnerPage() {
  const params = useParams();
  const quizId = params?.id as string;

  // Fallback to active quiz if id not directly matched
  const quiz = MOCK_QUIZZES.find((q) => q.id === quizId) || MOCK_QUIZZES[0]!;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(quiz.durationMinutes * 60);
  const [isSubmitted, setIsSubmitted] = useState(quiz.status === 'completed');
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
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
            >
              Finish &amp; Submit
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4 self-end sm:self-auto">
            <div className="text-right">
              <div className="text-[10px] font-semibold text-slate-400">
                Assessment Score
              </div>
              <div className="text-xl sm:text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {score} / {quiz.totalMarks} Marks ({percentage}%)
              </div>
            </div>
            <span
              className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                passed
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
              }`}
            >
              {passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
            </span>
          </div>
        )}
      </div>

      {/* Main Runner Layout: Left Question Canvas + Right Question Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Cols: Active Question */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-5">
            {/* Question Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 font-medium">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]">
                {currentQ.points} Marks
              </span>
            </div>

            {/* Prompt Text */}
            <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
              {currentQ.prompt}
            </div>

            {/* Optional Code Snippet */}
            {currentQ.codeSnippet && (
              <pre className="p-3.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
                <code>{currentQ.codeSnippet}</code>
              </pre>
            )}

            {/* Multiple Choice Options */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt) => {
                const isSelected = selectedAnswers[currentQ.id] === opt.id;
                const isCorrect = isSubmitted && opt.id === currentQ.correctOptionId;
                const isWrongSelected = isSubmitted && isSelected && !isCorrect;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isSubmitted}
                    onClick={() => handleSelectOption(currentQ.id, opt.id)}
                    className={`w-full text-left p-3.5 rounded-lg border text-xs sm:text-sm transition-all flex items-start space-x-3 ${
                      isCorrect
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold'
                        : isWrongSelected
                        ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 line-through'
                        : isSelected
                        ? 'border-brand-600 bg-brand-50/60 dark:bg-brand-950/40 text-brand-900 dark:text-brand-200 font-medium'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <span
                      className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 mt-0.5 ${
                        isCorrect
                          ? 'bg-emerald-600 text-white'
                          : isWrongSelected
                          ? 'bg-rose-600 text-white'
                          : isSelected
                          ? 'bg-brand-600 text-white'
                          : 'border border-slate-300 dark:border-slate-600 text-slate-500'
                      }`}
                    >
                      {opt.id.replace('opt', '').replace('o', '')}
                    </span>
                    <span className="flex-1">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation Box if Submitted */}
            {isSubmitted && (
              <div className="mt-4 p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                <div className="font-bold text-emerald-900 dark:text-emerald-300">
                  Faculty Explanation:
                </div>
                <div className="text-emerald-800 dark:text-emerald-200 leading-relaxed">
                  {currentQ.explanation}
                </div>
              </div>
            )}

            {/* Prev / Next Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
              >
                Previous Question
              </button>

              <div className="text-xs text-slate-400 font-mono">
                {currentQuestionIndex + 1} / {quiz.questions.length}
              </div>

              <button
                type="button"
                disabled={currentQuestionIndex === quiz.questions.length - 1}
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
              >
                Next Question
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Question Palette */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 font-medium">
              Question Palette
            </h2>

            <div className="grid grid-cols-4 gap-2">
              {quiz.questions.map((q, idx) => {
                const isCurrent = idx === currentQuestionIndex;
                const isAnswered = !!selectedAnswers[q.id];
                const isCorrect = isSubmitted && selectedAnswers[q.id] === q.correctOptionId;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-10 rounded-lg text-xs font-bold font-mono transition-colors flex items-center justify-center ${
                      isSubmitted
                        ? isCorrect
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white'
                        : isCurrent
                        ? 'bg-brand-600 text-white ring-2 ring-brand-400 ring-offset-2 dark:ring-offset-slate-900'
                        : isAnswered
                        ? 'bg-brand-100 dark:bg-brand-900 text-brand-800 dark:text-brand-200'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Q{idx + 1}
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
                className="w-full mt-3 py-2 px-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                Submit Assessment
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Submit Assessment for Evaluation?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              You have answered <strong className="font-mono text-slate-900 dark:text-slate-100">{Object.keys(selectedAnswers).length}</strong> out of <strong className="font-mono text-slate-900 dark:text-slate-100">{quiz.questions.length}</strong> questions. Once submitted, answers cannot be edited.
            </p>
            <div className="flex justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
              >
                Return to Test
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setIsSubmitted(true);
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
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
