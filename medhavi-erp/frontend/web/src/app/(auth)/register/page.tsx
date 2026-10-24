'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/shared/stores/auth-store';

const registerSchema = z
  .object({
    role: z.enum(['STUDENT', 'FACULTY', 'STAFF']),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().optional(),
    identifier: z.string().min(2, 'Roll Number / Employee ID is required'),
    email: z.string().email('Please enter a valid email address'),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const selectedInstitute = useAuthStore((state) => state.selectedInstitute);
  const setAuth = useAuthStore((state) => state.setAuth);

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'STUDENT',
      firstName: '',
      lastName: '',
      identifier: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      // Create user session and authenticate
      const mockAuthUser = {
        id: `user-${Date.now()}`,
        instituteId: selectedInstitute?.id || 'msu-sikkim',
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName || null,
        displayName: `${data.firstName} ${data.lastName || ''}`.trim(),
        status: 'ACTIVE',
        mfaEnabled: false,
        mustChangePassword: false,
      };

      const mockRole = {
        key: data.role.toLowerCase(),
        name: data.role === 'STUDENT' ? 'Student' : 'Faculty Member',
        scopeType: 'INSTITUTE',
        scopeId: selectedInstitute?.id || null,
        isPrimary: true,
      };

      setAuth({
        accessToken: `simulated-jwt-${Date.now()}`,
        refreshToken: `simulated-refresh-${Date.now()}`,
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: mockAuthUser,
        roles: [mockRole],
        permissions: ['*'],
      });

      router.push('/dashboard');
    } catch {
      setServerError('Registration failed. Please contact the academic registry.');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* University Title Header */}
      <div className="w-full text-left mb-6 px-2">
        <div className="text-amber-500 font-extrabold uppercase tracking-wider text-xs sm:text-sm drop-shadow-sm">
          {selectedInstitute?.name || 'MEDHAVI SKILLS UNIVERSITY'}
        </div>
        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#0284c7] drop-shadow-sm leading-tight">
          Create Your Academic Account
        </h1>
        <p className="text-slate-800 dark:text-slate-200 text-xs sm:text-sm mt-1 font-medium">
          Register with your institute enrollment or employee credentials to access courses, fees, and marks.
        </p>
      </div>

      {serverError && (
        <div
          role="alert"
          aria-live="polite"
          className="w-full mb-4 rounded-lg bg-rose-900/90 border border-rose-500 text-white p-3 text-xs flex items-center space-x-2 backdrop-blur-md"
        >
          <span>{serverError}</span>
        </div>
      )}

      {/* Registration Card */}
      <div className="w-full bg-[#374151]/95 dark:bg-[#1f2937]/95 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/10 text-white">
        {/* Role Toggle Tabs */}
        <div className="mb-5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Registering As
          </label>
          <div className="grid grid-cols-2 gap-2 bg-white/10 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setValue('role', 'STUDENT')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                selectedRole === 'STUDENT'
                  ? 'bg-[#0284c7] text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Enrolled Student
            </button>
            <button
              type="button"
              onClick={() => setValue('role', 'FACULTY')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                selectedRole === 'FACULTY'
                  ? 'bg-[#0284c7] text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Faculty / Staff
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Name Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="firstName" className="block text-xs font-semibold text-slate-200 mb-1">
                First Name <span className="text-rose-400">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                placeholder="First name"
                disabled={isSubmitting}
                className="w-full h-11 px-3.5 text-xs sm:text-sm rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="mt-1 text-[11px] text-rose-300 font-medium">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-xs font-semibold text-slate-200 mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                placeholder="Last name"
                disabled={isSubmitting}
                className="w-full h-11 px-3.5 text-xs sm:text-sm rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                {...register('lastName')}
              />
            </div>
          </div>

          {/* Identifier (Roll No / Employee ID) */}
          <div>
            <label htmlFor="identifier" className="block text-xs font-semibold text-slate-200 mb-1">
              {selectedRole === 'STUDENT' ? 'Student Roll No / Enrollment ID' : 'Employee ID'} <span className="text-rose-400">*</span>
            </label>
            <input
              id="identifier"
              type="text"
              placeholder={selectedRole === 'STUDENT' ? 'e.g. MSU/2024/BCSE042' : 'e.g. FAC-CSE-108'}
              disabled={isSubmitting}
              className="w-full h-11 px-3.5 text-xs sm:text-sm rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
              {...register('identifier')}
            />
            {errors.identifier && (
              <p className="mt-1 text-[11px] text-rose-300 font-medium">{errors.identifier.message}</p>
            )}
          </div>

          {/* Contact Row (Email & Indian Phone) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-200 mb-1">
                Email Address <span className="text-rose-400">*</span>
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@msu.edu.in"
                disabled={isSubmitting}
                className="w-full h-11 px-3.5 text-xs sm:text-sm rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-[11px] text-rose-300 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-slate-200 mb-1">
                Mobile Number <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-xs font-medium text-slate-500">+91</span>
                <input
                  id="phone"
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  disabled={isSubmitting}
                  className="w-full h-11 pl-12 pr-3.5 text-xs sm:text-sm rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                  {...register('phone')}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-[11px] text-rose-300 font-medium">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-200 mb-1">
                Password <span className="text-rose-400">*</span>
              </label>
              <input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                disabled={isSubmitting}
                className="w-full h-11 px-3.5 text-xs sm:text-sm rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-[11px] text-rose-300 font-medium">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-200 mb-1">
                Confirm Password <span className="text-rose-400">*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Re-type password"
                disabled={isSubmitting}
                className="w-full h-11 px-3.5 text-xs sm:text-sm rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-[11px] text-rose-300 font-medium">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-lg bg-[#ff4d4f] hover:bg-[#ff3b3e] active:scale-[0.99] text-white font-medium text-sm transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-75"
            >
              {isSubmitting ? (
                <span>Creating Account...</span>
              ) : (
                <span>Register & Access Portal</span>
              )}
            </button>
          </div>
        </form>

        {/* Back to Login Link */}
        <div className="mt-5 pt-4 border-t border-white/10 text-center text-xs text-white/90">
          Already have an account?{' '}
          <a href="/login" className="font-bold text-amber-400 hover:underline">
            Sign in here
          </a>
        </div>
      </div>
    </div>
  );
}
