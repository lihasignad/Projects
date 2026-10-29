'use client';

import { useState, useMemo } from 'react';
import { useAuthStore } from '@/shared/stores/auth-store';

interface FacultyMember {
  id: string;
  empId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Lecturer' | 'Lab Instructor';
  qualification: string;
  workloadHours: number;
  maxWorkload: number;
  cabin: string;
  courses: string[];
  status: 'ACTIVE' | 'ON_LEAVE';
}

const INITIAL_FACULTY: FacultyMember[] = [
  {
    id: 'fac-1',
    empId: 'MSU/FAC/001',
    name: 'Dr. Ramesh Sharma',
    email: 'ramesh.sharma@msu.edu.in',
    phone: '9841234567',
    department: 'School of Computing & AI',
    designation: 'Professor',
    qualification: 'Ph.D in Distributed Computing (IIT Kharagpur)',
    workloadHours: 16,
    maxWorkload: 18,
    cabin: 'Academic Block A - Room 302',
    courses: ['CS301: Data Structures', 'CS402: Cloud Computing Architecture'],
    status: 'ACTIVE',
  },
  {
    id: 'fac-2',
    empId: 'MSU/FAC/004',
    name: 'Prof. Sonam Bhutia',
    email: 'sonam.bhutia@msu.edu.in',
    phone: '9845678901',
    department: 'School of Design & Creative Arts',
    designation: 'Associate Professor',
    qualification: 'M.Des Industrial Design (NID Ahmedabad)',
    workloadHours: 18,
    maxWorkload: 20,
    cabin: 'Design Studio 2 - Cabin 12',
    courses: ['DES201: Ergonomics & Human Centered Design', 'DES305: Product Aesthetics'],
    status: 'ACTIVE',
  },
  {
    id: 'fac-3',
    empId: 'MSU/FAC/008',
    name: 'Dr. Anandita Roy',
    email: 'anandita.roy@msu.edu.in',
    phone: '9876543210',
    department: 'School of Management & Enterprise',
    designation: 'Professor',
    qualification: 'Ph.D in Entrepreneurial Finance (IIM Calcutta)',
    workloadHours: 14,
    maxWorkload: 16,
    cabin: 'Management Tower - Room 405',
    courses: ['MBA102: Financial Accounting', 'MBA204: Venture Capital & Incubation'],
    status: 'ACTIVE',
  },
  {
    id: 'fac-4',
    empId: 'MSU/FAC/012',
    name: 'Dr. Rupak Subba',
    email: 'rupak.subba@msu.edu.in',
    phone: '9734123456',
    department: 'School of Computing & AI',
    designation: 'Associate Professor',
    qualification: 'Ph.D in Microprocessor Systems (NIT Silchar)',
    workloadHours: 18,
    maxWorkload: 20,
    cabin: 'Academic Block A - Room 308',
    courses: ['CS302: Computer Architecture', 'CS406: Embedded Systems'],
    status: 'ACTIVE',
  },
  {
    id: 'fac-5',
    empId: 'MSU/FAC/019',
    name: 'Chef Karma Lepcha',
    email: 'karma.lepcha@msu.edu.in',
    phone: '9812345678',
    department: 'School of Hospitality Services',
    designation: 'Lecturer',
    qualification: 'M.Sc Hotel Management (IHM Pusa)',
    workloadHours: 20,
    maxWorkload: 22,
    cabin: 'Culinary Arts Complex - Lab Office',
    courses: ['HOSP101: Culinary Fundamentals', 'HOSP203: Food & Beverage Production'],
    status: 'ACTIVE',
  },
  {
    id: 'fac-6',
    empId: 'MSU/FAC/025',
    name: 'Prof. Anish Pradhan',
    email: 'anish.pradhan@msu.edu.in',
    phone: '9832145670',
    department: 'School of Computing & AI',
    designation: 'Assistant Professor',
    qualification: 'M.Tech Computer Science (Jadavpur University)',
    workloadHours: 16,
    maxWorkload: 20,
    cabin: 'Academic Block A - Room 311',
    courses: ['CS303: Operating Systems', 'CS303L: OS Kernel Workshop'],
    status: 'ON_LEAVE',
  },
];

export default function FacultyDirectoryPage() {
  const selectedInstitute = useAuthStore((state) => state.selectedInstitute);

  const [faculty, setFaculty] = useState<FacultyMember[]>(INITIAL_FACULTY);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [inspectedFaculty, setInspectedFaculty] = useState<FacultyMember | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for Adding Faculty
  const [newEmpId, setNewEmpId] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDept, setNewDept] = useState('School of Computing & AI');
  const [newDesignation, setNewDesignation] = useState<'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Lecturer' | 'Lab Instructor'>('Assistant Professor');
  const [newQualification, setNewQualification] = useState('');
  const [newCabin, setNewCabin] = useState('');

  const filteredFaculty = useMemo(() => {
    return faculty.filter((f) => {
      const matchesSearch =
        searchQuery === '' ||
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = deptFilter === 'ALL' || f.department === deptFilter;
      const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [faculty, searchQuery, deptFilter, statusFilter]);

  const handleAddFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpId || !newName || !newEmail) return;

    const newMember: FacultyMember = {
      id: `fac-${Date.now()}`,
      empId: newEmpId.toUpperCase(),
      name: newName,
      email: newEmail,
      phone: newPhone || '9800000000',
      department: newDept,
      designation: newDesignation,
      qualification: newQualification || 'Postgraduate Degree',
      workloadHours: 12,
      maxWorkload: 18,
      cabin: newCabin || 'Academic Block Staff Hall',
      courses: ['Assigned Curriculum Subject'],
      status: 'ACTIVE',
    };

    setFaculty([newMember, ...faculty]);
    setIsAddModalOpen(false);
    setNewEmpId('');
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewQualification('');
    setNewCabin('');
  };

  const handleExportCSV = () => {
    const headers = 'Employee ID,Name,Department,Designation,Qualification,Workload Hours,Email,Phone,Status\n';
    const rows = filteredFaculty
      .map(
        (f) =>
          `"${f.empId}","${f.name}","${f.department}","${f.designation}","${f.qualification}","${f.workloadHours} / ${f.maxWorkload} hrs","${f.email}","${f.phone}","${f.status}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Faculty_Directory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Faculty & Academic Staff Directory
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {filteredFaculty.length} Academic Staff
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Teaching roster, designations, department appointments, and weekly workload for {selectedInstitute?.name || 'Medhavi Skills University'}
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
            Appoint Faculty
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 normal-case">Total Faculty</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">{faculty.length}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">100% Ph.D / Master Certified</div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 normal-case">Professors & Deans</div>
          <div className="text-xl font-bold font-mono text-brand-600 dark:text-brand-400 mt-1">
            {faculty.filter((f) => f.designation.includes('Professor')).length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Senior Academic Chairs</div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 normal-case">Avg Weekly Workload</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">16.8 hrs</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Compliant with UGC norms</div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 normal-case">Active On Campus</div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {faculty.filter((f) => f.status === 'ACTIVE').length} / {faculty.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">1 on approved sabbatical</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-sm">
        <div>
          <label htmlFor="search-faculty" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Search by Name, Employee ID, or Email
          </label>
          <input
            id="search-faculty"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g. Ramesh, FAC/001..."
            className="w-full h-9 px-3 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label htmlFor="filter-dept" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Department / School
          </label>
          <select
            id="filter-dept"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full h-9 px-2.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">All Departments</option>
            <option value="School of Computing & AI">School of Computing & AI</option>
            <option value="School of Design & Creative Arts">School of Design & Creative Arts</option>
            <option value="School of Management & Enterprise">School of Management & Enterprise</option>
            <option value="School of Hospitality Services">School of Hospitality Services</option>
          </select>
        </div>

        <div>
          <label htmlFor="filter-status" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Operational Status
          </label>
          <select
            id="filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-9 px-2.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active & Teaching</option>
            <option value="ON_LEAVE">On Sabbatical / Leave</option>
          </select>
        </div>
      </div>

      {/* Faculty Directory Table */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 normal-case">
              <tr>
                <th className="py-2.5 px-3 sm:px-4">Emp ID</th>
                <th className="py-2.5 px-3 sm:px-4">Faculty Member</th>
                <th className="py-2.5 px-3 sm:px-4">Department</th>
                <th className="py-2.5 px-3 sm:px-4">Designation</th>
                <th className="py-2.5 px-3 sm:px-4">Weekly Workload</th>
                <th className="py-2.5 px-3 sm:px-4">Status</th>
                <th className="py-2.5 px-3 sm:px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredFaculty.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 sm:px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                    {member.empId}
                  </td>
                  <td className="py-3 px-3 sm:px-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="h-8 w-8 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-bold flex items-center justify-center text-xs">
                        {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{member.name}</div>
                        <div className="text-[11px] text-slate-500">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-slate-700 dark:text-slate-300">{member.department}</td>
                  <td className="py-3 px-3 sm:px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {member.designation}
                    </span>
                  </td>
                  <td className="py-3 px-3 sm:px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-brand-600 h-1.5 rounded-full"
                          style={{ width: `${(member.workloadHours / member.maxWorkload) * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {member.workloadHours}/{member.maxWorkload} hrs
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 sm:px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        member.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {member.status === 'ACTIVE' ? 'Active' : 'On Sabbatical'}
                    </span>
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setInspectedFaculty(member)}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      View Dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Faculty 360° Dossier */}
      {inspectedFaculty && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 max-w-lg w-full text-slate-900 dark:text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setInspectedFaculty(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              aria-label="Close dossier"
            >
              <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-bold flex items-center justify-center text-sm">
                {inspectedFaculty.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h3 className="text-base font-bold">{inspectedFaculty.name}</h3>
                <span className="text-xs text-slate-500 font-mono">
                  {inspectedFaculty.empId}, {inspectedFaculty.designation}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-xs font-semibold normal-case">Department</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{inspectedFaculty.department}</span>
              </div>

              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-xs font-semibold normal-case">Highest Qualification</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{inspectedFaculty.qualification}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-xs font-semibold normal-case">Faculty Office / Cabin</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{inspectedFaculty.cabin}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-xs font-semibold normal-case">Contact Phone</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">+91 {inspectedFaculty.phone}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-xs font-semibold normal-case mb-1">
                  Assigned Teaching Courses
                </span>
                <ul className="space-y-1">
                  {inspectedFaculty.courses.map((crs, idx) => (
                    <li key={idx} className="p-2 rounded bg-slate-50 dark:bg-slate-950 font-mono text-[11px] border border-slate-200 dark:border-slate-800">
                      {crs}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectedFaculty(null)}
                className="px-4 py-1.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Faculty */}
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

            <h3 className="text-base font-bold mb-1">Appoint Academic Staff</h3>
            <p className="text-xs text-slate-500 mb-4">
              Add a new faculty or teaching lecturer to the institutional roster.
            </p>

            <form onSubmit={handleAddFaculty} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmpId}
                    onChange={(e) => setNewEmpId(e.target.value)}
                    placeholder="e.g. MSU/FAC/030"
                    className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 uppercase font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Dr. Preeti Tamang"
                    className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Institutional Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="preeti.tamang@msu.edu.in"
                    className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
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
                    Department
                  </label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full h-9 px-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="School of Computing & AI">School of Computing & AI</option>
                    <option value="School of Design & Creative Arts">School of Design & Creative Arts</option>
                    <option value="School of Management & Enterprise">School of Management & Enterprise</option>
                    <option value="School of Hospitality Services">School of Hospitality Services</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Designation
                  </label>
                  <select
                    value={newDesignation}
                    onChange={(e) => setNewDesignation(e.target.value as any)}
                    className="w-full h-9 px-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="Lab Instructor">Lab Instructor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Highest Qualification & University
                </label>
                <input
                  type="text"
                  value={newQualification}
                  onChange={(e) => setNewQualification(e.target.value)}
                  placeholder="e.g. Ph.D in Artificial Intelligence (IIT Delhi)"
                  className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cabin / Office Room
                </label>
                <input
                  type="text"
                  value={newCabin}
                  onChange={(e) => setNewCabin(e.target.value)}
                  placeholder="e.g. Academic Block B - Room 204"
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
                  Appoint Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
