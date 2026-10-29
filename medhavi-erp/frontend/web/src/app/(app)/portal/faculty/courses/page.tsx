'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MOCK_COURSES } from '@/features/portals/portals-mock-data';

/**
 * DESIGN BRIEF: Faculty Syllabus Progress & Lecture Materials Tracker
 * - Who uses: University professors monitoring academic schedule compliance against board-approved curriculum.
 * - Single most important thing: Track syllabus progress (% completed vs weeks remaining) and distribute approved slides.
 * - Visual direction: Clean curriculum dossier with modular progress meters and instant resource dispatch.
 * - Palette: Slate (`#0F172A`, `#334155`, `#F8FAFC`), Brand Ink (`#2563EB`), Emerald (`#059669`).
 * - Spacing & radius: 4px/8px rhythm, rounded-xl containers with subtle 1px border.
 */

export default function FacultyCoursesPage() {
  const [courses, setCourses] = useState(MOCK_COURSES);

  const handleToggleModule = (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId
          ? {
              ...c,
              modulesCompleted: Math.min(c.modulesCompleted + 1, c.totalModules),
            }
          : c
      )
    );
    alert('Syllabus progress updated and synchronized with Department HOD audit report.');
  };

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
                Autumn 2025-26 Session
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Curriculum Syllabus &amp; Lecture Materials
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Course unit deliverables, progress milestones, and lecture resources for assigned batches.
            </p>
          </div>

          <button
            type="button"
            onClick={() => alert('Lecture Handout uploaded to CS501')}
            className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
          >
            + Upload Lecture Notes / Slides
          </button>
        </div>
      </div>

      {/* Courses Cards Grid */}
      <div className="space-y-4">
        {courses.map((course) => {
          const progressPercent = Math.round((course.modulesCompleted / course.totalModules) * 100);

          return (
            <div
              key={course.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                      {course.code}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500">{course.credits} Credits</span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500">{course.schedule}</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {course.name}
                  </h2>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-[10px] font-semibold text-slate-400">
                      Syllabus Progress
                    </div>
                    <div className="text-base font-mono font-bold text-slate-900 dark:text-slate-100">
                      {course.modulesCompleted} / {course.totalModules} Units ({progressPercent}%)
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleModule(course.id)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
                  >
                    + Complete Next Unit
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-brand-600 h-2 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Module Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="text-slate-400 font-semibold text-[10px]">Lectures Delivered</div>
                  <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                    {course.attendedClasses} / {course.totalClasses} Hours
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="text-slate-400 font-semibold text-[10px]">Active Assignments</div>
                  <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                    {course.assignmentsCount} Published
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="text-slate-400 font-semibold text-[10px]">Room Allocated</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {course.room}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
