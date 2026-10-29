'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface StudentExamResult {
  id: string;
  studentId: string;
  rollNumber: string;
  studentName: string;
  program: string;
  semester: number;
  batch: string;
  session: string;
  totalCredits: number;
  marksObtained: number;
  totalMaxMarks: number;
  percentage: number;
  sgpa: number;
  cgpa: number;
  status: 'DISTINCTION' | 'FIRST_CLASS' | 'PASS' | 'SUPPLEMENTARY' | 'WITHHELD';
  publishedDate: string;
}

const SAMPLE_RESULTS: StudentExamResult[] = [
  {
    id: 'res-001',
    studentId: 'std-001',
    rollNumber: 'DEMO/2024/BCSE042',
    studentName: 'Aarav Sharma',
    program: 'B.Tech Computer Science & Engineering',
    semester: 3,
    batch: '2024-2028',
    session: 'End-Term Dec 2024',
    totalCredits: 17,
    marksObtained: 449,
    totalMaxMarks: 500,
    percentage: 89.8,
    sgpa: 8.80,
    cgpa: 8.64,
    status: 'DISTINCTION',
    publishedDate: '2025-01-10',
  },
  {
    id: 'res-002',
    studentId: 'std-002',
    rollNumber: 'DEMO/2024/BCSE048',
    studentName: 'Priya Bhutia',
    program: 'B.Tech Computer Science & Engineering',
    semester: 3,
    batch: '2024-2028',
    session: 'End-Term Dec 2024',
    totalCredits: 17,
    marksObtained: 362,
    totalMaxMarks: 500,
    percentage: 72.4,
    sgpa: 7.20,
    cgpa: 7.42,
    status: 'FIRST_CLASS',
    publishedDate: '2025-01-10',
  },
  {
    id: 'res-003',
    studentId: 'std-003',
    rollNumber: 'DEMO/2023/BDES015',
    studentName: 'Tashi Namgyal',
    program: 'B.Des Product & Industrial Design',
    semester: 5,
    batch: '2023-2027',
    session: 'End-Term Dec 2024',
    totalCredits: 18,
    marksObtained: 472,
    totalMaxMarks: 500,
    percentage: 94.4,
    sgpa: 9.40,
    cgpa: 9.15,
    status: 'DISTINCTION',
    publishedDate: '2025-01-10',
  },
  {
    id: 'res-004',
    studentId: 'std-004',
    rollNumber: 'DEMO/2023/BDES022',
    studentName: 'Rohan Verma',
    program: 'B.Des Product & Industrial Design',
    semester: 5,
    batch: '2023-2027',
    session: 'End-Term Dec 2024',
    totalCredits: 18,
    marksObtained: 285,
    totalMaxMarks: 500,
    percentage: 57.0,
    sgpa: 5.60,
    cgpa: 6.10,
    status: 'SUPPLEMENTARY',
    publishedDate: '2025-01-10',
  },
  {
    id: 'res-005',
    studentId: 'std-005',
    rollNumber: 'DEMO/2024/MBA009',
    studentName: 'Ananya Chetri',
    program: 'MBA Vocational & Entrepreneurship',
    semester: 1,
    batch: '2024-2026',
    session: 'End-Term Dec 2024',
    totalCredits: 20,
    marksObtained: 418,
    totalMaxMarks: 500,
    percentage: 83.6,
    sgpa: 8.40,
    cgpa: 8.40,
    status: 'DISTINCTION',
    publishedDate: '2025-01-10',
  },
];

export default function ExaminationResultsPage() {
  const [selectedProgram, setSelectedProgram] = useState<string>('ALL');
  const [selectedSession, setSelectedSession] = useState<string>('End-Term Dec 2024');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedResult, setSelectedResult] = useState<StudentExamResult | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const filteredResults = useMemo(() => {
    return SAMPLE_RESULTS.filter((item) => {
      if (selectedProgram !== 'ALL' && item.program !== selectedProgram) return false;
      if (selectedSession !== 'ALL' && item.session !== selectedSession) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.studentName.toLowerCase().includes(query);
        const matchesRoll = item.rollNumber.toLowerCase().includes(query);
        if (!matchesName && !matchesRoll) return false;
      }
      return true;
    });
  }, [selectedProgram, selectedSession, searchQuery]);

  const stats = useMemo(() => {
    const total = filteredResults.length;
    if (total === 0) return { total: 0, passed: 0, passPct: 0, avgSgpa: 0, distinctions: 0 };
    const passed = filteredResults.filter((r) => r.status !== 'SUPPLEMENTARY' && r.status !== 'WITHHELD').length;
    const distinctions = filteredResults.filter((r) => r.status === 'DISTINCTION').length;
    const avgSgpa = filteredResults.reduce((acc, curr) => acc + curr.sgpa, 0) / total;
    return {
      total,
      passed,
      passPct: Math.round((passed / total) * 100),
      avgSgpa: Number(avgSgpa.toFixed(2)),
      distinctions,
    };
  }, [filteredResults]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
            <Link href="/examination/marks-entry" className="hover:text-brand-600">
              Examination
            </Link>
            <span>/</span>
            <span>Results & Transcripts</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
            Official Examination Results & Grade Cards
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tabulation registers, SGPA/CGPA evaluation, and transcript publication
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/examination/marks-entry"
            className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-colors"
          >
            ← Marks Entry
          </Link>
          <button
            type="button"
            onClick={() => {
              setSuccessMsg('Broadsheet and Grade Cards generated successfully for batch export.');
            }}
            className="px-3 py-1.5 rounded bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            Publish Broadsheet
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex justify-between items-center">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 normal-case">Total Evaluated</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {stats.total}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Across filtered session</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 normal-case">Pass Percentage</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.passPct}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{stats.passed} passed cleanly</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 normal-case">Batch Average SGPA</div>
          <div className="text-2xl font-bold font-mono text-brand-600 dark:text-brand-400 mt-1">
            {stats.avgSgpa}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Scale of 10.0</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 normal-case">Distinctions</div>
          <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
            {stats.distinctions}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">SGPA ≥ 8.00</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-medium focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">All Exam Sessions</option>
            <option value="End-Term Dec 2024">End-Term Dec 2024</option>
            <option value="Mid-Term Oct 2024">Mid-Term Oct 2024</option>
            <option value="End-Term May 2024">End-Term May 2024</option>
          </select>

          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-medium focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">All Academic Programs</option>
            <option value="B.Tech Computer Science & Engineering">B.Tech CSE</option>
            <option value="B.Des Product & Industrial Design">B.Des Industrial Design</option>
            <option value="MBA Vocational & Entrepreneurship">MBA Vocational</option>
          </select>
        </div>

        <div className="w-full md:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name or roll..."
            className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs font-semibold normal-case text-slate-500">
                <th className="py-3 px-4">Roll No & Student</th>
                <th className="py-3 px-4">Program & Sem</th>
                <th className="py-3 px-4 text-center">Marks (Total)</th>
                <th className="py-3 px-4 text-center">Percentage</th>
                <th className="py-3 px-4 text-center">SGPA</th>
                <th className="py-3 px-4 text-center">CGPA</th>
                <th className="py-3 px-4 text-center">Standing</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No results match the selected program or session filter.
                  </td>
                </tr>
              ) : (
                filteredResults.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                        {res.rollNumber}
                      </div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                        {res.studentName}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{res.program}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Sem {res.semester} • {res.session}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {res.marksObtained} / {res.totalMaxMarks}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-900 dark:text-slate-100">
                      {res.percentage}%
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-brand-600 dark:text-brand-400">
                      {res.sgpa}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                      {res.cgpa}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          res.status === 'DISTINCTION'
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                            : res.status === 'FIRST_CLASS' || res.status === 'PASS'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {res.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedResult(res)}
                        className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                      >
                        Grade Card
                      </button>
                      <Link
                        href={`/students/${res.studentId}`}
                        className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                      >
                        Profile
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade Card Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {selectedResult.studentName}: Official Statement of Marks
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Roll: {selectedResult.rollNumber}, {selectedResult.session}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedResult(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs">
              <div>
                <div className="text-slate-500 text-xs normal-case font-semibold">Semester GPA</div>
                <div className="font-mono font-bold text-base text-brand-600 dark:text-brand-400 mt-0.5">
                  {selectedResult.sgpa}
                </div>
              </div>
              <div>
                <div className="text-slate-500 text-xs normal-case font-semibold">Cumulative GPA</div>
                <div className="font-mono font-bold text-base text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedResult.cgpa}
                </div>
              </div>
              <div>
                <div className="text-slate-500 text-xs normal-case font-semibold">Classification</div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {selectedResult.status}
                </div>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-bold text-[11px] text-slate-500">
                  <tr>
                    <th className="py-2 px-3">Subject</th>
                    <th className="py-2 px-3 text-center">Credits</th>
                    <th className="py-2 px-3 text-center">Marks</th>
                    <th className="py-2 px-3 text-right">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-2 px-3 font-medium">CS301 Data Structures & Algorithms</td>
                    <td className="py-2 px-3 text-center font-mono">4</td>
                    <td className="py-2 px-3 text-center font-mono">90/100</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-brand-600">A+</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">CS302 Computer Architecture</td>
                    <td className="py-2 px-3 text-center font-mono">4</td>
                    <td className="py-2 px-3 text-center font-mono">83/100</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-brand-600">A</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">CS303 Discrete Mathematics</td>
                    <td className="py-2 px-3 text-center font-mono">3</td>
                    <td className="py-2 px-3 text-center font-mono">87/100</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-brand-600">A+</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">CS304 OOP with Java</td>
                    <td className="py-2 px-3 text-center font-mono">4</td>
                    <td className="py-2 px-3 text-center font-mono">93/100</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-brand-600">O</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">CS305P DSA Practical Lab</td>
                    <td className="py-2 px-3 text-center font-mono">2</td>
                    <td className="py-2 px-3 text-center font-mono">93/100</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-brand-600">O</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-mono">
                Digitally Signed by Controller of Examinations
              </span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Print Grade Card
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedResult(null)}
                  className="px-4 py-1.5 rounded bg-brand-600 text-white text-xs font-semibold shadow hover:bg-brand-700"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
