'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, SelectedInstitute } from '@/shared/stores/auth-store';

const INSTITUTES: SelectedInstitute[] = [
  {
    id: 'demo-univ',
    name: 'Demo University',
    code: 'DEMO-UNIV',
    location: 'Main Campus',
    state: 'Demo State',
  },
  {
    id: 'demo-north',
    name: 'Demo University (North Campus)',
    code: 'DEMO-NRTH',
    location: 'North Campus',
    state: 'Demo State',
  },
  {
    id: 'demo-south',
    name: 'Demo University (South Centre)',
    code: 'DEMO-STH',
    location: 'South Campus',
    state: 'Demo State',
  },
  {
    id: 'dseu-delhi',
    name: 'Delhi Skill & Entrepreneurship Partner Centre',
    code: 'DSEU-DL',
    location: 'Dwarka, New Delhi',
    state: 'Delhi',
  },
];

export default function SelectInstitutePage() {
  const router = useRouter();
  const setSelectedInstitute = useAuthStore((state) => state.setSelectedInstitute);
  const selectedInstitute = useAuthStore((state) => state.selectedInstitute);

  const [searchQuery, setSearchQuery] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [customError, setCustomError] = useState<string | null>(null);

  const filtered = INSTITUTES.filter((inst) =>
    inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inst.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inst.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inst.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (inst: SelectedInstitute) => {
    setSelectedInstitute(inst);
    router.push('/login');
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);
    const trimmed = customCode.trim().toUpperCase();
    if (!trimmed) {
      setCustomError('Please enter an institute code');
      return;
    }

    const found = INSTITUTES.find((i) => i.code === trimmed);
    if (found) {
      handleSelect(found);
    } else {
      // Dynamic fallback for custom institute
      const dynamicInst: SelectedInstitute = {
        id: trimmed.toLowerCase(),
        name: `Institute (${trimmed})`,
        code: trimmed,
        location: 'Authorized Campus',
        state: 'India',
      };
      handleSelect(dynamicInst);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
      {/* Title */}
      <div className="w-full text-center mb-6 px-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
          Select Your University or Institute
        </h1>
        <p className="text-ink-muted text-xs sm:text-sm mt-1.5 font-medium">
          Choose your affiliated institution to access your academic and operational portal.
        </p>
      </div>

      {/* Main Selection Card */}
      <div className="w-full bg-paper border border-rule rounded-xl p-6 sm:p-8 shadow-sm text-ink">
        {/* Search Bar */}
        <div className="mb-5">
          <label htmlFor="search-institute" className="block text-xs font-semibold normal-case text-ink-muted mb-1.5">
            Search University or Campus
          </label>
          <div className="relative">
            <input
              id="search-institute"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by university name, campus location, or code (e.g. DEMO-UNIV)..."
              className="w-full h-11 pl-10 pr-4 text-xs sm:text-sm rounded-lg border border-rule bg-paper text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-600"
            />
            <svg
              aria-hidden="true"
              className="w-4 h-4 text-ink-muted absolute left-3.5 top-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Institute List */}
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {filtered.map((inst) => {
            const isCurrent = selectedInstitute?.id === inst.id;
            return (
              <button
                key={inst.id}
                type="button"
                onClick={() => handleSelect(inst)}
                className={`w-full text-left p-3.5 rounded-lg border transition-colors flex items-center justify-between group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
                  isCurrent
                    ? 'bg-brand-50 border-brand-600 text-brand-950 dark:bg-brand-950/40 dark:text-brand-100 ring-1 ring-brand-600'
                    : 'border-rule bg-paper hover:bg-paper-2 text-ink'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-ink group-hover:text-brand-600 transition-colors">
                      {inst.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-100/60 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 font-semibold">
                      {inst.code}
                    </span>
                  </div>
                  <div className="text-xs text-ink-muted mt-0.5">
                    {inst.location}, {inst.state}
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                  {isCurrent && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-success-soft text-success border border-emerald-500/40">
                      Selected
                    </span>
                  )}
                  <svg
                    aria-hidden="true"
                    className="w-4 h-4 text-ink-muted group-hover:text-ink transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-6 text-xs text-ink-muted">
              No matching institution found. Enter your institute code below.
            </div>
          )}
        </div>

        {/* Enter Code Directly */}
        <div className="mt-6 pt-5 border-t border-rule">
          <form onSubmit={handleCustomSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
            <input
              type="text"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              placeholder="Or enter Institute Code (e.g. DEMO-UNIV)"
              className="w-full sm:flex-1 h-10 px-3.5 text-xs rounded-lg border border-rule bg-paper text-ink placeholder:text-ink-muted uppercase font-mono focus:outline-none focus:ring-2 focus:ring-brand-600"
            />
            <button
              type="submit"
              className="w-full sm:w-auto h-10 px-5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              Continue to Portal
            </button>
          </form>
          {customError && (
            <p className="mt-1 text-xs text-danger font-medium">
              {customError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
