'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePortalStore } from '@/features/portals/portal-store';

/**
 * DESIGN BRIEF: Dean's Statutory Governance & Approvals Queue
 * - Who uses: Dean reviewing high-stakes exceptions (attendance condonation, grade curve moderation, faculty conference travel).
 * - Single most important thing: Transparent scrutiny of justification metadata and immediate, accountable Approve/Reject execution synchronized with store.
 * - Visual direction: Authoritative institutional governance workbench with structured metadata tables and decision buttons.
 * - Palette: Slate (`#0F172A`, `#334155`, `#F8FAFC`), Emerald (`#059669`), Crimson (`#DC2626`), Brand Ink (`#2563EB`).
 * - Spacing & radius: 4px/8px rhythm, rounded-xl containers with subtle 1px border.
 */

export default function DeanApprovalsPage() {
  const requests = usePortalStore((state) => state.deanApprovals);
  const approveDeanRequest = usePortalStore((state) => state.approveDeanRequest);
  const rejectDeanRequest = usePortalStore((state) => state.rejectDeanRequest);

  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAction = (id: string, action: 'APPROVED' | 'REJECTED') => {
    if (action === 'APPROVED') {
      approveDeanRequest(id);
      setFeedback(`Request ${id} approved with official statutory seal of the Dean.`);
    } else {
      rejectDeanRequest(id);
      setFeedback(`Request ${id} marked as rejected with formal administrative remarks.`);
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

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
              <span className="text-xs text-slate-500 font-mono">
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

          <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            {pendingCount} Pending Formal Scrutiny
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 text-xs font-semibold flex items-center justify-between shadow-sm">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-600 hover:underline">
            ✕
          </button>
        </div>
      )}

      {/* Requests Cards List */}
      <div className="space-y-4">
        {requests.map((req) => (
          <div
            key={req.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                  {req.id}
                </span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {req.category}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${
                    req.urgency === 'HIGH'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {req.urgency}
                </span>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <span className="text-slate-400 font-mono">Submitted: {req.submittedDate}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    req.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : req.status === 'REJECTED'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {req.status}
                </span>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {req.title}
              </h2>
              <div className="text-xs text-slate-500 mt-0.5">
                Department: {req.department} · Originator: {req.submittedBy}
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800">
              {req.details}
            </p>

            {/* Metadata Ledger */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {Object.entries(req.metadata).map(([key, val]) => (
                <div key={key} className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">{key}</div>
                  <div className="font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5 truncate">{val}</div>
                </div>
              ))}
            </div>

            {/* Decision Controls */}
            {req.status === 'PENDING' && (
              <div className="flex justify-end items-center space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleAction(req.id, 'REJECTED')}
                  className="px-4 py-2 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 hover:bg-rose-50 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 active:scale-[0.99]"
                >
                  Reject with Remarks
                </button>
                <button
                  type="button"
                  onClick={() => handleAction(req.id, 'APPROVED')}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-[0.99]"
                >
                  Approve with Statutory Seal
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
