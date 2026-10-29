'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePortalStore } from '@/features/portals/portal-store';

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
      <div className="bg-paper border border-rule rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Link
                href="/portal/dean"
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                Dean&apos;s Office
              </Link>
              <span className="text-ink-muted">|</span>
              <span className="text-xs text-ink-muted">
                Executive Governance Workbench
              </span>
            </div>
            <h1 className="text-xl font-bold text-ink mt-1.5">
              Statutory Approvals &amp; Board Sign-Offs
            </h1>
            <p className="text-xs text-ink-muted mt-0.5">
              Attendance condonations, examination board grade moderation, and faculty international conference sponsorships.
            </p>
          </div>

          <div className="text-xs font-semibold px-3 py-1.5 rounded-md bg-danger-soft text-danger border border-red-200 dark:border-red-900/40">
            {pendingCount} Pending Formal Scrutiny
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-lg bg-success-soft border border-emerald-200 dark:border-emerald-900/40 text-success text-xs font-medium flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-success hover:underline font-semibold" aria-label="Dismiss message">
            ✕
          </button>
        </div>
      )}

      {/* Requests Cards List */}
      <div className="space-y-4">
        {requests.map((req) => (
          <div
            key={req.id}
            className="bg-paper border border-rule rounded-lg p-5 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rule pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-brand-600">
                  {req.id}
                </span>
                <span className="text-ink-muted">|</span>
                <span className="text-xs font-semibold text-ink">
                  {req.category}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded capitalize ${
                    req.urgency === 'HIGH'
                      ? 'bg-danger-soft text-danger'
                      : 'bg-warning-soft text-warning'
                  }`}
                >
                  {req.urgency.toLowerCase()}
                </span>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <span className="text-ink-muted">Submitted: {req.submittedDate}</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${
                    req.status === 'APPROVED'
                      ? 'bg-success-soft text-success'
                      : req.status === 'REJECTED'
                      ? 'bg-danger-soft text-danger'
                      : 'bg-warning-soft text-warning'
                  }`}
                >
                  {req.status.toLowerCase()}
                </span>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold text-ink">
                {req.title}
              </h2>
              <div className="text-xs text-ink-muted mt-0.5">
                Department: {req.department}, Originator: {req.submittedBy}
              </div>
            </div>

            <p className="text-xs text-ink-2 leading-relaxed bg-paper-2 p-3.5 rounded-md border border-rule">
              {req.details}
            </p>

            {/* Metadata Ledger */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {Object.entries(req.metadata).map(([key, val]) => (
                <div key={key} className="p-2.5 rounded-md border border-rule bg-paper">
                  <div className="text-xs text-ink-muted normal-case font-medium">{key}</div>
                  <div className="font-mono font-bold text-ink mt-0.5 truncate">{val}</div>
                </div>
              ))}
            </div>

            {/* Decision Controls */}
            {req.status === 'PENDING' && (
              <div className="flex justify-end items-center space-x-3 pt-3 border-t border-rule">
                <button
                  type="button"
                  onClick={() => handleAction(req.id, 'REJECTED')}
                  className="px-4 py-2 rounded-md border border-red-200 dark:border-red-900/40 text-danger hover:bg-danger-soft text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 whitespace-nowrap"
                >
                  Reject with Remarks
                </button>
                <button
                  type="button"
                  onClick={() => handleAction(req.id, 'APPROVED')}
                  className="px-4 py-2 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 whitespace-nowrap"
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
