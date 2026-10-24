'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, SelectedInstitute } from '@/shared/stores/auth-store';

const INSTITUTES: SelectedInstitute[] = [
  {
    id: 'msu-sikkim',
    name: 'Medhavi Skills University',
    code: 'MSU-SKM',
    location: 'Bermiok, West Sikkim',
    state: 'Sikkim',
  },
  {
    id: 'msu-singtam',
    name: 'Medhavi Skills University (Singtam Campus)',
    code: 'MSU-SNG',
    location: 'Singtam, East Sikkim',
    state: 'Sikkim',
  },
  {
    id: 'msu-guwahati',
    name: 'Medhavi Skills University (Assam Centre)',
    code: 'MSU-GWX',
    location: 'Guwahati, Kamrup Metro',
    state: 'Assam',
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
        <div className="text-amber-500 font-extrabold uppercase tracking-wider text-xs sm:text-sm drop-shadow-sm">
          COACHUP MULTI-TENANT ERP
        </div>
        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#0284c7] drop-shadow-sm mt-1">
          Select Your University / Institute
        </h1>
        <p className="text-slate-700 dark:text-slate-200 text-xs sm:text-sm mt-1 font-medium">
          Choose your enrolled institution to access your customized academic, attendance, and fee portal.
        </p>
      </div>

      {/* Main Selection Card */}
      <div className="w-full bg-[#374151]/95 dark:bg-[#1f2937]/95 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/10 text-white">
        {/* Search Bar */}
        <div className="mb-5">
          <label htmlFor="search-institute" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Search University / Campus
          </label>
          <div className="relative">
            <input
              id="search-institute"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by university name, campus location, or code (e.g. MSU-SKM)..."
              className="w-full h-11 pl-10 pr-4 text-xs sm:text-sm rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5"
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
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between group ${
                  isCurrent
                    ? 'bg-[#0284c7]/20 border-[#0284c7] text-white ring-1 ring-[#0284c7]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                      {inst.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-amber-400 font-semibold">
                      {inst.code}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {inst.location} • {inst.state}
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                  {isCurrent && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Selected
                    </span>
                  )}
                  <svg
                    className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors"
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
            <div className="text-center py-6 text-xs text-slate-400">
              No matching institution found. Enter your institute code below.
            </div>
          )}
        </div>

        {/* Enter Code Directly */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <form onSubmit={handleCustomSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
            <input
              type="text"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              placeholder="Or enter Institute Code (e.g. MSU-SKM)"
              className="w-full sm:flex-1 h-10 px-3.5 text-xs rounded-lg bg-white text-slate-800 placeholder-slate-400 uppercase font-mono focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
            />
            <button
              type="submit"
              className="w-full sm:w-auto h-10 px-5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs transition-colors flex-shrink-0"
            >
              Continue &rarr;
            </button>
          </form>
          {customError && (
            <p className="mt-1 text-xs text-rose-300 font-medium">
              {customError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
