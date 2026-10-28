'use client';

import { MOCK_STUDENT, MOCK_COURSES } from '@/features/portals/portals-mock-data';

/**
 * DESIGN BRIEF: Student 360° Profile Dossier
 * - Who uses: Student reviewing university registration, academic standing, and official records.
 * - Single most important thing: High-integrity view of verified credentials, CGPA, advisor, and contact records.
 * - Visual direction: Authoritative, paper-inspired administrative dossier with clear data segmentation.
 * - Palette: Slate (`#0F172A`, `#334155`, `#F8FAFC`), Emerald (`#059669` verified status), Ink Blue (`#1E40AF`).
 * - Spacing & radius: 4px/8px rhythm, rounded-lg and rounded-xl containers.
 */

export default function StudentProfilePage() {
  return (
    <div className="space-y-6">
      {/* Profile Header Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
          <div className="h-20 w-20 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold text-2xl shadow-md border-2 border-white dark:border-slate-800">
            {MOCK_STUDENT.fullName.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {MOCK_STUDENT.fullName}
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]">
                Verified Student
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Roll: {MOCK_STUDENT.rollNo}
              </span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {MOCK_STUDENT.program}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {MOCK_STUDENT.school}, {MOCK_STUDENT.department}
            </div>
          </div>
          <div className="text-right sm:border-l sm:border-slate-200 sm:dark:border-slate-800 sm:pl-6">
            <div className="text-[10px] font-semibold text-slate-400">
              Cumulative CGPA
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
              {MOCK_STUDENT.cgpa}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {MOCK_STUDENT.creditsEarned} Credits Earned
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Academic Information & Personal Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Academic Credentials */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 font-medium">
              Academic Registration &amp; Batch
            </h2>
            <dl className="grid grid-cols-2 gap-y-3 text-xs">
              <div>
                <dt className="text-slate-500 dark:text-slate-400">University Enrollment No</dt>
                <dd className="font-mono font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {MOCK_STUDENT.enrollmentNo}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Current Semester</dt>
                <dd className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  Semester {MOCK_STUDENT.semester}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Academic Year</dt>
                <dd className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {MOCK_STUDENT.academicYear}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Batch Code</dt>
                <dd className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {MOCK_STUDENT.batch}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Overall Attendance</dt>
                <dd className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {MOCK_STUDENT.attendancePercentage}% (Eligible)
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Category / Quota</dt>
                <dd className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {MOCK_STUDENT.category}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 font-medium">
              Faculty Advisor &amp; Mentorship
            </h2>
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
              <div className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-sm">
                AR
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-900 dark:text-slate-100">
                  {MOCK_STUDENT.advisorName}
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  Associate Professor, CSE
                </div>
                <div className="text-brand-600 dark:text-brand-400 font-mono mt-0.5">
                  {MOCK_STUDENT.advisorEmail}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Your faculty advisor handles semester course registrations, elective approvals, and academic grievance escalation.
            </p>
          </div>
        </div>

        {/* Right Column: Personal Details & Registered Courses */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 font-medium">
              Contact &amp; Personal Information
            </h2>
            <dl className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <dt className="text-slate-500 dark:text-slate-400">Email Address</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-100">{MOCK_STUDENT.email}</dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <dt className="text-slate-500 dark:text-slate-400">Mobile Number</dt>
                <dd className="font-mono text-slate-900 dark:text-slate-100">{MOCK_STUDENT.phone}</dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <dt className="text-slate-500 dark:text-slate-400">Blood Group</dt>
                <dd className="font-mono font-semibold text-slate-900 dark:text-slate-100">{MOCK_STUDENT.bloodGroup}</dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <dt className="text-slate-500 dark:text-slate-400">Guardian / Parent</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-100">{MOCK_STUDENT.guardianName}</dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <dt className="text-slate-500 dark:text-slate-400">Guardian Contact</dt>
                <dd className="font-mono text-slate-900 dark:text-slate-100">{MOCK_STUDENT.guardianPhone}</dd>
              </div>
              <div className="pt-1">
                <dt className="text-slate-500 dark:text-slate-400 mb-1">Permanent Residential Address</dt>
                <dd className="text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                  {MOCK_STUDENT.address}
                </dd>
              </div>
            </dl>
          </div>

          {/* Enrolled Courses Summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
            <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 font-medium">
              Semester 5 Enrolled Subjects ({MOCK_COURSES.length})
            </h2>
            <div className="space-y-2">
              {MOCK_COURSES.map((course) => (
                <div
                  key={course.id}
                  className="p-2.5 rounded border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-brand-600 dark:text-brand-400 mr-2">
                      {course.code}
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {course.name}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">
                    {course.credits} Credits
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
