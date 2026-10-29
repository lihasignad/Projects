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
        instituteId: selectedInstitute?.id || 'demo-univ',
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
    <header className="h-14 border-b border-rule bg-paper px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Institute Context */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open sidebar navigation menu"
          className="md:hidden p-1.5 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
        >
          <svg className="w-5 h-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-ink tracking-tight truncate max-w-[180px] sm:max-w-[280px]">
            {selectedInstitute?.name && !selectedInstitute.name.includes('Medhavi')
              ? selectedInstitute.name
              : 'Demo University'}
          </span>
          <span className="hidden sm:inline-block text-ink-muted">|</span>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-paper-2 text-ink-muted">
            Autumn 2025-26
          </span>
        </div>
      </div>

      {/* Right: Persona Switcher, Theme & User */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Role/Persona Switcher Dropdown (Dev Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsPersonaOpen(!isPersonaOpen)}
              className="flex items-center space-x-2 px-2.5 py-1.5 rounded border border-rule bg-paper-2 hover:bg-paper-3 text-xs font-medium text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
              title="Switch portal perspective"
            >
              <span className="px-2 py-0.5 rounded text-xs font-semibold capitalize bg-brand-50 text-brand-600">
                {activeRole}
              </span>
              <span className="max-w-[120px] truncate font-semibold hidden sm:inline">
                {user?.displayName || user?.firstName || 'Select role'}
              </span>
              <svg className="w-3.5 h-3.5 text-ink-muted" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isPersonaOpen && (
              <div className="absolute right-0 mt-1.5 w-80 rounded-lg shadow-xl border border-rule bg-paper py-1.5 z-50">
                <div className="px-3 py-1.5 border-b border-rule flex items-center justify-between">
                  <div className="text-xs font-semibold text-ink-muted normal-case">
                    Switch portal perspective
                  </div>
                  <span className="text-xs text-success font-medium capitalize">
                    Active: {activeRole}
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
                        className={`w-full text-left px-3 py-2 flex items-start space-x-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
                          isCurrent
                            ? 'bg-brand-50 border-l-2 border-brand-600 font-semibold'
                            : 'hover:bg-paper-2'
                        }`}
                      >
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded capitalize mt-0.5 ${
                            account.role === 'student'
                              ? 'bg-brand-50 text-brand-600'
                              : account.role === 'faculty'
                              ? 'bg-success-soft text-success'
                              : account.role === 'hod'
                              ? 'bg-warning-soft text-warning'
                              : account.role === 'dean'
                              ? 'bg-paper-3 text-ink-2'
                              : 'bg-paper-2 text-ink-muted'
                          }`}
                        >
                          {account.role}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-ink truncate">
                            {account.name}
                          </div>
                          <div className="text-[11px] text-ink-muted truncate">
                            {account.roleTitle}, {account.email}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle visual theme"
          className="p-1.5 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 transition-colors"
        >
          {theme === 'dark' ? (
            <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* User Pill */}
        <div className="flex items-center pl-2 sm:pl-3 border-l border-rule space-x-2">
          <div className="h-7 w-7 rounded bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-sm uppercase">
            {(user?.displayName || user?.firstName || activeRole).charAt(0)}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-ink leading-tight">
              {user?.displayName || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Active User')}
            </div>
            <div className="text-[11px] text-ink-muted capitalize">
              {activeRole} portal
            </div>
          </div>

          {/* Sign Out */}
          <button
            type="button"
            onClick={handleLogout}
            title="Sign out of system"
            aria-label="Sign out"
            className="ml-1 p-1.5 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors"
          >
            <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
