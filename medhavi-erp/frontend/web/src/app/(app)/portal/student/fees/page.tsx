'use client';

import { useState } from 'react';
import { MOCK_STUDENT, MOCK_INVOICES } from '@/features/portals/portals-mock-data';

/**
 * DESIGN BRIEF: Student Fee Invoices & Payment Portal
 * - Who uses: Students auditing semester dues, downloading fee receipts, and completing online tuition settlements.
 * - Single most important thing: Unambiguous pending fee balance, clear itemization, and instant online fee collection simulator.
 * - Visual direction: Clean financial ledger with tabular numeral amounts in Indian Rupees (₹) and official receipt vouchers.
 * - Palette: Slate (`#0F172A`, `#334155`, `#F8FAFC`), Emerald (`#059669`), Amber (`#D97706`), Brand Ink (`#2563EB`).
 * - Spacing & radius: 4px/8px grid, rounded-xl containers with subtle 1px border.
 */

export default function StudentFeesPage() {
  const [invoices, setInvoices] = useState(MOCK_INVOICES);
  const [isProcessingPay, setIsProcessingPay] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const pendingTotal = invoices
    .filter((inv) => inv.status === 'PENDING')
    .reduce((acc, curr) => acc + curr.balanceAmount, 0);

  const handlePayInvoice = (id: string) => {
    setSelectedInvoiceId(id);
    setIsProcessingPay(true);
    setTimeout(() => {
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === id
            ? {
                ...inv,
                status: 'PAID',
                paidAmount: inv.amount,
                balanceAmount: 0,
                receiptNumber: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                paidDate: '2026-10-28',
                paymentMethod: 'UPI / Razorpay',
              }
            : inv
        )
      );
      setIsProcessingPay(false);
      setSelectedInvoiceId(null);
      alert('Payment successful! Official receipt generated.');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]">
                Fee Accounts &amp; Clearance
              </span>
              <span className="text-xs text-slate-500">
                {MOCK_STUDENT.rollNo}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Fee Invoices &amp; Online Payment
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tuition, hostel, and examination fee settlements. All payments generate university tax receipts.
            </p>
          </div>

          <div className="text-right self-start sm:self-auto">
            <div className="text-[10px] font-semibold text-slate-400">Total Outstanding Balance</div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
              ₹{pendingTotal.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Invoices Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Student Invoices Ledger
          </h2>
          <span className="text-xs font-mono text-slate-500">
            Session Autumn 2025-26
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-500 font-semibold">
                <th className="px-4 py-3">Invoice No &amp; Description</th>
                <th className="px-4 py-3 text-right">Invoice Amount</th>
                <th className="px-4 py-3 text-right">Amount Paid</th>
                <th className="px-4 py-3 text-right">Balance Due</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Action / Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {inv.invoiceNumber}
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 mt-0.5">{inv.description}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900 dark:text-slate-100">
                    ₹{inv.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                    ₹{inv.paidAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                    ₹{inv.balanceAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                    {inv.dueDate}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-medium ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {inv.status === 'PENDING' ? (
                      <button
                        type="button"
                        disabled={isProcessingPay && selectedInvoiceId === inv.id}
                        onClick={() => handlePayInvoice(inv.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.99]"
                      >
                        {isProcessingPay && selectedInvoiceId === inv.id ? 'Processing...' : 'Pay Online Now'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => alert(`Receipt #${inv.receiptNumber} downloaded for ${inv.invoiceNumber}`)}
                        className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                      >
                        Receipt #{inv.receiptNumber}
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
