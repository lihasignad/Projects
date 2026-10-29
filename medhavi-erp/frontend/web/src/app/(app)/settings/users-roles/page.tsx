'use client';

import { useState } from 'react';
import { useAuthStore } from '@/shared/stores/auth-store';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'DEAN' | 'FACULTY' | 'ACCOUNTS_OFFICER' | 'REGISTRAR' | 'STUDENT';
  status: 'ACTIVE' | 'SUSPENDED';
  lastLogin: string;
}

const INITIAL_USERS: SystemUser[] = [
  {
    id: 'usr-1',
    name: 'Sahil Saurav (System Architect)',
    email: 'sahilsaurav99@gmail.com',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    lastLogin: 'Just now',
  },
  {
    id: 'usr-2',
    name: 'Dr. Ramesh Sharma',
    email: 'ramesh.sharma@msu.edu.in',
    role: 'DEAN',
    status: 'ACTIVE',
    lastLogin: 'Today, 09:15 AM',
  },
  {
    id: 'usr-3',
    name: 'Prof. Sonam Bhutia',
    email: 'sonam.bhutia@msu.edu.in',
    role: 'FACULTY',
    status: 'ACTIVE',
    lastLogin: 'Today, 10:45 AM',
  },
  {
    id: 'usr-4',
    name: 'Prem K. Subba',
    email: 'accounts@msu.edu.in',
    role: 'ACCOUNTS_OFFICER',
    status: 'ACTIVE',
    lastLogin: 'Today, 11:30 AM',
  },
  {
    id: 'usr-5',
    name: 'Karma Dorjee',
    email: 'registrar@msu.edu.in',
    role: 'REGISTRAR',
    status: 'ACTIVE',
    lastLogin: 'Yesterday, 04:20 PM',
  },
  {
    id: 'usr-6',
    name: 'Aarav Sharma (Student Rep)',
    email: 'aarav.sharma@msu.edu.in',
    role: 'STUDENT',
    status: 'ACTIVE',
    lastLogin: 'Yesterday, 08:12 PM',
  },
];

interface PermissionRow {
  permission: string;
  description: string;
  superAdmin: boolean;
  dean: boolean;
  faculty: boolean;
  accounts: boolean;
  registrar: boolean;
  student: boolean;
}

const INITIAL_MATRIX: PermissionRow[] = [
  {
    permission: 'students:read',
    description: 'Inspect student directory, cohorts and enrollments',
    superAdmin: true,
    dean: true,
    faculty: true,
    accounts: true,
    registrar: true,
    student: false,
  },
  {
    permission: 'students:create',
    description: 'Enroll new students and generate admission numbers',
    superAdmin: true,
    dean: true,
    faculty: false,
    accounts: false,
    registrar: true,
    student: false,
  },
  {
    permission: 'attendance:read',
    description: 'View daily attendance registers and percentages',
    superAdmin: true,
    dean: true,
    faculty: true,
    accounts: false,
    registrar: true,
    student: true,
  },
  {
    permission: 'attendance:write',
    description: 'Mark and submit session classroom attendance',
    superAdmin: true,
    dean: true,
    faculty: true,
    accounts: false,
    registrar: false,
    student: false,
  },
  {
    permission: 'academics:write',
    description: 'Add degree programs, syllabi and timetable slots',
    superAdmin: true,
    dean: true,
    faculty: false,
    accounts: false,
    registrar: true,
    student: false,
  },
  {
    permission: 'marks:write',
    description: 'Enter internal marks and external written scores',
    superAdmin: true,
    dean: true,
    faculty: true,
    accounts: false,
    registrar: false,
    student: false,
  },
  {
    permission: 'marks:publish',
    description: 'Authorize and publish official examination results',
    superAdmin: true,
    dean: true,
    faculty: false,
    accounts: false,
    registrar: true,
    student: false,
  },
  {
    permission: 'invoices:read',
    description: 'View student billing ledgers and dues',
    superAdmin: true,
    dean: true,
    faculty: false,
    accounts: true,
    registrar: true,
    student: true,
  },
  {
    permission: 'payments:write',
    description: 'Collect payments and issue official receipts',
    superAdmin: true,
    dean: false,
    faculty: false,
    accounts: true,
    registrar: false,
    student: false,
  },
  {
    permission: 'users:write',
    description: 'Manage staff accounts and modify RBAC permissions',
    superAdmin: true,
    dean: false,
    faculty: false,
    accounts: false,
    registrar: false,
    student: false,
  },
];

export default function UsersAndRolesPage() {
  const selectedInstitute = useAuthStore((state) => state.selectedInstitute);

  const [activeTab, setActiveTab] = useState<'USERS' | 'MATRIX'>('USERS');
  const [users, setUsers] = useState<SystemUser[]>(INITIAL_USERS);
  const [matrix, setMatrix] = useState<PermissionRow[]>(INITIAL_MATRIX);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Invite Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<SystemUser['role']>('FACULTY');

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const newStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const newUser: SystemUser = {
      id: `usr-${Date.now()}`,
      name: newName,
      email: newEmail,
      role: newRole,
      status: 'ACTIVE',
      lastLogin: 'Never (Invited)',
    };

    setUsers([...users, newUser]);
    setIsInviteModalOpen(false);
    setNewName('');
    setNewEmail('');
    setToastMsg(`Invitation email and temporary authentication token sent to ${newEmail}`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const toggleMatrixCell = (permIndex: number, roleKey: keyof PermissionRow) => {
    setMatrix((prev) =>
      prev.map((row, idx) => {
        if (idx === permIndex) {
          return { ...row, [roleKey]: !row[roleKey] };
        }
        return row;
      })
    );
  };

  const handleSaveMatrix = () => {
    setToastMsg('RBAC security policy and permission matrix rules successfully committed to redis cache!');
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              User Accounts & Role Permissions (RBAC)
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Granular Scopes
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Institutional user accounts, role definitions, and access control policies for {selectedInstitute?.name || 'Medhavi Skills University'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {activeTab === 'MATRIX' ? (
            <button
              type="button"
              onClick={handleSaveMatrix}
              className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <svg className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Permission Policy
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(true)}
              className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              <svg className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Invite User
            </button>
          )}
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div
          role="alert"
          className="rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 p-3 text-xs flex items-center space-x-2"
        >
          <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('USERS')}
          className={`pb-2.5 transition-colors border-b-2 ${
            activeTab === 'USERS'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Active User Accounts ({users.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('MATRIX')}
          className={`pb-2.5 transition-colors border-b-2 ${
            activeTab === 'MATRIX'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          RBAC Permissions Matrix
        </button>
      </div>

      {/* TAB 1: USER ACCOUNTS */}
      {activeTab === 'USERS' && (
        <div className="space-y-4">
          <div className="w-full max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user name, email, or role..."
              className="w-full h-9 px-3 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 normal-case">
                  <tr>
                    <th className="py-2.5 px-3 sm:px-4">User</th>
                    <th className="py-2.5 px-3 sm:px-4">Email</th>
                    <th className="py-2.5 px-3 sm:px-4">Assigned Role</th>
                    <th className="py-2.5 px-3 sm:px-4">Status</th>
                    <th className="py-2.5 px-3 sm:px-4">Last Activity</th>
                    <th className="py-2.5 px-3 sm:px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 sm:px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="h-8 w-8 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-bold flex items-center justify-center text-xs">
                            {u.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 sm:px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        {u.email}
                      </td>
                      <td className="py-3 px-3 sm:px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 sm:px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-[11px] text-slate-500 font-mono">
                        {u.lastLogin}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-right">
                        {u.role !== 'SUPER_ADMIN' && (
                          <button
                            type="button"
                            onClick={() => toggleUserStatus(u.id)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded ${
                              u.status === 'ACTIVE'
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                            }`}
                          >
                            {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RBAC MATRIX */}
      {activeTab === 'MATRIX' && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="p-3 sm:px-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold normal-case text-slate-700 dark:text-slate-300">
                Resource Access Control Scopes
              </h2>
              <p className="text-[11px] text-slate-500">Fine-grained permission gates mapped across system user roles</p>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Click checkbox to grant/revoke</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 normal-case">
                <tr>
                  <th className="py-2.5 px-3 sm:px-4">Permission Scope</th>
                  <th className="py-2.5 px-3 sm:px-4">Resource Operation</th>
                  <th className="py-2.5 px-2 text-center">Super Admin</th>
                  <th className="py-2.5 px-2 text-center">Dean</th>
                  <th className="py-2.5 px-2 text-center">Faculty</th>
                  <th className="py-2.5 px-2 text-center">Accounts</th>
                  <th className="py-2.5 px-2 text-center">Registrar</th>
                  <th className="py-2.5 px-2 text-center">Student</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {matrix.map((row, idx) => (
                  <tr key={row.permission} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 sm:px-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                      {row.permission}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-slate-600 dark:text-slate-300">
                      {row.description}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <input
                        type="checkbox"
                        checked={row.superAdmin}
                        disabled
                        className="w-4 h-4 text-brand-600 rounded opacity-70 cursor-not-allowed"
                      />
                    </td>
                    <td className="py-3 px-2 text-center">
                      <input
                        type="checkbox"
                        checked={row.dean}
                        onChange={() => toggleMatrixCell(idx, 'dean')}
                        className="w-4 h-4 text-brand-600 rounded cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-2 text-center">
                      <input
                        type="checkbox"
                        checked={row.faculty}
                        onChange={() => toggleMatrixCell(idx, 'faculty')}
                        className="w-4 h-4 text-brand-600 rounded cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-2 text-center">
                      <input
                        type="checkbox"
                        checked={row.accounts}
                        onChange={() => toggleMatrixCell(idx, 'accounts')}
                        className="w-4 h-4 text-brand-600 rounded cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-2 text-center">
                      <input
                        type="checkbox"
                        checked={row.registrar}
                        onChange={() => toggleMatrixCell(idx, 'registrar')}
                        className="w-4 h-4 text-brand-600 rounded cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-2 text-center">
                      <input
                        type="checkbox"
                        checked={row.student}
                        onChange={() => toggleMatrixCell(idx, 'student')}
                        className="w-4 h-4 text-brand-600 rounded cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Invite User */}
      {isInviteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 max-w-md w-full text-slate-900 dark:text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              aria-label="Close dialog"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-base font-bold mb-1">Invite New ERP User</h3>
            <p className="text-xs text-slate-500 mb-4">
              Send an email invitation and provision institutional role credentials.
            </p>

            <form onSubmit={handleInviteUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Dr. Kavita Rai"
                  className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Institutional Email *
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="kavita.rai@msu.edu.in"
                  className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Role Assignment
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full h-9 px-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="FACULTY">Faculty Member</option>
                  <option value="DEAN">Academic Dean / HOD</option>
                  <option value="ACCOUNTS_OFFICER">Accounts & Cashier Officer</option>
                  <option value="REGISTRAR">Registrar / Admissions Office</option>
                  <option value="SUPER_ADMIN">System Super Administrator</option>
                </select>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-3 py-2 rounded border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow"
                >
                  Dispatch Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
