'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/shared/stores/auth-store';

interface PaymentReceipt {
  id: string;
  receiptNo: string;
  timestamp: string;
  studentRoll: string;
  studentName: string;
  program: string;
  amount: number;
  paymentMode: 'UPI_QR' | 'CASH' | 'NEFT_RTGS' | 'CARD' | 'CHEQUE';
  referenceNo: string;
  feeHead: string;
  cashier: string;
}

const INITIAL_RECEIPTS: PaymentReceipt[] = [
  {
    id: 'rec-1',
    receiptNo: 'REC-2025-0842',
    timestamp: 'Today, 11:42 AM',
    studentRoll: 'MSU/2024/BCSE042',
    studentName: 'Aarav Sharma',
    program: 'B.Tech CSE',
    amount: 65000,
    paymentMode: 'UPI_QR',
    referenceNo: 'UPI/529948291039',
    feeHead: 'Tuition Fee (Sem 3)',
    cashier: 'Accounts Counter 1',
  },
  {
    id: 'rec-2',
    receiptNo: 'REC-2025-0841',
    timestamp: 'Today, 10:15 AM',
    studentRoll: 'MSU/2024/BCSE048',
    studentName: 'Priya Bhutia',
    program: 'B.Tech CSE',
    amount: 36500,
    paymentMode: 'NEFT_RTGS',
    referenceNo: 'NEFT/PUNB202508104',
    feeHead: 'Tuition Fee Installment 1',
    cashier: 'Accounts Counter 1',
  },
  {
    id: 'rec-3',
    receiptNo: 'REC-2025-0840',
    timestamp: 'Yesterday, 03:20 PM',
    studentRoll: 'MSU/2023/BDES015',
    studentName: 'Tashi Namgyal',
    program: 'B.Des Product Design',
    amount: 55000,
    paymentMode: 'CASH',
    referenceNo: 'CASH/VOUCHER-491',
    feeHead: 'Tuition Fee (Sem 5)',
    cashier: 'Accounts Counter 2',
  },
  {
    id: 'rec-4',
    receiptNo: 'REC-2025-0839',
    timestamp: 'Yesterday, 01:10 PM',
    studentRoll: 'MSU/2024/MBA009',
    studentName: 'Ananya Chetri',
    program: 'MBA Vocational',
    amount: 75000,
    paymentMode: 'CARD',
    referenceNo: 'POS/HDFC-99201',
    feeHead: 'Tuition Fee (Sem 1)',
    cashier: 'Accounts Counter 1',
  },
];

export default function FeePaymentsPage() {
  const selectedInstitute = useAuthStore((state) => state.selectedInstitute);

  const [receipts, setReceipts] = useState<PaymentReceipt[]>(INITIAL_RECEIPTS);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);

  // POS Form States
  const [studentRoll, setStudentRoll] = useState('MSU/2024/BCSE048');
  const [studentName, setStudentName] = useState('Priya Bhutia');
  const [collectAmount, setCollectAmount] = useState(28500);
  const [payMode, setPayMode] = useState<'UPI_QR' | 'CASH' | 'NEFT_RTGS' | 'CARD' | 'CHEQUE'>('UPI_QR');
  const [refNo, setRefNo] = useState('');
  const [feeHead, setFeeHead] = useState('Tuition Fee - Installment 2');
  const [receiptSuccess, setReceiptSuccess] = useState<PaymentReceipt | null>(null);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentRoll || collectAmount <= 0) return;

    const newReceipt: PaymentReceipt = {
      id: `rec-${Date.now()}`,
      receiptNo: `REC-2025-0${Math.floor(850 + Math.random() * 150)}`,
      timestamp: 'Just now',
      studentRoll: studentRoll.toUpperCase(),
      studentName: studentName || 'Student',
      program: 'B.Tech CSE',
      amount: Number(collectAmount),
      paymentMode: payMode,
      referenceNo: refNo || `${payMode}/REF-${Date.now().toString().slice(-6)}`,
      feeHead: feeHead,
      cashier: 'Accounts Counter 1',
    };

    setReceipts([newReceipt, ...receipts]);
    setReceiptSuccess(newReceipt);
    setRefNo('');
  };

  const handlePrint = () => {
    window.print();
  };

  const totalToday = receipts
    .filter((r) => r.timestamp.includes('Today') || r.timestamp.includes('Just now'))
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Fee Collections & Payment Counter
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Counter Active
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cashier fee collection terminal, electronic receipts, and transaction reconciliation for {selectedInstitute?.name || 'Medhavi Skills University'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <Link
            href="/finance/invoices"
            className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            View Invoices & Dues
          </Link>
        </div>
      </div>

      {/* POS Quick Collection Terminal & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Interactive Collection Form */}
        <div className="lg:col-span-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Collect Payment / Issue Receipt
              </h2>
              <p className="text-[11px] text-slate-500">Record cash, UPI, or bank transfer payment</p>
            </div>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-bold">
              COUNTER #1
            </span>
          </div>

          <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Student Roll / Registration ID *
                </label>
                <input
                  type="text"
                  required
                  value={studentRoll}
                  onChange={(e) => setStudentRoll(e.target.value)}
                  placeholder="e.g. MSU/2024/BCSE048"
                  className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 uppercase font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Student Name *
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Priya Bhutia"
                  className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Fee Head *
                </label>
                <input
                  type="text"
                  required
                  value={feeHead}
                  onChange={(e) => setFeeHead(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Mode *
                </label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value as any)}
                  className="w-full h-9 px-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="UPI_QR">UPI / QR Dynamic Scan</option>
                  <option value="CASH">Cash Over Counter</option>
                  <option value="NEFT_RTGS">NEFT / Bank Transfer</option>
                  <option value="CARD">Debit / Credit Card POS</option>
                  <option value="CHEQUE">Bank Demand Draft / Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Amount Received (INR) *
                </label>
                <input
                  type="number"
                  required
                  min={100}
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Transaction Reference / UTR Number
              </label>
              <input
                type="text"
                value={refNo}
                onChange={(e) => setRefNo(e.target.value)}
                placeholder="e.g. UTR / Bank Ref / Receipt Book Voucher #"
                className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow transition-colors flex items-center justify-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              >
                <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Process Payment & Issue Official Receipt</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Cashier Shift Summary */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 normal-case">
              Today's Session Balance
            </div>
            <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              ₹{totalToday.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Realized across all counter channels today</p>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">UPI / QR Scan:</span>
                <span className="font-mono font-bold">₹65,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Direct Bank NEFT:</span>
                <span className="font-mono font-bold">₹36,500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Physical Cash:</span>
                <span className="font-mono font-bold">₹55,000</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
            Counter transactions are cryptographically signed and archived for audit compliance.
          </div>
        </div>
      </div>

      {/* Real-Time Payment Receipts Ledger */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="p-3 sm:px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 normal-case">
            Recent Fee Collections Ledger
          </h2>
          <span className="text-xs text-slate-500">
            {receipts.length} Transactions Recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 normal-case">
              <tr>
                <th className="py-2.5 px-3 sm:px-4">Receipt #</th>
                <th className="py-2.5 px-3 sm:px-4">Time</th>
                <th className="py-2.5 px-3 sm:px-4">Student Roll & Name</th>
                <th className="py-2.5 px-3 sm:px-4">Fee Head</th>
                <th className="py-2.5 px-3 sm:px-4">Payment Mode</th>
                <th className="py-2.5 px-3 sm:px-4 text-right">Amount Paid</th>
                <th className="py-2.5 px-3 sm:px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {receipts.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 sm:px-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                    {r.receiptNo}
                  </td>
                  <td className="py-3 px-3 sm:px-4 font-mono text-[11px] text-slate-500">{r.timestamp}</td>
                  <td className="py-3 px-3 sm:px-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{r.studentName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{r.studentRoll}</div>
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-slate-700 dark:text-slate-300">{r.feeHead}</td>
                  <td className="py-3 px-3 sm:px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {r.paymentMode.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                    ₹{r.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedReceipt(r)}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      Print Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Official Printable Receipt */}
      {(selectedReceipt || receiptSuccess) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          role="dialog"
          aria-modal="true"
        >
          {(() => {
            const r = selectedReceipt || receiptSuccess!;

            return (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 max-w-md w-full text-slate-900 dark:text-slate-100 shadow-2xl relative">
                <button
                  onClick={() => {
                    setSelectedReceipt(null);
                    setReceiptSuccess(null);
                  }}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  aria-label="Close receipt dialog"
                >
                  <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Receipt Header */}
                <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    {selectedInstitute?.name || 'Medhavi Skills University'}
                  </h3>
                  <div className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-0.5 normal-case">
                    Official Fee Payment Receipt
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {selectedInstitute?.location || 'Bermiok, West Sikkim'}, Govt. Recognized University
                  </div>
                  <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">
                    {r.receiptNo}
                  </div>
                </div>

                {/* Receipt Data */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Date & Timestamp:</span>
                    <span className="font-medium">{r.timestamp}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Student Name:</span>
                    <span className="font-bold">{r.studentName}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Roll Number:</span>
                    <span className="font-mono font-bold">{r.studentRoll}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Fee Head / Purpose:</span>
                    <span className="font-medium">{r.feeHead}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Payment Mode:</span>
                    <span className="font-medium">{r.paymentMode.replace('_', ' ')}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Transaction Reference:</span>
                    <span className="font-mono text-[11px]">{r.referenceNo}</span>
                  </div>

                  {/* Amount Block */}
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-emerald-900 dark:text-emerald-100 font-mono mt-3">
                    <span className="font-semibold text-xs normal-case">Total Paid:</span>
                    <span className="text-lg font-black">₹{r.amount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedReceipt(null);
                      setReceiptSuccess(null);
                    }}
                    className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-4 py-1.5 rounded bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow flex items-center space-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                  >
                    <span>Print Receipt</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
