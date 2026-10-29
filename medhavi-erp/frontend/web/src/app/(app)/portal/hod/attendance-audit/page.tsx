'use client';

import { useState } from 'react';
import Link from 'next/link';

interface DefaulterItem {
  id: string;
  rollNo: string;
  name: string;
  batch: string;
  attendancePercent: number;
  missedClasses: number;
  guardianName: string;
  guardianPhone: string;
  status: 'WARNING_1' | 'WARNING_2' | 'DEBARRED';
  noticeSent: boolean;
}

const INITIAL_DEFAULTERS: DefaulterItem[] = [
  { id: 'def-1', rollNo: '2023CSE011', name: 'Aarav Singhania', batch: 'B.Tech CSE Sem 5 Sec A', attendancePercent: 68.4, missedClasses: 39, guardianName: 'Sanjay Singhania', guardianPhone: '+91 98765 00011', status: 'WARNING_1', noticeSent: false },
  { id: 'def-2', rollNo: '2023CSE018', name: 'Devendra Joshi', batch: 'B.Tech CSE Sem 5 Sec A', attendancePercent: 71.0, missedClasses: 36, guardianName: 'Harish Joshi', guardianPhone: '+91 98765 00018', status: 'WARNING_1', noticeSent: false },
  { id: 'def-3', rollNo: '2023CSE048', name: 'Rohan Kulkarni', batch: 'B.Tech CSE Sem 5 Sec B', attendancePercent: 69.8, missedClasses: 38, guardianName: 'Pradeep Kulkarni', guardianPhone: '+91 98765 00048', status: 'WARNING_1', noticeSent: false },
  { id: 'def-4', rollNo: '2022CSE029', name: 'Vikramaditya Rathore', batch: 'B.Tech CSE Sem 7 Sec A', attendancePercent: 58.2, missedClasses: 52, guardianName: 'Col. K.S. Rathore', guardianPhone: '+91 98765 00029', status: 'WARNING_2', noticeSent: true },
  { id: 'def-5', rollNo: '2022CSE074', name: 'Neha Chawla', batch: 'B.Tech CSE Sem 7 Sec B', attendancePercent: 63.5, missedClasses: 46, guardianName: 'Ashok Chawla', guardianPhone: '+91 98765 00074', status: 'WARNING_2', noticeSent: false },
];

/**
 * DESIGN BRIEF: HOD Attendance Deficit Audit & Debarment Management
 * - Who uses: Head of Department enforcing academic attendance regulations and issuing statutory parent notices.
 * - Single most important thing: Intercept chronic student absenteeism early and generate formal warning dispatches.
 * - Visual direction: High-stakes administrative table with prominent percentage deficits and bulk communication action.
 * - Palette: Slate (`#0F172A`, `#334155`, `#F8FAFC`), Amber (`#D97706`), Crimson (`#DC2626`), Brand Ink (`#2563EB`).
 * - Spacing & radius: 4px/8px rhythm, rounded-xl containers with subtle 1px border.
 */

export default function HodAttendanceAuditPage() {
  const [defaulters, setDefaulters] = useState<DefaulterItem[]>(INITIAL_DEFAULTERS);
  const [isSending, setIsSending] = useState(false);

  const handleSendNotice = (id: string) => {
    setDefaulters((prev) =>
      prev.map((d) => (d.id === id ? { ...d, noticeSent: true } : d))
    );
    alert('Statutory Warning Notice dispatched via registered SMS and Student Email.');
  };

  const handleBulkSendAll = () => {
    setIsSending(true);
    setTimeout(() => {
      setDefaulters((prev) => prev.map((d) => ({ ...d, noticeSent: true })));
      setIsSending(false);
      alert('Official attendance shortfall warning notices dispatched to all guardians.');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Link
                href="/portal/hod"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                HOD Desk
              </Link>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-xs text-rose-600 dark:text-rose-400 font-mono font-semibold">
                Under 75% Attendance Threshold
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Department Attendance Deficit Audit
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Statutory attendance monitoring across 480 Computer Science undergraduates.
            </p>
          </div>

          <button
            type="button"
            onClick={handleBulkSendAll}
            disabled={isSending}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 self-start sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
          >
            {isSending ? 'Sending Notices...' : 'Issue Notices to All Guardians'}
          </button>
        </div>
      </div>

      {/* Defaulters Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Attendance Deficit Roster ({defaulters.length} Identified Students)
          </h2>
          <span className="text-xs font-mono text-slate-500">
            Minimum Requirement: 75.0%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-500 font-semibold">
                <th className="px-4 py-3">Roll No &amp; Student</th>
                <th className="px-4 py-3">Batch</th>
                <th className="px-4 py-3 text-right">Attendance %</th>
                <th className="px-4 py-3 text-right">Missed Classes</th>
                <th className="px-4 py-3">Guardian Contact</th>
                <th className="px-4 py-3 text-center">Warning Level</th>
                <th className="px-4 py-3 text-right">Official Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {defaulters.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {item.rollNo}
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">{item.name}</div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                    {item.batch}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-sm text-rose-600 dark:text-rose-400">
                    {item.attendancePercent}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-800 dark:text-slate-200">
                    {item.missedClasses} Hours
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-800 dark:text-slate-200">{item.guardianName}</div>
                    <div className="font-mono text-slate-500 text-[11px]">{item.guardianPhone}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-medium ${
                        item.status === 'WARNING_2'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {item.noticeSent ? (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        Notice Dispatched
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendNotice(item.id)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
                      >
                        Issue Warning
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
  );
}
