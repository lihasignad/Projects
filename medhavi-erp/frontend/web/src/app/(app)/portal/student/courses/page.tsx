'use client';

import { useState } from 'react';
import { MOCK_COURSES } from '@/features/portals/portals-mock-data';

/**
 * DESIGN BRIEF: Student Courses & LMS Learning Materials
 * - Who uses: Students accessing syllabi, lecture handouts, code repositories, and slide decks.
 * - Single most important thing: Track modular progress and download course resources without hunting across folders.
 * - Visual direction: Clean course dossier with progress meters and dedicated resource download rows.
 * - Palette: Slate (`#0F172A`, `#334155`, `#F8FAFC`), Brand Ink (`#2563EB`), Emerald (`#059669`).
 * - Spacing & radius: 4px/8px grid, rounded-xl containers with subtle 1px border.
 */

export default function StudentCoursesPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(MOCK_COURSES[0]!.id);
  const selectedCourse = MOCK_COURSES.find((c) => c.id === selectedCourseId) || MOCK_COURSES[0]!;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]">
              Learning Management System
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Enrolled Courses &amp; Modules
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Access approved course syllabi, lecture presentations, and reference material for Semester 5.
            </p>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {MOCK_COURSES.length} Active Courses Enrolled
          </div>
        </div>
      </div>

      {/* Course Selection Horizontal Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {MOCK_COURSES.map((course) => {
          const isSelected = course.id === selectedCourseId;
          return (
            <button
              key={course.id}
              type="button"
              onClick={() => setSelectedCourseId(course.id)}
              className={`px-4 py-2.5 rounded-lg border text-xs font-medium whitespace-nowrap transition-colors flex items-center space-x-2 ${
                isSelected
                  ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="font-mono">{course.code}</span>
              <span className="text-slate-400">·</span>
              <span>{course.name}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Course Detail Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold font-mono text-brand-600 dark:text-brand-400">
                {selectedCourse.code}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500">{selectedCourse.credits} Credits</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500">Room: {selectedCourse.room}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
              {selectedCourse.name}
            </h2>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Faculty: <strong className="text-slate-800 dark:text-slate-200">{selectedCourse.facultyName}</strong> ({selectedCourse.facultyDesignation})
            </div>
          </div>

          <div className="flex items-center space-x-6 text-xs font-mono">
            <div>
              <div className="text-[10px] font-semibold text-slate-400">Attendance</div>
              <div
                className={`text-base font-bold ${
                  selectedCourse.attendancePercentage >= 75
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {selectedCourse.attendancePercentage}%
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-400">Modules Completed</div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                {selectedCourse.modulesCompleted} / {selectedCourse.totalModules}
              </div>
            </div>
          </div>
        </div>

        {/* Modules List */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 font-medium">
            Curriculum Units &amp; Study Materials
          </h3>

          {selectedCourse.modules.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
              Module resources for {selectedCourse.code} are currently being updated by the department.
            </div>
          ) : (
            selectedCourse.modules.map((mod, idx) => (
              <div
                key={mod.id}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-900 text-brand-800 dark:text-brand-200 font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]">
                      UNIT {idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                      {mod.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      {mod.description}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-500">{mod.hours} Teaching Hours</span>
                </div>

                {/* Resource Links */}
                {mod.resources.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                    {mod.resources.map((res) => (
                      <div
                        key={res.id}
                        className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]">
                            {res.type}
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {res.title}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-[11px] font-mono text-slate-400">{res.fileSize}</span>
                          <button
                            type="button"
                            onClick={() => alert(`Downloading ${res.title}`)}
                            className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
