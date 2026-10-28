'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MOCK_HOD_FACULTY_WORKLOAD } from '@/features/portals/portals-mock-data';
import type { FacultyWorkloadItem } from '@/features/portals/types';

/**
 * DESIGN BRIEF: HOD Faculty Workload Allocation & Regulatory Audit
 * - Who uses: Head of Department ensuring balanced teaching loads and compliance with AICTE/UGC accreditation standards.
 * - Single most important thing: Flag and rectify teaching overload (>16 hrs) or underload (<10 hrs) across faculty ranks.
 * - Visual direction: High-density regulatory matrix with clear numerical hour tallies and rebalance triggers.
 * - Palette: Slate (`#0F172A`, `#334155`, `#F8FAFC`), Emerald (`#059669`), Crimson (`#DC2626`), Amber (`#D97706`).
 * - Spacing & radius: 4px/8px rhythm, rounded-xl containers with subtle 1px border.
 */

export default function HodFacultyWorkloadPage() {
  const [workloads, setWorkloads] = useState<FacultyWorkloadItem[]>(MOCK_HOD_FACULTY_WORKLOAD);

  const handleRebalance = (facultyId: string) => {
    setWorkloads((prev) =>
      prev.map((f) => {
        if (f.facultyId === facultyId) {
          return {
            ...f,
            theoryHoursPerWeek: 8,
            labHoursPerWeek: 6,
            totalHoursPerWeek: 14,
            status: 'optimal',
          };
        }
        return f;
      })
    );
    alert('Workload rebalanced to 14 hrs/week (Optimal AICTE standard). Synchronized to Dean portal.');
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
              <span className="text-xs text-slate-500">
                AICTE Workload Standard Compliance
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Faculty Workload Distribution &amp; Teaching Hours
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Weekly theory lectures, laboratory sessions, and tutorial allocations for Department of CSE.
            </p>
          </div>

          <div className="text-right self-start sm:self-auto">
            <div className="text-[10px] font-semibold text-slate-400">Department Teaching Total</div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
              66 <span className="text-xs text-slate-400 font-normal">hrs / week</span>
            </div>
          </div>
        </div>
      </div>

      {/* Workload Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Faculty Allocation Roster ({workloads.length} Members Audited)
          </h2>
          <span className="text-xs text-slate-500">
            Session: Autumn 2025-26
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-500 font-semibold">
                <th className="px-4 py-3">Faculty Member</th>
                <th className="px-4 py-3">Designation &amp; Code</th>
                <th className="px-4 py-3">Assigned Subjects</th>
                <th className="px-4 py-3 text-right">Theory Hrs</th>
                <th className="px-4 py-3 text-right">Lab Hrs</th>
                <th className="px-4 py-3 text-right">Total Load</th>
                <th className="px-4 py-3 text-center">Audit Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {workloads.map((fac) => (
                <tr key={fac.facultyId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                    <div className="font-bold">{fac.facultyName}</div>
                    <div className="text-[11px] text-slate-500">{fac.specialization}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-800 dark:text-slate-200 font-medium">{fac.designation}</div>
                    <div className="font-mono text-slate-500 text-[11px]">{fac.employeeCode}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {fac.assignedSubjects.map((sub, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-800 dark:text-slate-200">
                    {fac.theoryHoursPerWeek}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-800 dark:text-slate-200">
                    {fac.labHoursPerWeek}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                    {fac.totalHoursPerWeek}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-medium ${
                        fac.status === 'optimal'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                          : fac.status === 'overloaded'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200'
                      }`}
                    >
                      {fac.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {fac.status !== 'optimal' ? (
                      <button
                        type="button"
                        onClick={() => handleRebalance(fac.facultyId)}
                        className="px-2.5 py-1 rounded bg-brand-600 hover:bg-brand-700 text-white font-semibold text-[11px] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
                      >
                        Rebalance Load
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">Compliant</span>
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
