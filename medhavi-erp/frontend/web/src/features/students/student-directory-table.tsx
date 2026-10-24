'use client';

import Link from 'next/link';
import { Column, DataTable } from '@/shared/ui/data-table';
import { StudentRecord } from './student-types';

interface StudentDirectoryTableProps {
  students: StudentRecord[];
  isLoading?: boolean;
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onInspectStudent: (student: StudentRecord) => void;
}

export function StudentDirectoryTable({
  students,
  isLoading,
  currentPage,
  totalPages,
  totalRecords,
  onPageChange,
  onInspectStudent,
}: StudentDirectoryTableProps) {
  const columns: Column<StudentRecord>[] = [
    {
      key: 'rollNumber',
      header: 'Student & Roll No',
      render: (student) => (
        <div className="flex flex-col">
          <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-[11px]">
            {student.rollNumber}
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
            {student.firstName} {student.lastName}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            {student.email}
          </span>
        </div>
      ),
    },
    {
      key: 'program',
      header: 'Program & Semester',
      render: (student) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-800 dark:text-slate-200">
            {student.program}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Semester {student.semester} • Batch {student.batch}
          </span>
        </div>
      ),
    },
    {
      key: 'attendancePercentage',
      header: 'Attendance',
      align: 'center',
      render: (student) => {
        const pct = student.attendancePercentage;
        const isDefaulter = pct < 75;
        const isCritical = pct < 65;

        return (
          <div className="flex flex-col items-center">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                isCritical
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                  : isDefaulter
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
              }`}
            >
              {pct}%
            </span>
            {isDefaulter && (
              <span className="text-[9px] font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
                Defaulter
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'feeStatus',
      header: 'Fee Ledger',
      render: (student) => (
        <div className="flex flex-col">
          {student.feeStatus === 'PAID' ? (
            <span className="inline-flex items-center w-max px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
              Clear (Paid)
            </span>
          ) : student.feeStatus === 'SCHOLARSHIP' ? (
            <span className="inline-flex items-center w-max px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-900">
              Scholarship
            </span>
          ) : (
            <>
              <span className="inline-flex items-center w-max px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                Installment Due
              </span>
              <span className="font-mono text-[10px] text-rose-600 dark:text-rose-400 font-semibold mt-0.5">
                ₹{student.feeDueAmount.toLocaleString('en-IN')} pending
              </span>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Contact / Guardian',
      render: (student) => (
        <div className="flex flex-col text-[11px]">
          <span className="font-mono text-slate-700 dark:text-slate-300">
            +91 {student.phone}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Guardian: {student.guardianName}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (student) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={() => onInspectStudent(student)}
            className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition-colors"
          >
            Quick View
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable<StudentRecord>
      columns={columns}
      data={students}
      keyExtractor={(s) => s.id}
      isLoading={isLoading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalRecords={totalRecords}
      onPageChange={onPageChange}
      emptyMessage="No students match the selected program or search filter."
    />
  );
}
