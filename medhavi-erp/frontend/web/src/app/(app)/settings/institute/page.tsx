'use client';

import { useState } from 'react';
import { useAuthStore } from '@/shared/stores/auth-store';

export default function InstituteSettingsPage() {
  const selectedInstitute = useAuthStore((state) => state.selectedInstitute);
  const setSelectedInstitute = useAuthStore((state) => state.setSelectedInstitute);

  // Institutional Details
  const [instName, setInstName] = useState(selectedInstitute?.name || 'Demo University');
  const [instCode, setInstCode] = useState(selectedInstitute?.code || 'DEMO-UNIV');
  const [address, setAddress] = useState('Main Campus, University Enclave, Demo District, 110001');
  const [stateName, setStateName] = useState(selectedInstitute?.state || 'Demo State');
  const [actNo, setActNo] = useState('Higher Education Act No. 42 of 2020 (UGC Section 2(f))');
  const [viceChancellor, setViceChancellor] = useState('Prof. (Dr.) A. K. Rai');
  const [registrar, setRegistrar] = useState('Dr. S. K. Sharma');
  const [email, setEmail] = useState('contact@demouniversity.in');
  const [phone, setPhone] = useState('+91 1800 200 8899');

  // Academic Policy
  const [attendanceCutoff, setAttendanceCutoff] = useState(75);
  const [gradingScale, setGradingScale] = useState('10_POINT_CBCS');
  const [activeSession, setActiveSession] = useState('2025-2026 Regular Term');
  const [defaulterSmsAlerts, setDefaulterSmsAlerts] = useState(true);

  // Status
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (selectedInstitute) {
      setSelectedInstitute({
        ...selectedInstitute,
        name: instName,
        code: instCode,
        state: stateName,
      });
    }

    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    }, 600);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Institute Profile & Campus Configuration
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Tenant Root
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Master organizational registry, statutory accreditation, and operational rules for {instName}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors disabled:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            {isSaving ? (
              <span>Saving Configurations...</span>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Institutional Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div
          role="alert"
          className="rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 p-3 text-xs flex items-center space-x-2"
        >
          <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold">Institutional profile settings updated across all microservices and tenant contexts!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Section 1: Statutory & University Profile */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Statutory University Identification
            </h2>
            <p className="text-[11px] text-slate-500">Legal name, gazette notification, and official credentials</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official University Name *
              </label>
              <input
                type="text"
                required
                value={instName}
                onChange={(e) => setInstName(e.target.value)}
                className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Institutional Identifier Code *
              </label>
              <input
                type="text"
                required
                value={instCode}
                onChange={(e) => setInstCode(e.target.value)}
                className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 uppercase font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Statutory University Act / Gazette Notification
            </label>
            <input
              type="text"
              value={actNo}
              onChange={(e) => setActNo(e.target.value)}
              className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vice Chancellor / Head of Institute
              </label>
              <input
                type="text"
                value={viceChancellor}
                onChange={(e) => setViceChancellor(e.target.value)}
                className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Registrar / Secretary
              </label>
              <input
                type="text"
                value={registrar}
                onChange={(e) => setRegistrar(e.target.value)}
                className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Main Campus Physical Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                State / Jurisdiction
              </label>
              <input
                type="text"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Helpdesk Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Emergency & Support Hotline Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Academic & Examination Rules */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Academic Governance & Grading Rules
            </h2>
            <p className="text-[11px] text-slate-500">Grading scales, attendance thresholds, and automated alerts</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Active Academic Session
              </label>
              <select
                value={activeSession}
                onChange={(e) => setActiveSession(e.target.value)}
                className="w-full h-9 px-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="2025-2026 Regular Term">2025-2026 Regular Term</option>
                <option value="2024-2025 Academic Year">2024-2025 Academic Year</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Grading System Standard
              </label>
              <select
                value={gradingScale}
                onChange={(e) => setGradingScale(e.target.value)}
                className="w-full h-9 px-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="10_POINT_CBCS">UGC 10-Point Choice Based Credit System (CBCS)</option>
                <option value="4_POINT_GPA">International 4.0 GPA System</option>
                <option value="PERCENTAGE">Standard Percentage Scale</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Attendance Defaulter Threshold (%)
              </label>
              <input
                type="number"
                min={50}
                max={90}
                value={attendanceCutoff}
                onChange={(e) => setAttendanceCutoff(Number(e.target.value))}
                className="w-full h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <input
              id="sms-alerts"
              type="checkbox"
              checked={defaulterSmsAlerts}
              onChange={(e) => setDefaulterSmsAlerts(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
            />
            <label htmlFor="sms-alerts" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Automatically trigger daily WhatsApp / SMS alerts to parents when student attendance falls below {attendanceCutoff}%
            </label>
          </div>
        </div>

        {/* Section 3: Campus Nodes */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Connected University Campus Nodes
              </h2>
              <p className="text-[11px] text-slate-500">Distributed branch campuses and vocational training centers</p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              3 Online
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Main Demo Campus</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Central Academic Enclave • Headquarters</div>
              <div className="mt-2 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">● Primary Host</div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="font-bold text-xs text-slate-900 dark:text-slate-100">North Campus Node</div>
              <div className="text-[11px] text-slate-500 mt-0.5">North District • Skill Center</div>
              <div className="mt-2 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">● Active Sync</div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="font-bold text-xs text-slate-900 dark:text-slate-100">South Regional Centre</div>
              <div className="text-[11px] text-slate-500 mt-0.5">South Zone • Innovation Hub</div>
              <div className="mt-2 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">● Active Sync</div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
