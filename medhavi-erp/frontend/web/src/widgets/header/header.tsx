'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/shared/stores/auth-store';
import { getActiveRole, REGISTERED_ACCOUNTS, type UserAccountCredential } from '@/shared/rbac/portal-rbac';

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

  const activeRole = getActiveRole(roles);
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

  const handleSelectAccount = (account: UserAccountCredential) => {
    setIsPersonaOpen(false);
    setAuth({
      accessToken: 'demo_token_' + account.role,
      refreshToken: 'demo_refresh_' + account.role,
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: {
        id: 'usr_' + account.role,
        instituteId: selectedInstitute?.id || 'msu-sikkim',
        email: account.email,
        firstName: account.name.split(' ')[0] ?? account.name,
        lastName: account.name.split(' ').slice(1).join(' ') || null,
        displayName: account.name,
        status: 'ACTIVE',
        mfaEnabled: false,
        mustChangePassword: false,
      },
      roles: [
        {
          key: account.role,
          name: account.roleTitle,
          scopeType: account.role === 'dean' ? 'SCHOOL' : account.role === 'hod' ? 'DEPARTMENT' : 'CAMPUS',
          scopeId: 'scope_' + account.role,
          isPrimary: true,
        },
      ],
      permissions: ['*'],
    });
    router.push(account.targetPath);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const uniquePersonas = REGISTERED_ACCOUNTS.filter(
    (acc, idx, self) => idx === self.findIndex((a) => a.role === acc.role)
  );

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
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
              {activeRole}
            </span>
            <span className="max-w-[120px] truncate font-semibold">
              {user?.displayName || user?.firstName || 'Select Role'}
            </span>
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isPersonaOpen && (
            <div className="absolute right-0 mt-1.5 w-80 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-1.5 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Switch Portal Perspective
                </div>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  Active: {activeRole.toUpperCase()}
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto py-1">
                {uniquePersonas.map((account) => {
                  const isCurrent = activeRole === account.role;
                  return (
                    <button
                      key={account.role}
                      type="button"
                      onClick={() => handleSelectAccount(account)}
                      className={`w-full text-left px-3 py-2 flex items-start space-x-2.5 transition-colors ${
                        isCurrent
                          ? 'bg-brand-50/70 dark:bg-brand-950/40 border-l-2 border-brand-600'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-bold rounded uppercase mt-0.5 font-mono ${
                          account.role === 'student'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : account.role === 'faculty'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : account.role === 'hod'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : account.role === 'dean'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {account.role}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {account.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {account.roleTitle} · {account.email}
                        </div>
                      </div>
                    </button>
                  );
                })}
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
            {user?.firstName?.charAt(0) || activeRole.charAt(0)}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
              {user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Active User'}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
              {activeRole} portal
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
