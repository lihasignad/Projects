'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MOCK_DEAN_APPROVALS } from '@/features/portals/portals-mock-data';
import type { DeanApprovalRequest } from '@/features/portals/types';

/**
 * DESIGN BRIEF: Dean's Statutory Governance & Approvals Queue
 * - Who uses: Dean reviewing high-stakes exceptions (attendance condonation, grade curve moderation, faculty conference travel).
 * - Single most important thing: Transparent scrutiny of justification metadata and immediate, accountable Approve/Reject execution.
 * - Visual direction: Authoritative institutional governance workbench with structured metadata tables and decision buttons.
 * - Palette: Slate (`#0F172A`, `#334155`, `#F8FAFC`), Emerald (`#059669`), Crimson (`#DC2626`), Brand Ink (`#2563EB`).
 * - Spacing & radius: 4px/8px rhythm, rounded-xl containers with subtle 1px border.
 */

export default function DeanApprovalsPage() {
  const [requests, setRequests] = useState<DeanApprovalRequest[]>(MOCK_DEAN_APPROVALS);

  const handleAction = (id: string, action: 'APPROVED' | 'REJECTED') => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: action } : r))
    );
    alert(`Request ${id} marked as ${action} with official Dean signature stamp.`);
  };

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
                Executive Governance Workbench
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Statutory Approvals &amp; Board Sign-Offs
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Attendance condonations, examination board grade moderation, and faculty international conference sponsorships.
            </p>
          </div>

          <div className="text-xs text-slate-500">
            {requests.filter((r) => r.status === 'PENDING').length} Pending Scrutiny
          </div>
        </div>
      </div>

      {/* Requests Cards List */}
      <div className="space-y-4">
        {requests.map((req) => (
          <div
            key={req.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200 font-mono uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]">
                    {req.category}
                  </span>
                  <span className="text-xs text-slate-400">
                    ID: {req.id}, Submitted: {req.submittedDate}
                  </span>
                  {req.urgency === 'HIGH' && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]">
                      URGENT
                    </span>
                  )}
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {req.title}
                </h2>
                <div className="text-xs text-slate-500">
                  Originating Unit: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{req.department}</strong> (Submitted by {req.submittedBy})
                </div>
              </div>

              {/* Status Badge */}
              <div className="self-start sm:self-center">
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-bold font-medium ${
                    req.status === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                      : req.status === 'REJECTED'
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200'
                  }`}
                >
                  {req.status}
                </span>
              </div>
            </div>

            {/* Justification Statement */}
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800">
              {req.details}
            </p>

            {/* Structured Metadata Parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              {Object.entries(req.metadata).map(([key, val]) => (
                <div
                  key={key}
                  className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs"
                >
                  <div className="text-[10px] font-semibold text-slate-400">
                    {key}
                  </div>
                  <div className="font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {String(val)}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Bar */}
            {req.status === 'PENDING' && (
              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleAction(req.id, 'REJECTED')}
                  className="px-4 py-2 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
                >
                  Decline Request
                </button>
                <button
                  type="button"
                  onClick={() => handleAction(req.id, 'APPROVED')}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
                >
                  Sign &amp; Approve Execution
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
