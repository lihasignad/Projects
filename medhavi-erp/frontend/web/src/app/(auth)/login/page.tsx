'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/shared/api/client';
import { useAuthStore } from '@/shared/stores/auth-store';
import type { AuthResponse } from '@/shared/types/auth';

const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Registration ID, email or phone is required'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        email: data.identifier,
        password: data.password,
      });

      setAuth(response.data);
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as {
          response?: {
            status?: number;
            data?: { message?: string | string[] };
          };
        };

        if (axiosErr.response?.status === 401) {
          setServerError('Invalid credentials. Please verify your registration ID and password.');
        } else if (axiosErr.response?.status === 429) {
          setServerError('Too many login attempts. Please wait a minute before trying again.');
        } else if (axiosErr.response?.data?.message) {
          const msg = axiosErr.response.data.message;
          setServerError(Array.isArray(msg) ? msg.join(', ') : msg);
        } else {
          setServerError('Authentication failed. Please verify credentials or contact helpdesk.');
        }
      } else {
        setServerError('Unable to connect to the authentication server.');
      }
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
      {/* University Institutional Title Header */}
      <div className="w-full text-left mb-6 sm:mb-8 px-2">
        <div className="text-amber-500 font-extrabold uppercase tracking-wider text-sm sm:text-base md:text-lg drop-shadow-sm">
          WELCOME TO
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-[#0284c7] drop-shadow-sm leading-tight">
          MEDHAVI SKILLS<br />UNIVERSITY
        </h1>
        <div className="text-amber-500 font-extrabold uppercase tracking-widest text-xs sm:text-sm md:text-base mt-1 drop-shadow-sm">
          SIKKIM
        </div>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div
          role="alert"
          aria-live="polite"
          className="w-full max-w-3xl mb-4 rounded-lg bg-rose-900/90 border border-rose-500 text-white p-3 text-xs flex items-center space-x-2 backdrop-blur-md shadow-lg"
        >
          <svg className="w-4 h-4 text-rose-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
          <span>{serverError}</span>
        </div>
      )}

      {/* Main Container with 2 Cards */}
      <div className="w-full flex flex-col md:flex-row items-stretch gap-5 sm:gap-6">
        {/* Card 1: Primary Sign in here */}
        <div className="flex-1 bg-[#374151]/95 dark:bg-[#1f2937]/95 backdrop-blur-md rounded-2xl p-6 sm:p-7 shadow-2xl border border-white/10 flex flex-col justify-between">
          <div>
            <h2 className="text-white text-base sm:text-lg font-semibold mb-4 tracking-tight">
              Sign in here
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Dual Side-by-Side Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <input
                    id="identifier"
                    type="text"
                    placeholder="Registration id/email/phone no."
                    disabled={isSubmitting}
                    className={`w-full h-11 px-3.5 text-xs sm:text-sm rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7] transition-all ${
                      errors.identifier ? 'ring-2 ring-rose-500' : ''
                    }`}
                    {...register('identifier')}
                  />
                  {errors.identifier && (
                    <p className="mt-1 text-[11px] text-rose-300 font-medium">
                      {errors.identifier.message}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    disabled={isSubmitting}
                    className={`w-full h-11 pl-3.5 pr-10 text-xs sm:text-sm rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7] transition-all ${
                      errors.password ? 'ring-2 ring-rose-500' : ''
                    }`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-700 focus:outline-none"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                  {errors.password && (
                    <p className="mt-1 text-[11px] text-rose-300 font-medium">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Cloudflare Verification Widget */}
              <div className="bg-white rounded-lg p-2.5 sm:px-4 flex items-center justify-between shadow-inner border border-slate-200">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-800">Success!</span>
                </div>

                <div className="flex flex-col items-end">
                  <div className="flex items-center space-x-1.5">
                    <svg className="w-6 h-3 text-[#f38020]" viewBox="0 0 120 60" fill="currentColor">
                      <path d="M96 28c-1.5-7.7-8.3-13.6-16.5-13.6-5.8 0-11 3-14.1 7.6-2.5-1.6-5.5-2.6-8.7-2.6-7.8 0-14.3 5.7-15.6 13.2-1.3-.4-2.7-.6-4.1-.6-7.7 0-14 6.3-14 14s6.3 14 14 14h55c6.6 0 12-5.4 12-12 0-5.8-4.2-10.7-9.9-11.8z" />
                    </svg>
                    <span className="text-[10px] font-black tracking-wider text-slate-700 uppercase">
                      CLOUDFLARE
                    </span>
                  </div>
                  <div className="text-[8px] text-slate-400 space-x-1">
                    <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer" className="hover:underline">Privacy</a>
                    <span>•</span>
                    <a href="https://support.cloudflare.com" target="_blank" rel="noreferrer" className="hover:underline">Help</a>
                  </div>
                </div>
              </div>

              {/* Coral Red Action Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-lg bg-[#ff4d4f] hover:bg-[#ff3b3e] active:scale-[0.99] text-white font-medium text-sm transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Sign in</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Sublinks */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/90">
            <a href="/forgot-password" className="hover:underline hover:text-white transition-colors">
              Forgot password?
            </a>
            <a href="mailto:support@medhavi.edu.in" className="hover:underline hover:text-white transition-colors">
              Need assistance? Get Help Here
            </a>
          </div>
        </div>

        {/* Card 2: Companion Sign in with Google */}
        <div className="md:w-56 bg-[#374151]/95 dark:bg-[#1f2937]/95 backdrop-blur-md rounded-2xl p-6 sm:p-7 shadow-2xl border border-white/10 flex flex-col justify-between items-center text-center">
          <div className="w-full">
            <h2 className="text-white text-base sm:text-lg font-semibold mb-6 tracking-tight">
              Sign in with
            </h2>

            <div className="flex justify-center items-center py-4">
              <button
                type="button"
                onClick={() => {
                  window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/google`;
                }}
                title="Sign in with institutional Google account"
                aria-label="Sign in with Google"
                className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.91 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.93 6.72-4.93z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="text-[11px] text-white/70">
            Institutional single sign-on
          </div>
        </div>
      </div>
    </div>
  );
}
