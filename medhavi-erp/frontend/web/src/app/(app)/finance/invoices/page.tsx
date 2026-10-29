'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/shared/stores/auth-store';

interface FeeInvoice {
  id: string;
  invoiceNo: string;
  studentRoll: string;
  studentName: string;
  program: string;
  semester: number;
  feeHead: 'TUITION' | 'LAB_WORKSHOP' | 'HOSTEL_MESS' | 'EXAMINATION';
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: 'PAID' | 'PARTIAL' | 'DUE' | 'OVERDUE';
}

const INITIAL_INVOICES: FeeInvoice[] = [
  {
    id: 'inv-1',
    invoiceNo: 'INV-2025-0101',
    studentRoll: 'MSU/2024/BCSE042',
    studentName: 'Aarav Sharma',
    program: 'B.Tech CSE',
    semester: 3,
    feeHead: 'TUITION',
    totalAmount: 65000,
    paidAmount: 65000,
    dueDate: '2025-08-15',
    status: 'PAID',
  },
  {
    id: 'inv-2',
    invoiceNo: 'INV-2025-0102',
    studentRoll: 'MSU/2024/BCSE048',
    studentName: 'Priya Bhutia',
    program: 'B.Tech CSE',
    semester: 3,
    feeHead: 'TUITION',
    totalAmount: 65000,
    paidAmount: 36500,
    dueDate: '2025-08-15',
    status: 'PARTIAL',
  },
  {
    id: 'inv-3',
    invoiceNo: 'INV-2025-0103',
    studentRoll: 'MSU/2023/BDES015',
    studentName: 'Tashi Namgyal',
    program: 'B.Des Product Design',
    semester: 5,
    feeHead: 'TUITION',
    totalAmount: 55000,
    paidAmount: 55000,
    dueDate: '2025-08-15',
    status: 'PAID',
  },
  {
    id: 'inv-4',
    invoiceNo: 'INV-2025-0104',
    studentRoll: 'MSU/2023/BDES022',
    studentName: 'Rohan Verma',
    program: 'B.Des Product Design',
    semester: 5,
    feeHead: 'LAB_WORKSHOP',
    totalAmount: 45000,
    paidAmount: 0,
    dueDate: '2025-07-31',
    status: 'OVERDUE',
  },
  {
    id: 'inv-5',
    invoiceNo: 'INV-2025-0105',
    studentRoll: 'MSU/2024/MBA009',
    studentName: 'Ananya Chetri',
    program: 'MBA Vocational',
    semester: 1,
    feeHead: 'TUITION',
    totalAmount: 75000,
    paidAmount: 75000,
    dueDate: '2025-08-20',
    status: 'PAID',
  },
  {
    id: 'inv-6',
    invoiceNo: 'INV-2025-0106',
    studentRoll: 'MSU/2024/DIP031',
    studentName: 'Karan Subba',
    program: 'Diploma Hospitality',
    semester: 1,
    feeHead: 'HOSTEL_MESS',
    totalAmount: 32000,
    paidAmount: 14000,
    dueDate: '2025-08-10',
    status: 'OVERDUE',
  },
];

export default function FeeInvoicesPage() {
  const selectedInstitute = useAuthStore((state) => state.selectedInstitute);

  const [invoices, setInvoices] = useState<FeeInvoice[]>(INITIAL_INVOICES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [headFilter, setHeadFilter] = useState('ALL');

  // Modals
  const [inspectedInvoice, setInspectedInvoice] = useState<FeeInvoice | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  // Form State for Batch Invoices
  const [batchProgram, setBatchProgram] = useState('B.Tech CSE');
  const [batchSemester, setBatchSemester] = useState(3);
  const [batchHead, setBatchHead] = useState<'TUITION' | 'LAB_WORKSHOP' | 'HOSTEL_MESS' | 'EXAMINATION'>('TUITION');
  const [batchAmount, setBatchAmount] = useState(65000);
  const [batchDueDate, setBatchDueDate] = useState('2025-10-31');

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        searchQuery === '' ||
        inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.studentRoll.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.studentName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
      const matchesHead = headFilter === 'ALL' || inv.feeHead === headFilter;

      return matchesSearch && matchesStatus && matchesHead;
    });
  }, [invoices, searchQuery, statusFilter, headFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const totalBilled = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const totalCollected = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
    const totalOutstanding = totalBilled - totalCollected;
    const overdueCount = invoices.filter((i) => i.status === 'OVERDUE').length;

    return { totalBilled, totalCollected, totalOutstanding, overdueCount };
  }, [invoices]);

  const handleSendReminder = (inv: FeeInvoice) => {
    setReminderToast(`Automated SMS fee reminder dispatched to ${inv.studentName} (+91 9876500001) for ₹${(inv.totalAmount - inv.paidAmount).toLocaleString('en-IN')}`);
    setTimeout(() => setReminderToast(null), 4000);
  };

  const handleGenerateInvoices = (e: React.FormEvent) => {
    e.preventDefault();
    const newInvoice: FeeInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNo: `INV-2025-${Math.floor(1000 + Math.random() * 9000)}`,
      studentRoll: 'MSU/2024/BCSE099',
      studentName: 'New Cohort Batch Invoicing',
      program: batchProgram,
      semester: Number(batchSemester),
      feeHead: batchHead,
      totalAmount: Number(batchAmount),
      paidAmount: 0,
      dueDate: batchDueDate,
      status: 'DUE',
    };

    setInvoices([newInvoice, ...invoices]);
    setIsGenerateModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = 'Invoice No,Roll Number,Student Name,Program,Semester,Fee Head,Total (INR),Paid (INR),Due (INR),Due Date,Status\n';
    const rows = filteredInvoices
      .map(
        (i) =>
          `"${i.invoiceNo}","${i.studentRoll}","${i.studentName}","${i.program}","Sem ${i.semester}","${i.feeHead}",${i.totalAmount},${i.paidAmount},${i.totalAmount - i.paidAmount},"${i.dueDate}","${i.status}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Fee_Invoices_${Date.now()}.csv`);
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
              Fee Invoices & Student Billing
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              FY 2025-26
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Student fee dues, automated installment invoicing, and ledger accounts for {selectedInstitute?.name || 'Medhavi Skills University'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <Link
            href="/finance/payments"
            className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            Fee Collection Counter
          </Link>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            <svg aria-hidden="true" className="w-3.5 h-3.5 mr-1.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Ledger
          </button>

          <button
            type="button"
            onClick={() => setIsGenerateModalOpen(true)}
            className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            <svg aria-hidden="true" className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Generate Batch Invoices
          </button>
        </div>
      </div>

      {/* Reminder Notification Toast */}
      {reminderToast && (
        <div
          role="alert"
          className="rounded-lg bg-sky-50 dark:bg-sky-950/50 border border-sky-300 dark:border-sky-800 text-sky-800 dark:text-sky-200 p-3 text-xs flex items-center space-x-2"
        >
          <svg aria-hidden="true" className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="font-semibold">{reminderToast}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 normal-case">Total Billed</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            ₹{metrics.totalBilled.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">All active terms</div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 normal-case">Realized Collections</div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{metrics.totalCollected.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {Math.round((metrics.totalCollected / metrics.totalBilled) * 100)}% realization rate
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 normal-case">Outstanding Receivables</div>
          <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            ₹{metrics.totalOutstanding.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Pending installments</div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 normal-case">Overdue Defaulters</div>
          <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            {metrics.overdueCount} Invoices
          </div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">&gt; 30 days overdue</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-sm">
        <div>
          <label htmlFor="search-invoices" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Search Invoice #, Roll, or Student
          </label>
          <input
            id="search-invoices"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g. INV-2025-0101, Sharma..."
            className="w-full h-9 px-3 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label htmlFor="filter-inv-status" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Billing Status
          </label>
          <select
            id="filter-inv-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-9 px-2.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="PAID">Fully Paid</option>
            <option value="PARTIAL">Partially Paid</option>
            <option value="DUE">Due (Within Window)</option>
            <option value="OVERDUE">Overdue Defaulter</option>
          </select>
        </div>

        <div>
          <label htmlFor="filter-fee-head" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Fee Head Category
          </label>
          <select
            id="filter-fee-head"
            value={headFilter}
            onChange={(e) => setHeadFilter(e.target.value)}
            className="w-full h-9 px-2.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">All Fee Heads</option>
            <option value="TUITION">Tuition Fee</option>
            <option value="LAB_WORKSHOP">Lab & Workshop Fee</option>
            <option value="HOSTEL_MESS">Hostel & Mess</option>
            <option value="EXAMINATION">Examination Fee</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 normal-case">
              <tr>
                <th className="py-2.5 px-3 sm:px-4">Invoice #</th>
                <th className="py-2.5 px-3 sm:px-4">Student Name & Roll</th>
                <th className="py-2.5 px-3 sm:px-4">Fee Head</th>
                <th className="py-2.5 px-3 sm:px-4 text-right">Billed Amount</th>
                <th className="py-2.5 px-3 sm:px-4 text-right">Balance Due</th>
                <th className="py-2.5 px-3 sm:px-4">Due Date</th>
                <th className="py-2.5 px-3 sm:px-4 text-center">Status</th>
                <th className="py-2.5 px-3 sm:px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInvoices.map((inv) => {
                const balance = inv.totalAmount - inv.paidAmount;

                return (
                  <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 sm:px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {inv.invoiceNo}
                    </td>
                    <td className="py-3 px-3 sm:px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{inv.studentName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {inv.studentRoll} • {inv.program} (Sem {inv.semester})
                      </div>
                    </td>
                    <td className="py-3 px-3 sm:px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {inv.feeHead.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-right font-mono font-semibold">
                      ₹{inv.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-right font-mono font-bold">
                      <span className={balance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                        ₹{balance.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {inv.dueDate}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : inv.status === 'PARTIAL'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : inv.status === 'OVERDUE'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-right space-x-1.5">
                      {balance > 0 && (
                        <button
                          type="button"
                          onClick={() => handleSendReminder(inv)}
                          title="Dispatch SMS Reminder"
                          className="px-2 py-1 text-[11px] font-semibold rounded bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        >
                          Remind
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setInspectedInvoice(inv)}
                        className="px-2 py-1 text-[11px] font-semibold rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: View Invoice Details */}
      {inspectedInvoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 max-w-md w-full text-slate-900 dark:text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setInspectedInvoice(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              aria-label="Close invoice dialog"
            >
              <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Official Invoice Voucher: {inspectedInvoice.invoiceNo}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{selectedInstitute?.name || 'Medhavi Skills University'}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-xs font-semibold normal-case">Student Name</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{inspectedInvoice.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-xs font-semibold normal-case">Roll Number</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{inspectedInvoice.studentRoll}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-xs font-semibold normal-case">Fee Head</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{inspectedInvoice.feeHead.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-xs font-semibold normal-case">Due Date</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{inspectedInvoice.dueDate}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice Total:</span>
                  <span className="font-bold">₹{inspectedInvoice.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Paid Amount:</span>
                  <span>- ₹{inspectedInvoice.paidAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-1.5 flex justify-between font-black text-sm">
                  <span>Remaining Due:</span>
                  <span className={inspectedInvoice.totalAmount - inspectedInvoice.paidAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                    ₹{(inspectedInvoice.totalAmount - inspectedInvoice.paidAmount).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setInspectedInvoice(null)}
                className="px-4 py-1.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Generate Batch Invoices */}
      {isGenerateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 max-w-md w-full text-slate-900 dark:text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setIsGenerateModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              aria-label="Close dialog"
            >
              <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-base font-bold mb-1">Generate Cohort Invoices</h3>
            <p className="text-xs text-slate-500 mb-4">
              Create official fee invoices for an entire degree cohort or semester.
            </p>

            <form onSubmit={handleGenerateInvoices} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Program
                  </label>
                  <select
                    value={batchProgram}
                    onChange={(e) => setBatchProgram(e.target.value)}
                    className="w-full h-9 px-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="B.Tech CSE">B.Tech CSE</option>
                    <option value="B.Des Product Design">B.Des Product Design</option>
                    <option value="MBA Vocational">MBA Vocational</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Semester
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={batchSemester}
                    onChange={(e) => setBatchSemester(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fee Head
                  </label>
                  <select
                    value={batchHead}
                    onChange={(e) => setBatchHead(e.target.value as any)}
                    className="w-full h-9 px-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="TUITION">Tuition Fee</option>
                    <option value="LAB_WORKSHOP">Lab & Workshop Fee</option>
                    <option value="HOSTEL_MESS">Hostel & Mess</option>
                    <option value="EXAMINATION">Examination Fee</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={500}
                    value={batchAmount}
                    onChange={(e) => setBatchAmount(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Due Date
                </label>
                <input
                  type="date"
                  required
                  value={batchDueDate}
                  onChange={(e) => setBatchDueDate(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-3 py-2 rounded border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow"
                >
                  Generate Invoices
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
