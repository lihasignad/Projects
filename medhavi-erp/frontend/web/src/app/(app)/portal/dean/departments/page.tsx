'use client';

import Link from 'next/link';

interface DepartmentScorecard {
  id: string;
  code: string;
  name: string;
  hodName: string;
  studentsCount: number;
  facultyCount: number;
  studentFacultyRatio: number;
  passPercentage: number;
  attendancePercentage: number;
  researchPublications: number;
  placementPercentage: number;
}

const DEPARTMENTS_DATA: DepartmentScorecard[] = [
  {
    id: 'dept-cse',
    code: 'CSE',
    name: 'Department of Computer Science & Engineering',
    hodName: 'Dr. Meenakshi Sundaram',
    studentsCount: 480,
    facultyCount: 24,
    studentFacultyRatio: 20.0,
    passPercentage: 96.2,
    attendancePercentage: 86.4,
    researchPublications: 42,
    placementPercentage: 94.0,
  },
  {
    id: 'dept-ece',
    code: 'ECE',
    name: 'Department of Electronics & Communication Engineering',
    hodName: 'Dr. Suresh Varma',
    studentsCount: 360,
    facultyCount: 20,
    studentFacultyRatio: 18.0,
    passPercentage: 94.8,
    attendancePercentage: 84.1,
    researchPublications: 28,
    placementPercentage: 88.5,
  },
  {
    id: 'dept-mech',
    code: 'MECH',
    name: 'Department of Mechanical Engineering',
    hodName: 'Dr. P.K. Roy',
    studentsCount: 320,
    facultyCount: 18,
    studentFacultyRatio: 17.7,
    passPercentage: 91.5,
    attendancePercentage: 82.9,
    researchPublications: 19,
    placementPercentage: 82.0,
  },
  {
    id: 'dept-civil',
    code: 'CIVIL',
    name: 'Department of Civil Engineering',
    hodName: 'Dr. Sunita Bhattacharya',
    studentsCount: 260,
    facultyCount: 16,
    studentFacultyRatio: 16.2,
    passPercentage: 92.0,
    attendancePercentage: 81.5,
    researchPublications: 14,
    placementPercentage: 79.4,
  },
];

/**
 * DESIGN BRIEF: Dean's Cross-Department Performance Matrix
 * - Who uses: Dean evaluating departmental standing across academic, research, and placement benchmarks.
 * - Single most important thing: Objective cross-department comparison to direct faculty hiring and student remediation resources.
 * - Visual direction: Clean institutional scorecard with high-clarity tabular benchmarks.
 * - Palette: Slate (`#0F172A`, `#334155`, `#F8FAFC`), Deep Brand Navy (`#1E3A8A`), Emerald (`#059669`).
 * - Spacing & radius: 4px/8px rhythm, rounded-xl containers with subtle 1px border.
 */

export default function DeanDepartmentsMatrixPage() {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Link
                href="/portal/dean"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Dean&apos;s Office
              </Link>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-xs text-slate-500">
                School of Engineering &amp; Technology
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Departments Performance &amp; Accreditation Matrix
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive academic audits, student-faculty ratios, examination results, and research citations.
            </p>
          </div>

          <div className="text-xs text-slate-500">
            4 Departments Evaluated
          </div>
        </div>
      </div>

      {/* Departments Scorecard Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Comparative Departmental KPI Ledger
          </h2>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            All Departments Above AICTE Minimum Threshold
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-500 font-semibold">
                <th className="px-4 py-3">Department &amp; Head</th>
                <th className="px-4 py-3 text-right">Students</th>
                <th className="px-4 py-3 text-right">Faculty</th>
                <th className="px-4 py-3 text-right">SFR Ratio</th>
                <th className="px-4 py-3 text-right">Pass %</th>
                <th className="px-4 py-3 text-right">Attendance %</th>
                <th className="px-4 py-3 text-right">Publications</th>
                <th className="px-4 py-3 text-right">Placement %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {DEPARTMENTS_DATA.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-brand-600 dark:text-brand-400 text-xs">
                        {dept.code}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {dept.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      HOD: {dept.hodName}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-800 dark:text-slate-200 font-semibold">
                    {dept.studentsCount}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-800 dark:text-slate-200">
                    {dept.facultyCount}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                    1:{dept.studentFacultyRatio.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {dept.passPercentage}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {dept.attendancePercentage}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-800 dark:text-slate-200">
                    {dept.researchPublications} Papers
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {dept.placementPercentage}%
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
