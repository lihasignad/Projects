'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/shared/stores/auth-store';

interface Program {
  id: string;
  code: string;
  title: string;
  department: string;
  degreeType: 'UNDERGRADUATE' | 'POSTGRADUATE' | 'DIPLOMA';
  durationYears: number;
  totalCredits: number;
  activeBatches: number;
  totalStudents: number;
  coordinator: string;
  status: 'ACTIVE' | 'ARCHIVED';
}

interface CourseSubject {
  id: string;
  code: string;
  name: string;
  program: string;
  semester: number;
  credits: number;
  type: 'THEORY' | 'PRACTICAL_LAB' | 'WORKSHOP_STUDIO';
  faculty: string;
}

const INITIAL_PROGRAMS: Program[] = [
  {
    id: 'prog-1',
    code: 'BTECH-CSE',
    title: 'Bachelor of Technology in Computer Science & Engineering',
    department: 'School of Computing & AI',
    degreeType: 'UNDERGRADUATE',
    durationYears: 4,
    totalCredits: 160,
    activeBatches: 4,
    totalStudents: 240,
    coordinator: 'Dr. Ramesh Sharma',
    status: 'ACTIVE',
  },
  {
    id: 'prog-2',
    code: 'BDES-PID',
    title: 'Bachelor of Design in Product & Industrial Design',
    department: 'School of Design & Creative Arts',
    degreeType: 'UNDERGRADUATE',
    durationYears: 4,
    totalCredits: 164,
    activeBatches: 3,
    totalStudents: 110,
    coordinator: 'Prof. Sonam Bhutia',
    status: 'ACTIVE',
  },
  {
    id: 'prog-3',
    code: 'MBA-VOC',
    title: 'Master of Business Administration in Vocational Entrepreneurship',
    department: 'School of Management & Enterprise',
    degreeType: 'POSTGRADUATE',
    durationYears: 2,
    totalCredits: 96,
    activeBatches: 2,
    totalStudents: 75,
    coordinator: 'Dr. Anandita Roy',
    status: 'ACTIVE',
  },
  {
    id: 'prog-4',
    code: 'DIP-HOSP',
    title: 'Advanced Diploma in Applied Hospitality & Tourism',
    department: 'School of Hospitality Services',
    degreeType: 'DIPLOMA',
    durationYears: 3,
    totalCredits: 90,
    activeBatches: 3,
    totalStudents: 95,
    coordinator: 'Chef Karma Lepcha',
    status: 'ACTIVE',
  },
];

const INITIAL_COURSES: CourseSubject[] = [
  {
    id: 'crs-1',
    code: 'CS301',
    name: 'Data Structures & Algorithms',
    program: 'B.Tech CSE',
    semester: 3,
    credits: 4,
    type: 'THEORY',
    faculty: 'Prof. S. Sharma',
  },
  {
    id: 'crs-2',
    code: 'CS301L',
    name: 'Data Structures Lab & Practical Problem Solving',
    program: 'B.Tech CSE',
    semester: 3,
    credits: 2,
    type: 'PRACTICAL_LAB',
    faculty: 'Prof. S. Sharma',
  },
  {
    id: 'crs-3',
    code: 'CS302',
    name: 'Computer Architecture & Microprocessors',
    program: 'B.Tech CSE',
    semester: 3,
    credits: 3,
    type: 'THEORY',
    faculty: 'Dr. R. Subba',
  },
  {
    id: 'crs-4',
    code: 'DES201',
    name: 'Ergonomics & Human-Centered Design',
    program: 'B.Des Product Design',
    semester: 3,
    credits: 4,
    type: 'WORKSHOP_STUDIO',
    faculty: 'Prof. Sonam Bhutia',
  },
  {
    id: 'crs-5',
    code: 'MBA102',
    name: 'Financial Accounting & Cost Management',
    program: 'MBA Vocational',
    semester: 1,
    credits: 3,
    type: 'THEORY',
    faculty: 'Dr. Anandita Roy',
  },
];

export default function AcademicsPage() {
  const selectedInstitute = useAuthStore((state) => state.selectedInstitute);

  const [activeTab, setActiveTab] = useState<'PROGRAMS' | 'COURSES' | 'TERMS'>('PROGRAMS');
  const [programs, setPrograms] = useState<Program[]>(INITIAL_PROGRAMS);
  const [courses, setCourses] = useState<CourseSubject[]>(INITIAL_COURSES);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Program Modal State
  const [isAddProgramOpen, setIsAddProgramOpen] = useState(false);
  const [newProgTitle, setNewProgTitle] = useState('');
  const [newProgCode, setNewProgCode] = useState('');
  const [newProgDept, setNewProgDept] = useState('School of Computing & AI');
  const [newProgDuration, setNewProgDuration] = useState(4);
  const [newProgCredits, setNewProgCredits] = useState(160);
  const [newProgCoordinator, setNewProgCoordinator] = useState('');

  const handleAddProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgTitle || !newProgCode) return;

    const newProg: Program = {
      id: `prog-${Date.now()}`,
      code: newProgCode.toUpperCase(),
      title: newProgTitle,
      department: newProgDept,
      degreeType: newProgDuration >= 4 ? 'UNDERGRADUATE' : newProgDuration === 2 ? 'POSTGRADUATE' : 'DIPLOMA',
      durationYears: Number(newProgDuration),
      totalCredits: Number(newProgCredits),
      activeBatches: 1,
      totalStudents: 30,
      coordinator: newProgCoordinator || 'Assigned HOD',
      status: 'ACTIVE',
    };

    setPrograms([...programs, newProg]);
    setIsAddProgramOpen(false);
    setNewProgTitle('');
    setNewProgCode('');
    setNewProgCoordinator('');
  };

  const filteredPrograms = programs.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.program.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Page Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Academics & Curricula
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Session 2025-26
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Degree programs, semester course catalogs and academic structure for {selectedInstitute?.name || 'Medhavi Skills University'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <Link
            href="/academics/timetables"
            className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="w-3.5 h-3.5 mr-1.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Weekly Timetable Matrix &rarr;
          </Link>

          <button
            type="button"
            onClick={() => setIsAddProgramOpen(true)}
            className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors"
          >
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Degree Program
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('PROGRAMS')}
          className={`pb-2.5 transition-colors border-b-2 ${
            activeTab === 'PROGRAMS'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Degree Programs ({programs.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('COURSES')}
          className={`pb-2.5 transition-colors border-b-2 ${
            activeTab === 'COURSES'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Course Catalog & Syllabi ({courses.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('TERMS')}
          className={`pb-2.5 transition-colors border-b-2 ${
            activeTab === 'TERMS'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Academic Calendar & Terms
        </button>
      </div>

      {/* Search / Filter */}
      <div className="flex items-center justify-between gap-3">
        <div className="w-full max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'PROGRAMS' ? 'Search programs or degree codes...' : 'Search course subjects or faculty...'}
            className="w-full h-9 px-3 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* TAB 1: PROGRAMS */}
      {activeTab === 'PROGRAMS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPrograms.map((prog) => (
            <div
              key={prog.id}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-brand-500/50 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                    {prog.code}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    {prog.degreeType}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {prog.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {prog.department}
                </p>

                <div className="grid grid-cols-3 gap-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3 mt-4">
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase">Duration</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{prog.durationYears} Years</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase">Credits</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{prog.totalCredits} Cr</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase">Enrollment</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{prog.totalStudents} Students</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Coordinator: <span className="font-medium text-slate-800 dark:text-slate-200">{prog.coordinator}</span>
                </span>
                <Link
                  href="/academics/timetables"
                  className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  View Schedule &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: COURSES */}
      {activeTab === 'COURSES' && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 sm:px-4">Course Code</th>
                  <th className="py-2.5 px-3 sm:px-4">Subject Name</th>
                  <th className="py-2.5 px-3 sm:px-4">Program</th>
                  <th className="py-2.5 px-3 sm:px-4">Semester</th>
                  <th className="py-2.5 px-3 sm:px-4">Credits</th>
                  <th className="py-2.5 px-3 sm:px-4">Type</th>
                  <th className="py-2.5 px-3 sm:px-4">Faculty In-charge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCourses.map((crs) => (
                  <tr key={crs.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 sm:px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {crs.code}
                    </td>
                    <td className="py-3 px-3 sm:px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {crs.name}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-slate-600 dark:text-slate-300">{crs.program}</td>
                    <td className="py-3 px-3 sm:px-4 font-mono font-medium">Sem {crs.semester}</td>
                    <td className="py-3 px-3 sm:px-4 font-mono font-bold">{crs.credits} Cr</td>
                    <td className="py-3 px-3 sm:px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {crs.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {crs.faculty}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ACADEMIC TERMS */}
      {activeTab === 'TERMS' && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Active University Academic Term: Monsoon Session 2025-2026
            </h3>
            <p className="text-xs text-slate-500">
              Authorized under Academic Council Order AC/2025/R-04 for Medhavi Skills University
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Term Duration</span>
              <div className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">
                July 15, 2025 &mdash; Dec 20, 2025
              </div>
              <p className="text-slate-500 text-[11px] mt-1">18 Teaching Weeks + 2 Examination Weeks</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Mid-Term Assessment</span>
              <div className="font-bold text-sm text-amber-600 dark:text-amber-400 mt-1">
                Sept 22, 2025 &mdash; Sept 30, 2025
              </div>
              <p className="text-slate-500 text-[11px] mt-1">Continuous internal evaluation window</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">End-Term Final Examinations</span>
              <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                Dec 01, 2025 &mdash; Dec 18, 2025
              </div>
              <p className="text-slate-500 text-[11px] mt-1">Practical jury, theory papers & result publication</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Program */}
      {isAddProgramOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 max-w-lg w-full text-slate-900 dark:text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setIsAddProgramOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              aria-label="Close dialog"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-base font-bold mb-1">Add Academic Degree Program</h3>
            <p className="text-xs text-slate-500 mb-4">
              Register a new degree program under the university academic roster.
            </p>

            <form onSubmit={handleAddProgram} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Program Title *
                </label>
                <input
                  type="text"
                  required
                  value={newProgTitle}
                  onChange={(e) => setNewProgTitle(e.target.value)}
                  placeholder="e.g. B.Sc in Medical Laboratory Technology"
                  className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Program Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProgCode}
                    onChange={(e) => setNewProgCode(e.target.value)}
                    placeholder="e.g. BSC-MLT"
                    className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 uppercase font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    School / Department
                  </label>
                  <select
                    value={newProgDept}
                    onChange={(e) => setNewProgDept(e.target.value)}
                    className="w-full h-9 px-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="School of Computing & AI">School of Computing & AI</option>
                    <option value="School of Design & Creative Arts">School of Design & Creative Arts</option>
                    <option value="School of Management & Enterprise">School of Management & Enterprise</option>
                    <option value="School of Hospitality Services">School of Hospitality Services</option>
                    <option value="School of Health & Allied Sciences">School of Health & Allied Sciences</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Duration (Years)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={newProgDuration}
                    onChange={(e) => setNewProgDuration(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Total Credits
                  </label>
                  <input
                    type="number"
                    min={40}
                    max={240}
                    value={newProgCredits}
                    onChange={(e) => setNewProgCredits(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Program Coordinator / HOD
                </label>
                <input
                  type="text"
                  value={newProgCoordinator}
                  onChange={(e) => setNewProgCoordinator(e.target.value)}
                  placeholder="e.g. Dr. K. K. Sharma"
                  className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddProgramOpen(false)}
                  className="px-3 py-2 rounded border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow"
                >
                  Register Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
