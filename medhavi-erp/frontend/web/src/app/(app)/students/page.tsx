'use client';

import { useState, useMemo } from 'react';
import { StudentDirectoryTable } from '@/features/students/student-directory-table';
import { StudentRecord } from '@/features/students/student-types';
import { useAuthStore } from '@/shared/stores/auth-store';

const SAMPLE_STUDENTS: StudentRecord[] = [
  {
    id: 'std-001',
    rollNumber: 'MSU/2024/BCSE042',
    firstName: 'Aarav',
    lastName: 'Sharma',
    email: 'aarav.sharma@msu.edu.in',
    phone: '9876543210',
    program: 'B.Tech Computer Science & Engineering',
    branch: 'CSE',
    semester: 3,
    batch: '2024-2028',
    attendancePercentage: 86,
    feeStatus: 'PAID',
    feeDueAmount: 0,
    status: 'ACTIVE',
    guardianName: 'Rajesh Sharma',
    guardianPhone: '9876500001',
  },
  {
    id: 'std-002',
    rollNumber: 'MSU/2024/BCSE048',
    firstName: 'Priya',
    lastName: 'Bhutia',
    email: 'priya.bhutia@msu.edu.in',
    phone: '9845123456',
    program: 'B.Tech Computer Science & Engineering',
    branch: 'CSE',
    semester: 3,
    batch: '2024-2028',
    attendancePercentage: 71,
    feeStatus: 'DUE',
    feeDueAmount: 28500,
    status: 'ACTIVE',
    guardianName: 'Karma Bhutia',
    guardianPhone: '9845100002',
  },
  {
    id: 'std-003',
    rollNumber: 'MSU/2023/BDES015',
    firstName: 'Tashi',
    lastName: 'Namgyal',
    email: 'tashi.namgyal@msu.edu.in',
    phone: '9734098765',
    program: 'B.Des Product & Industrial Design',
    branch: 'Industrial Design',
    semester: 5,
    batch: '2023-2027',
    attendancePercentage: 92,
    feeStatus: 'SCHOLARSHIP',
    feeDueAmount: 0,
    status: 'ACTIVE',
    guardianName: 'Dorjee Namgyal',
    guardianPhone: '9734000003',
  },
  {
    id: 'std-004',
    rollNumber: 'MSU/2023/BDES022',
    firstName: 'Rohan',
    lastName: 'Verma',
    email: 'rohan.verma@msu.edu.in',
    phone: '9123456780',
    program: 'B.Des Product & Industrial Design',
    branch: 'Industrial Design',
    semester: 5,
    batch: '2023-2027',
    attendancePercentage: 62,
    feeStatus: 'DUE',
    feeDueAmount: 45000,
    status: 'ACTIVE',
    guardianName: 'Sanjay Verma',
    guardianPhone: '9123400004',
  },
  {
    id: 'std-005',
    rollNumber: 'MSU/2024/MBA009',
    firstName: 'Ananya',
    lastName: 'Chetri',
    email: 'ananya.chetri@msu.edu.in',
    phone: '9898765432',
    program: 'MBA Vocational & Entrepreneurship',
    branch: 'Vocational Mgmt',
    semester: 1,
    batch: '2024-2026',
    attendancePercentage: 88,
    feeStatus: 'PAID',
    feeDueAmount: 0,
    status: 'ACTIVE',
    guardianName: 'Bikash Chetri',
    guardianPhone: '9898700005',
  },
  {
    id: 'std-006',
    rollNumber: 'MSU/2024/DIP031',
    firstName: 'Karan',
    lastName: 'Subba',
    email: 'karan.subba@msu.edu.in',
    phone: '9765432109',
    program: 'Diploma in Applied Hospitality',
    branch: 'Hospitality',
    semester: 1,
    batch: '2024-2027',
    attendancePercentage: 64,
    feeStatus: 'DUE',
    feeDueAmount: 18000,
    status: 'ACTIVE',
    guardianName: 'Prem Subba',
    guardianPhone: '9765400006',
  },
];

export default function StudentsDirectoryPage() {
  const selectedInstitute = useAuthStore((state) => state.selectedInstitute);

  const [students, setStudents] = useState<StudentRecord[]>(SAMPLE_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [programFilter, setProgramFilter] = useState('ALL');
  const [attendanceFilter, setAttendanceFilter] = useState('ALL');
  const [feeFilter, setFeeFilter] = useState('ALL');

  // Modals
  const [inspectedStudent, setInspectedStudent] = useState<StudentRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for Adding Student
  const [newRollNo, setNewRollNo] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newProgram, setNewProgram] = useState('B.Tech Computer Science & Engineering');
  const [newSemester, setNewSemester] = useState(1);
  const [newGuardianName, setNewGuardianName] = useState('');

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        searchQuery === '' ||
        s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.includes(searchQuery);

      const matchesProgram =
        programFilter === 'ALL' || s.program === programFilter;

      const matchesAttendance =
        attendanceFilter === 'ALL' ||
        (attendanceFilter === 'DEFAULTER' && s.attendancePercentage < 75) ||
        (attendanceFilter === 'COMPLIANT' && s.attendancePercentage >= 75);

      const matchesFee =
        feeFilter === 'ALL' ||
        (feeFilter === 'PAID' && s.feeStatus === 'PAID') ||
        (feeFilter === 'DUE' && s.feeStatus === 'DUE') ||
        (feeFilter === 'SCHOLARSHIP' && s.feeStatus === 'SCHOLARSHIP');

      return matchesSearch && matchesProgram && matchesAttendance && matchesFee;
    });
  }, [students, searchQuery, programFilter, attendanceFilter, feeFilter]);

  const handleExportCSV = () => {
    const headers = 'Roll Number,Full Name,Program,Semester,Batch,Attendance %,Fee Status,Fee Due (INR),Phone,Guardian\n';
    const rows = filteredStudents
      .map(
        (s) =>
          `"${s.rollNumber}","${s.firstName} ${s.lastName}","${s.program}","Sem ${s.semester}","${s.batch}","${s.attendancePercentage}%","${s.feeStatus}","₹${s.feeDueAmount}","${s.phone}","${s.guardianName}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Students_Roster_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRollNo || !newFirstName || !newEmail || !newPhone) return;

    const newStudent: StudentRecord = {
      id: `std-${Date.now()}`,
      rollNumber: newRollNo.toUpperCase(),
      firstName: newFirstName,
      lastName: newLastName,
      email: newEmail,
      phone: newPhone,
      program: newProgram,
      branch: newProgram.includes('CSE') ? 'CSE' : 'Design',
      semester: Number(newSemester),
      batch: '2024-2028',
      attendancePercentage: 100,
      feeStatus: 'PAID',
      feeDueAmount: 0,
      status: 'ACTIVE',
      guardianName: newGuardianName || 'Guardian',
      guardianPhone: newPhone,
    };

    setStudents([newStudent, ...students]);
    setIsAddModalOpen(false);
    // Reset form
    setNewRollNo('');
    setNewFirstName('');
    setNewLastName('');
    setNewEmail('');
    setNewPhone('');
    setNewGuardianName('');
  };

  return (
    <div className="space-y-5">
      {/* Page Title & Operational Roster Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Student Directory & Roster
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {filteredStudents.length} Active Records
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Institutional cohort directory for {selectedInstitute?.name || 'Medhavi Skills University'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            <svg aria-hidden="true" className="w-3.5 h-3.5 mr-1.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            <svg aria-hidden="true" className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Enroll New Student
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shadow-sm">
        {/* Search */}
        <div>
          <label htmlFor="search-students" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Search by Name, Roll, or Phone
          </label>
          <input
            id="search-students"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g. BCSE042, Sharma..."
            className="w-full h-9 px-3 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Program Filter */}
        <div>
          <label htmlFor="filter-program" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Program
          </label>
          <select
            id="filter-program"
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="w-full h-9 px-2.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">All Programs</option>
            <option value="B.Tech Computer Science & Engineering">B.Tech CSE</option>
            <option value="B.Des Product & Industrial Design">B.Des Industrial Design</option>
            <option value="MBA Vocational & Entrepreneurship">MBA Vocational</option>
            <option value="Diploma in Applied Hospitality">Diploma Hospitality</option>
          </select>
        </div>

        {/* Attendance Filter */}
        <div>
          <label htmlFor="filter-attendance" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Attendance Health
          </label>
          <select
            id="filter-attendance"
            value={attendanceFilter}
            onChange={(e) => setAttendanceFilter(e.target.value)}
            className="w-full h-9 px-2.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">All Attendance Levels</option>
            <option value="COMPLIANT">Compliant (&ge;75%)</option>
            <option value="DEFAULTER">Defaulters (&lt;75%)</option>
          </select>
        </div>

        {/* Fee Status Filter */}
        <div>
          <label htmlFor="filter-fee" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Fee Status
          </label>
          <select
            id="filter-fee"
            value={feeFilter}
            onChange={(e) => setFeeFilter(e.target.value)}
            className="w-full h-9 px-2.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">All Ledger Statuses</option>
            <option value="PAID">Fully Paid</option>
            <option value="DUE">Outstanding Installment</option>
            <option value="SCHOLARSHIP">Scholarship Granted</option>
          </select>
        </div>
      </div>

      {/* High-Density Roster Table */}
      <StudentDirectoryTable
        students={filteredStudents}
        currentPage={1}
        totalPages={1}
        totalRecords={filteredStudents.length}
        onPageChange={() => {}}
        onInspectStudent={(student) => setInspectedStudent(student)}
      />

      {/* Modal: Student 360° Quick Dossier */}
      {inspectedStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 max-w-lg w-full text-slate-900 dark:text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setInspectedStudent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              aria-label="Close dossier"
            >
              <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 font-bold flex items-center justify-center text-sm font-mono">
                {inspectedStudent.firstName.charAt(0)}{inspectedStudent.lastName.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {inspectedStudent.firstName} {inspectedStudent.lastName}
                </h3>
                <span className="text-xs font-mono text-slate-500">
                  {inspectedStudent.rollNumber}, {inspectedStudent.program}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block text-xs font-semibold normal-case">Semester & Batch</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    Semester {inspectedStudent.semester} ({inspectedStudent.batch})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs font-semibold normal-case">Attendance Record</span>
                  <span className={`font-bold font-mono ${
                    inspectedStudent.attendancePercentage < 75 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {inspectedStudent.attendancePercentage}% {inspectedStudent.attendancePercentage < 75 ? '(Attendance Warning)' : '(Compliant)'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block text-xs font-semibold normal-case">Fee Ledger</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {inspectedStudent.feeStatus === 'PAID'
                      ? 'Fully Cleared'
                      : inspectedStudent.feeStatus === 'SCHOLARSHIP'
                      ? '100% Scholarship'
                      : `₹${inspectedStudent.feeDueAmount.toLocaleString('en-IN')} Due`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs font-semibold normal-case">Student Contact</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">+91 {inspectedStudent.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block text-xs font-semibold normal-case">Guardian Name</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{inspectedStudent.guardianName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs font-semibold normal-case">Guardian Phone</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">+91 {inspectedStudent.guardianPhone}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectedStudent(null)}
                className="px-4 py-1.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Enroll New Student */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 max-w-lg w-full text-slate-900 dark:text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              aria-label="Close dialog"
            >
              <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              Enroll New Student
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add a new student admission to the active cohort register.
            </p>

            <form onSubmit={handleAddStudent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    placeholder="e.g. Suman"
                    className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    placeholder="e.g. Rai"
                    className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Roll / Enrollment Number *
                </label>
                <input
                  type="text"
                  required
                  value={newRollNo}
                  onChange={(e) => setNewRollNo(e.target.value)}
                  placeholder="e.g. MSU/2024/BCSE050"
                  className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 uppercase font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="suman.rai@msu.edu.in"
                    className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Program
                  </label>
                  <select
                    value={newProgram}
                    onChange={(e) => setNewProgram(e.target.value)}
                    className="w-full h-9 px-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="B.Tech Computer Science & Engineering">B.Tech CSE</option>
                    <option value="B.Des Product & Industrial Design">B.Des Industrial Design</option>
                    <option value="MBA Vocational & Entrepreneurship">MBA Vocational</option>
                    <option value="Diploma in Applied Hospitality">Diploma Hospitality</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Semester
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={newSemester}
                    onChange={(e) => setNewSemester(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Guardian / Parent Name
                </label>
                <input
                  type="text"
                  value={newGuardianName}
                  onChange={(e) => setNewGuardianName(e.target.value)}
                  placeholder="e.g. Ramesh Rai"
                  className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 rounded border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow"
                >
                  Confirm & Enroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
