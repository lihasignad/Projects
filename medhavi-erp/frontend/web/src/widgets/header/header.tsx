'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/shared/stores/auth-store';

interface Persona {
  id: string;
  name: string;
  roleTitle: string;
  department: string;
  targetPath: string;
  badge: string;
  email: string;
}

const PERSONAS: Persona[] = [
  {
    id: 'student',
    name: 'Priya Sharma',
    roleTitle: 'Student (2023CSE042)',
    department: 'B.Tech CSE Sem 5',
    targetPath: '/portal/student',
    badge: 'Student',
    email: 'priya.sharma@msu.edu.in',
  },
  {
    id: 'faculty',
    name: 'Dr. Arvind Rao',
    roleTitle: 'Associate Professor',
    department: 'Computer Science & Engg',
    targetPath: '/portal/faculty',
    badge: 'Faculty',
    email: 'arvind.rao@msu.edu.in',
  },
  {
    id: 'hod',
    name: 'Dr. Meenakshi Sundaram',
    roleTitle: 'Head of Department',
    department: 'Dept of Computer Science',
    targetPath: '/portal/hod',
    badge: 'HOD',
    email: 'hod.cse@msu.edu.in',
  },
  {
    id: 'dean',
    name: 'Prof. Rajeshwar Kulkarni',
    roleTitle: 'Dean of Faculty',
    department: 'School of Engineering & Tech',
    targetPath: '/portal/dean',
    badge: 'Dean',
    email: 'dean.soe@msu.edu.in',
  },
  {
    id: 'admin',
    name: 'Admin Desk',
    roleTitle: 'University Registrar / Superadmin',
    department: 'Central Administration',
    targetPath: '/dashboard',
    badge: 'Admin',
    email: 'admin@medhavi.local',
  },
];

interface HeaderProps {
  onOpenSidebar: () => void;
}

export function Header({ onOpenSidebar }: HeaderProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const roles = useAuthStore((state) => state.roles);
  const selectedInstitute = useAuthStore((state) => state.selectedInstitute);
  const logout = useAuthStore((state) => state.logout);
  const setAuth = useAuthStore((state) => state.setAuth);

  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPersonaOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const primaryRole = roles.find((r) => r.isPrimary)?.name || roles[0]?.name || 'Student';

  const handleSelectPersona = (p: Persona) => {
    setIsPersonaOpen(false);
    setAuth({
      accessToken: 'demo_token_' + p.id,
      refreshToken: 'demo_refresh_' + p.id,
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: {
        id: 'usr_' + p.id,
        instituteId: selectedInstitute?.id || 'msu-sikkim',
        email: p.email,
        firstName: p.name.split(' ')[0] ?? p.name,
        lastName: p.name.split(' ').slice(1).join(' ') || null,
        displayName: p.name,
        status: 'ACTIVE',
        mfaEnabled: false,
        mustChangePassword: false,
      },
      roles: [
        {
          key: p.badge.toLowerCase(),
          name: p.roleTitle,
          scopeType: p.badge === 'Dean' ? 'SCHOOL' : p.badge === 'HOD' ? 'DEPARTMENT' : 'CAMPUS',
          scopeId: 'scope_' + p.id,
          isPrimary: true,
        },
      ],
      permissions: ['*'],
    });
    router.push(p.targetPath);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Institute Context */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open sidebar navigation menu"
          className="md:hidden p-1.5 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 tracking-tight truncate max-w-[180px] sm:max-w-[280px]">
            {selectedInstitute?.name || 'Medhavi Skills University'}
          </span>
          <span className="hidden sm:inline-block text-slate-300 dark:text-slate-700">|</span>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            Autumn 2025-26
          </span>
        </div>
      </div>

      {/* Right: Persona Switcher, Theme & User */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Role/Persona Switcher Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsPersonaOpen(!isPersonaOpen)}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
            title="Switch portal perspective"
          >
            <span className="text-brand-600 dark:text-brand-400 font-semibold text-[11px]">Role:</span>
            <span className="max-w-[100px] truncate">{primaryRole}</span>
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isPersonaOpen && (
            <div className="absolute right-0 mt-1.5 w-72 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-1.5 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Switch Portal Perspective
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto py-1">
                {PERSONAS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPersona(p)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/70 flex items-start space-x-2.5 transition-colors"
                  >
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 mt-0.5">
                      {p.badge}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {p.roleTitle} · {p.department}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle visual theme"
          className="p-1.5 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
        >
          {theme === 'dark' ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* User Pill */}
        <div className="flex items-center pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800 space-x-2">
          <div className="h-7 w-7 rounded bg-brand-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
            {user?.firstName?.charAt(0) || 'P'}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
              {user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Priya Sharma'}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
              {primaryRole}
            </div>
          </div>

          {/* Sign Out */}
          <button
            type="button"
            onClick={handleLogout}
            title="Sign out of system"
            aria-label="Sign out"
            className="ml-1 p-1.5 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
