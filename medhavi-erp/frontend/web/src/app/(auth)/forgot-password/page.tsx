'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/shared/stores/auth-store';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const selectedInstitute = useAuthStore((state) => state.selectedInstitute);

  const [step, setStep] = useState<'IDENTIFIER' | 'OTP' | 'RESET' | 'SUCCESS'>('IDENTIFIER');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleIdentifierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your university Registration ID, Roll Number, or Email.');
      return;
    }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('OTP');
    }, 800);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const updated = [...otp];
    updated[index] = val;
    setOtp(updated);

    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('RESET');
    }, 800);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('SUCCESS');
    }, 1000);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Active University Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-900/60">
          {selectedInstitute?.name || 'Demo University'}
        </span>
        <Link
          href="/login"
          className="text-xs font-semibold text-brand-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded"
        >
          Back to Sign In
        </Link>
      </div>

      <div className="bg-paper border border-rule rounded-xl p-6 sm:p-8 shadow-sm text-ink">
        <div className="text-center mb-6">
          <div className="h-12 w-12 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-300 mx-auto flex items-center justify-center font-bold text-xl mb-3">
            <svg aria-hidden="true" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
            {step === 'IDENTIFIER' && 'Account Recovery'}
            {step === 'OTP' && 'Verify Security Code'}
            {step === 'RESET' && 'Set New Credentials'}
            {step === 'SUCCESS' && 'Password Recovered'}
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            {step === 'IDENTIFIER' && 'Enter your registered academic credentials to receive a verification code.'}
            {step === 'OTP' && `A 6-digit verification code has been dispatched for ${identifier}`}
            {step === 'RESET' && 'Choose a strong alphanumeric password for your ERP portal account.'}
            {step === 'SUCCESS' && 'Your credentials have been successfully updated. You can now access your account.'}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg bg-danger-soft border border-red-300 dark:border-red-900/60 text-danger p-3 text-xs flex items-center space-x-2"
          >
            <svg aria-hidden="true" className="w-4 h-4 text-danger flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Identifier */}
        {step === 'IDENTIFIER' && (
          <form onSubmit={handleIdentifierSubmit} className="space-y-4">
            <div>
              <label htmlFor="recovery-id" className="block text-xs font-semibold text-ink mb-1.5 normal-case">
                Registration ID or Institutional Email
              </label>
              <input
                id="recovery-id"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. DEMO/2024/BCSE042 or user@demouniversity.in"
                className="w-full h-11 px-3.5 text-xs sm:text-sm rounded-lg border border-rule bg-paper text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition-colors shadow-sm flex items-center justify-center space-x-2 disabled:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              {loading ? (
                <span>Dispatching Security Code...</span>
              ) : (
                <span>Request Verification Code</span>
              )}
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 'OTP' && (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div className="flex justify-center items-center gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !digit && idx > 0) {
                      document.getElementById(`otp-input-${idx - 1}`)?.focus();
                    }
                  }}
                  className="w-10 sm:w-12 h-12 text-center text-lg font-bold rounded-lg border border-rule bg-paper text-ink focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-ink-muted">
              <button
                type="button"
                onClick={() => setStep('IDENTIFIER')}
                className="hover:text-ink underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-600 rounded"
              >
                Change ID
              </button>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  alert('A new 6-digit code has been resent to your institutional contact.');
                }}
                className="hover:underline text-brand-600 font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-600 rounded"
              >
                Resend Code
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition-colors shadow-sm flex items-center justify-center space-x-2 disabled:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              {loading ? (
                <span>Validating Code...</span>
              ) : (
                <span>Verify and Proceed</span>
              )}
            </button>
          </form>
        )}

        {/* Step 3: Reset */}
        {step === 'RESET' && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div>
              <label htmlFor="new-pw" className="block text-xs font-semibold text-ink mb-1.5 normal-case">
                New Secure Password
              </label>
              <input
                id="new-pw"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full h-11 px-3.5 text-xs sm:text-sm rounded-lg border border-rule bg-paper text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>

            <div>
              <label htmlFor="confirm-pw" className="block text-xs font-semibold text-ink mb-1.5 normal-case">
                Confirm New Password
              </label>
              <input
                id="confirm-pw"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full h-11 px-3.5 text-xs sm:text-sm rounded-lg border border-rule bg-paper text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition-colors shadow-sm flex items-center justify-center space-x-2 disabled:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              {loading ? (
                <span>Updating Password...</span>
              ) : (
                <span>Update Password & Secure Account</span>
              )}
            </button>
          </form>
        )}

        {/* Step 4: Success */}
        {step === 'SUCCESS' && (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-success-soft text-success mx-auto flex items-center justify-center">
              <svg aria-hidden="true" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Your password has been changed. You can now log into your Demo University ERP dashboard.
            </p>
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full h-11 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              Proceed to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
