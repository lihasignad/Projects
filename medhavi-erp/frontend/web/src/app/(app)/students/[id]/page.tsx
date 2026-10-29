'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface AcademicRecord {
  courseCode: string;
  courseName: string;
  credits: number;
  internalMarks: number;
  externalMarks: number;
  totalMarks: number;
  grade: string;
  gradePoint: number;
  status: 'PASS' | 'FAIL' | 'INCOMPLETE';
}

interface AttendanceSubjectSummary {
  subjectCode: string;
  subjectName: string;
  attended: number;
  total: number;
  percentage: number;
}

interface FeeTransaction {
  id: string;
  invoiceNo: string;
  description: string;
  amount: number;
  date: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  receiptNo?: string;
}

const SAMPLE_STUDENTS_LOOKUP: Record<string, any> = {
  'std-001': {
    id: 'std-001',
    rollNumber: 'MSU/2024/BCSE042',
    enrollmentNo: 'ENR-2024-8902',
    firstName: 'Aarav',
    lastName: 'Sharma',
    email: 'aarav.sharma@msu.edu.in',
    phone: '9876543210',
    dateOfBirth: '2004-05-14',
    gender: 'Male',
    bloodGroup: 'B+',
    category: 'General',
    program: 'B.Tech Computer Science & Engineering',
    department: 'Department of Computer Engineering',
    branch: 'CSE',
    currentSemester: 3,
    batch: '2024-2028',
    academicYear: '2024-2025',
    cgpa: 8.64,
    sgpa: 8.80,
    creditsCompleted: 44,
    totalRequiredCredits: 160,
    overallAttendance: 86,
    feeStatus: 'PAID',
    feeDueAmount: 0,
    status: 'ACTIVE',
    guardianName: 'Rajesh Sharma',
    guardianPhone: '9876500001',
    guardianRelation: 'Father',
    guardianEmail: 'rajesh.sharma@gmail.com',
    address: 'Flat 402, Pine Grove Residency, Deorali, Gangtok, Sikkim 737102',
    advisorName: 'Dr. Tashi Dorjee (HOD CSE)',
    advisorEmail: 'tashi.dorjee@msu.edu.in',
  },
  'std-002': {
    id: 'std-002',
    rollNumber: 'MSU/2024/BCSE048',
    enrollmentNo: 'ENR-2024-8908',
    firstName: 'Priya',
    lastName: 'Bhutia',
    email: 'priya.bhutia@msu.edu.in',
    phone: '9845123456',
    dateOfBirth: '2004-11-22',
    gender: 'Female',
    bloodGroup: 'O+',
    category: 'ST',
    program: 'B.Tech Computer Science & Engineering',
    department: 'Department of Computer Engineering',
    branch: 'CSE',
    currentSemester: 3,
    batch: '2024-2028',
    academicYear: '2024-2025',
    cgpa: 7.42,
    sgpa: 7.20,
    creditsCompleted: 42,
    totalRequiredCredits: 160,
    overallAttendance: 71,
    feeStatus: 'DUE',
    feeDueAmount: 28500,
    status: 'ACTIVE',
    guardianName: 'Karma Bhutia',
    guardianPhone: '9845100002',
    guardianRelation: 'Father',
    guardianEmail: 'karma.bhutia@gmail.com',
    address: 'Near Enchey Monastery, Gangtok, Sikkim 737103',
    advisorName: 'Dr. Tashi Dorjee (HOD CSE)',
    advisorEmail: 'tashi.dorjee@msu.edu.in',
  },
};

const DEFAULT_ACADEMIC_RECORD: AcademicRecord[] = [
  { courseCode: 'CS301', courseName: 'Data Structures & Algorithms', credits: 4, internalMarks: 28, externalMarks: 62, totalMarks: 90, grade: 'A+', gradePoint: 9.0, status: 'PASS' },
  { courseCode: 'CS302', courseName: 'Computer Organization & Architecture', credits: 4, internalMarks: 25, externalMarks: 58, totalMarks: 83, grade: 'A', gradePoint: 8.0, status: 'PASS' },
  { courseCode: 'CS303', courseName: 'Discrete Mathematics', credits: 3, internalMarks: 27, externalMarks: 60, totalMarks: 87, grade: 'A+', gradePoint: 9.0, status: 'PASS' },
  { courseCode: 'CS304', courseName: 'Object Oriented Programming with Java', credits: 4, internalMarks: 29, externalMarks: 64, totalMarks: 93, grade: 'O', gradePoint: 10.0, status: 'PASS' },
  { courseCode: 'CS305P', courseName: 'Data Structures Lab', credits: 2, internalMarks: 48, externalMarks: 45, totalMarks: 93, grade: 'O', gradePoint: 10.0, status: 'PASS' },
];

const DEFAULT_ATTENDANCE: AttendanceSubjectSummary[] = [
  { subjectCode: 'CS301', subjectName: 'Data Structures & Algorithms', attended: 38, total: 42, percentage: 90 },
  { subjectCode: 'CS302', subjectName: 'Computer Organization & Architecture', attended: 32, total: 40, percentage: 80 },
  { subjectCode: 'CS303', subjectName: 'Discrete Mathematics', attended: 28, total: 34, percentage: 82 },
  { subjectCode: 'CS304', subjectName: 'Object Oriented Programming', attended: 36, total: 40, percentage: 90 },
  { subjectCode: 'CS305P', subjectName: 'DSA Practical Lab', attended: 16, total: 18, percentage: 88 },
];

const DEFAULT_FEES: FeeTransaction[] = [
  { id: 'tx-01', invoiceNo: 'INV/2024/0042', description: 'Semester 3 Tuition Fee', amount: 45000, date: '2024-07-15', status: 'PAID', receiptNo: 'RCP-2024-9102' },
  { id: 'tx-02', invoiceNo: 'INV/2024/0118', description: 'Annual Library & Lab Access Fee', amount: 8500, date: '2024-07-15', status: 'PAID', receiptNo: 'RCP-2024-9103' },
  { id: 'tx-03', invoiceNo: 'INV/2024/0890', description: 'Examination Fee (End Term Dec 24)', amount: 3500, date: '2024-10-10', status: 'PAID', receiptNo: 'RCP-2024-9541' },
];

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = typeof params?.id === 'string' ? params.id : 'std-001';

  const [activeTab, setActiveTab] = useState<'overview' | 'academics' | 'attendance' | 'fees'>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const student = useMemo(() => {
    return (
      SAMPLE_STUDENTS_LOOKUP[studentId] || {
        ...SAMPLE_STUDENTS_LOOKUP['std-001'],
        id: studentId,
        firstName: 'Student',
        lastName: studentId.toUpperCase(),
        rollNumber: `MSU/2024/${studentId.slice(-4).toUpperCase()}`,
      }
    );
  }, [studentId]);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
            <Link href="/students" className="hover:text-brand-600 dark:hover:text-brand-400 font-medium">
              Students Directory
            </Link>
            <span>/</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">{student.rollNumber}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <span>{student.firstName} {student.lastName}</span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                student.status === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {student.status}
            </span>
            {student.overallAttendance < 75 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                Attendance Defaulter
              </span>
            )}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              window.print();
            }}
            className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-colors"
          >
            Export Dossier
          </button>
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="px-3 py-1.5 rounded bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {successBanner && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex justify-between items-center">
          <span>{successBanner}</span>
          <button onClick={() => setSuccessBanner(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Main Student Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex items-center space-x-5">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md font-mono">
              {student.firstName[0]}{student.lastName[0]}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  {student.rollNumber}
                </span>
                <span className="text-xs text-slate-500">
                  Enrollment: <strong className="font-mono font-normal">{student.enrollmentNo}</strong>
                </span>
              </div>
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {student.program}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Semester {student.currentSemester}, Batch {student.batch}, {student.department}
              </div>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
            <div className="text-center">
              <div className="text-xs font-semibold text-slate-500 normal-case">CGPA</div>
              <div className="text-xl font-bold font-mono text-brand-600 dark:text-brand-400 mt-0.5">
                {student.cgpa}
              </div>
              <div className="text-[10px] text-slate-400">Scale of 10.0</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-slate-500 normal-case">Attendance</div>
              <div className={`text-xl font-bold font-mono mt-0.5 ${
                student.overallAttendance >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {student.overallAttendance}%
              </div>
              <div className="text-[10px] text-slate-400">Min 75% req</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-slate-500 normal-case">Fee Status</div>
              <div className="text-xl font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                {student.feeDueAmount === 0 ? 'Clear' : `₹${student.feeDueAmount.toLocaleString('en-IN')}`}
              </div>
              <div className="text-[10px] text-slate-400">
                {student.feeDueAmount === 0 ? 'No pending dues' : 'Due payment'}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mt-6 -mb-6 space-x-6">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-xs font-semibold tracking-wide border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Overview & Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('academics')}
            className={`pb-3 text-xs font-semibold tracking-wide border-b-2 transition-colors ${
              activeTab === 'academics'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Courses & Grades
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`pb-3 text-xs font-semibold tracking-wide border-b-2 transition-colors ${
              activeTab === 'attendance'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Attendance Breakdown
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fees')}
            className={`pb-3 text-xs font-semibold tracking-wide border-b-2 transition-colors ${
              activeTab === 'fees'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Fee Ledger & Receipts
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
              Personal & Demographic Profile
            </h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
              <div>
                <dt className="text-slate-400 font-medium">Date of Birth</dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{student.dateOfBirth}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Gender</dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{student.gender}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Blood Group</dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{student.bloodGroup}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Category</dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{student.category}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-slate-400 font-medium">Institutional Email</dt>
                <dd className="font-mono text-brand-600 dark:text-brand-400 mt-0.5">{student.email}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-slate-400 font-medium">Mobile Contact</dt>
                <dd className="font-mono text-slate-800 dark:text-slate-200 mt-0.5">+91 {student.phone}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-slate-400 font-medium">Residential Address</dt>
                <dd className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">{student.address}</dd>
              </div>
            </dl>
          </div>

          {/* Guardian & Faculty Mentorship */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
              Guardian & Faculty Advisor
            </h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
              <div>
                <dt className="text-slate-400 font-medium">Guardian Name</dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{student.guardianName}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Relationship</dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{student.guardianRelation}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Guardian Contact</dt>
                <dd className="font-mono text-slate-800 dark:text-slate-200 mt-0.5">+91 {student.guardianPhone}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Guardian Email</dt>
                <dd className="font-mono text-slate-700 dark:text-slate-300 mt-0.5">{student.guardianEmail}</dd>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <dt className="text-slate-400 font-medium">Assigned Faculty Advisor</dt>
                <dd className="font-semibold text-brand-700 dark:text-brand-300 mt-0.5">{student.advisorName}</dd>
                <dd className="font-mono text-[11px] text-slate-500 mt-0.5">{student.advisorEmail}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {activeTab === 'academics' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Current Semester Course Registrations &amp; Internal Marks
              </h2>
              <p className="text-xs text-slate-500">
                Semester 3, Academic Year {student.academicYear}, Credits: 17
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-brand-50 text-brand-600 font-semibold">
              SGPA: <strong className="font-mono">{student.sgpa}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold normal-case text-slate-600 dark:text-slate-400">
                  <th className="py-2.5">Code</th>
                  <th className="py-2.5">Subject Name</th>
                  <th className="py-2.5 text-center">Credits</th>
                  <th className="py-2.5 text-center">Internal (30)</th>
                  <th className="py-2.5 text-center">External (70)</th>
                  <th className="py-2.5 text-center">Total (100)</th>
                  <th className="py-2.5 text-center">Grade</th>
                  <th className="py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {DEFAULT_ACADEMIC_RECORD.map((rec) => (
                  <tr key={rec.courseCode} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-mono font-bold text-slate-900 dark:text-slate-100">{rec.courseCode}</td>
                    <td className="py-3 font-medium text-slate-800 dark:text-slate-200">{rec.courseName}</td>
                    <td className="py-3 text-center font-mono">{rec.credits}</td>
                    <td className="py-3 text-center font-mono">{rec.internalMarks}</td>
                    <td className="py-3 text-center font-mono">{rec.externalMarks}</td>
                    <td className="py-3 text-center font-mono font-bold text-slate-900 dark:text-slate-100">{rec.totalMarks}</td>
                    <td className="py-3 text-center font-mono font-bold text-brand-600 dark:text-brand-400">{rec.grade}</td>
                    <td className="py-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Subject-wise Attendance Breakdown
              </h2>
              <p className="text-xs text-slate-500">
                Synchronized with Daily Biometric & Classroom Registers
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Overall:</span>
              <span className={`font-mono text-xs px-2.5 py-1 rounded font-bold ${
                student.overallAttendance >= 75
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
              }`}>
                {student.overallAttendance}%
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {DEFAULT_ATTENDANCE.map((item) => (
              <div key={item.subjectCode} className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">{item.subjectCode}</span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{item.subjectName}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="text-slate-500">
                      <span className="font-mono">{item.attended} / {item.total}</span> lectures
                    </span>
                    <span className={`font-mono font-bold ${
                      item.percentage >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'fees' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Fee Transactions & Receipts
              </h2>
              <p className="text-xs text-slate-500">
                Academic Year 2024-2025 • Student Accounts Ledger
              </p>
            </div>
            <Link
              href="/finance/payments"
              className="px-3 py-1.5 rounded bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Collect Payment
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold normal-case text-slate-600 dark:text-slate-400">
                  <th className="py-2.5">Invoice #</th>
                  <th className="py-2.5">Description</th>
                  <th className="py-2.5">Billing Date</th>
                  <th className="py-2.5 text-right">Amount</th>
                  <th className="py-2.5 text-center">Status</th>
                  <th className="py-2.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {DEFAULT_FEES.map((fee) => (
                  <tr key={fee.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-mono font-bold text-slate-900 dark:text-slate-100">{fee.invoiceNo}</td>
                    <td className="py-3 font-medium text-slate-800 dark:text-slate-200">{fee.description}</td>
                    <td className="py-3 font-mono text-slate-500">{fee.date}</td>
                    <td className="py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      ₹{fee.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-center">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold capitalize bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {fee.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {fee.receiptNo ? (
                        <span className="font-mono text-brand-600 dark:text-brand-400 font-semibold cursor-pointer hover:underline">
                          {fee.receiptNo}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Update Student Information
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsEditModalOpen(false);
                setSuccessBanner('Student profile updated successfully in university registry.');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Contact
                </label>
                <input
                  type="tel"
                  defaultValue={student.phone}
                  className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Residential Address
                </label>
                <textarea
                  rows={2}
                  defaultValue={student.address}
                  className="w-full p-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Guardian Phone
                </label>
                <input
                  type="tel"
                  defaultValue={student.guardianPhone}
                  className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-2 rounded border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
