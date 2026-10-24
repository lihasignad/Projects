'use client';

import { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  render?: (row: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  isLoading?: boolean | undefined;
  emptyMessage?: string | undefined;
  currentPage?: number | undefined;
  totalPages?: number | undefined;
  totalRecords?: number | undefined;
  onPageChange?: ((page: number) => void) | undefined;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No records found matching your filters.',
  currentPage = 1,
  totalPages = 1,
  totalRecords = 0,
  onPageChange,
}: DataTableProps<T>) {
  return (
    <div className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      {/* Contained Horizontal Scroll Region */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-3.5 py-3 font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] select-none ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  } ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {isLoading ? (
              // Loading Skeleton
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={`skeleton-${rIdx}`} className="animate-pulse">
                  {columns.map((col) => (
                    <td key={col.key} className="px-3.5 py-3">
                      <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-slate-500 dark:text-slate-400"
                >
                  <div className="flex flex-col items-center justify-center space-y-1.5">
                    <svg
                      className="w-8 h-8 text-slate-400 dark:text-slate-600 mb-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {emptyMessage}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Try adjusting your search criteria or clearing filters.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              // Populated Rows
              data.map((row, rIdx) => (
                <tr
                  key={keyExtractor(row)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-3.5 py-3 text-slate-800 dark:text-slate-200 ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      } ${col.className || ''}`}
                    >
                      {col.render
                        ? col.render(row, rIdx)
                        : ((row as Record<string, unknown>)[col.key] as ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 dark:text-slate-400 text-[11px]">
            Showing page <span className="font-semibold text-slate-700 dark:text-slate-200">{currentPage}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{totalPages}</span>
            {totalRecords > 0 && ` (${totalRecords} total records)`}
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => onPageChange?.(currentPage - 1)}
              className="px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium text-[11px]"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => onPageChange?.(currentPage + 1)}
              className="px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium text-[11px]"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
