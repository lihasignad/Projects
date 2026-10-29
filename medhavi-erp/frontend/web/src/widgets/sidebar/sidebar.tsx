'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/shared/stores/auth-store';
import { getActiveRole, type PortalRole } from '@/shared/rbac/portal-rbac';
import { usePortalStore } from '@/features/portals/portal-store';

interface NavItem {
  label: string;
  href: string;
  badge?: (store: ReturnType<typeof usePortalStore.getState>) => string | undefined;
  icon: (props: { className?: string }) => JSX.Element;
}

interface NavSection {
  title: string;
  roles: PortalRole[];
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Student portal',
    roles: ['student'],
    items: [
      {
        label: 'Home',
        href: '/portal/student',
        icon: (props) => (
          <svg className={props.className} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ),
      },
      {
        label: 'My profile',
        href: '/portal/student/profile',
        icon: (props) => (
          <svg className={props.className} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ),
      },
      {
        label: 'Quizzes & Tests',
        href: '/portal/student/quizzes',
        icon: (props) => (
          <svg className={props.className} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        ),
      },
      {
        label: 'Courses & LMS',
        href: '/portal/student/courses',
        icon: (props) => (
          <svg className={props.className} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        ),
      },
      {
        label: 'Attendance Tracker',
        href: '/portal/student/attendance',
        icon: (props) => (
          <svg className={props.className} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        ),
      },
      {
        label: 'Results & marks',
        href: '/portal/student/results',
        icon: (props) => (
          <svg className={props.className} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
      },
      {
        label: 'Fees & Invoices',
        href: '/portal/student/fees',
        icon: (props) => (
          <svg className={props.className} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
      },
    ],
  },
  {
    title: 'Faculty desk',
    roles: ['faculty', 'hod'],
    items: [
      {
        label: 'Faculty Schedule',
        href: '/portal/faculty',
        icon: (props) => (
          <svg className={props.className} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
      },
      {
        label: 'My Classrooms',
        href: '/portal/faculty/classrooms',
        badge: (s) => `${s.courses.length} Classes`,
        icon: (props) => (
          <svg className={props.className} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        ),
      },
      {
        label: 'Mark Attendance',
        href: '/portal/faculty/attendance',
        badge: (s) => {
          const nextCls = s.classes.find((c) => !c.attendanceMarked);
          return nextCls ? nextCls.startTime : 'Done';
        },
        icon: (props) => (
          <svg className={props.className} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        ),
      },
      {
        label: 'Quiz Management',
        href: '/portal/faculty/quizzes',
        badge: (s) => `${s.quizzes.length} Tests`,
        icon: (props) => (
          <svg className={props.className} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      },
      {
        label: 'Assignments & Grading',
        href: '/portal/faculty/assignments',
        badge: (s) => `${s.quizSubmissions.length} Due`,
        icon: (props) => (
          <svg className={props.className} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        ),
      },
      {
        label: 'Syllabus & Modules',
        href: '/portal/faculty/courses',
        icon: (props) => (
          <svg className={props.className} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        ),
      },
    ],
  },
  {
    title: 'HOD desk (CSE)',
    roles: ['hod'],
    items: [
      {
        label: 'Department Overview',
        href: '/portal/hod',
        icon: (props) => (
          <svg className={props.className} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        ),
      },
      {
        label: 'Faculty Workload Matrix',
        href: '/portal/hod/workload',
        badge: (s) => {
          const overloaded = s.facultyWorkload.filter((w) => w.status === 'overloaded').length;
          return overloaded > 0 ? `${overloaded} Overloaded` : undefined;
        },
        icon: (props) => (
          <svg className={props.className} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
      },
      {
        label: 'Attendance Defaulters Audit',
        href: '/portal/hod/attendance-audit',
        badge: (s) => {
          const deficitCount = s.studentRoster.filter((r) => r.currentAttendance < 75).length;
          return deficitCount > 0 ? `${deficitCount} Alerts` : undefined;
        },
        icon: (props) => (
          <svg className={props.className} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
      },
      {
        label: 'Department Timetables',
        href: '/portal/hod/timetables',
        icon: (props) => (
          <svg className={props.className} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Dean's office (SoE)",
    roles: ['dean'],
    items: [
      {
        label: 'School Overview',
        href: '/portal/dean',
        icon: (props) => (
          <svg className={props.className} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
        ),
      },
      {
        label: 'Approvals & Governance',
        href: '/portal/dean/approvals',
        badge: (s) => {
          const pending = s.deanApprovals.filter((a) => a.status === 'PENDING').length;
          return `${pending} Pending`;
        },
        icon: (props) => (
          <svg className={props.className} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        label: 'Departments Matrix',
        href: '/portal/dean/departments',
        icon: (props) => (
          <svg className={props.className} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        ),
      },
    ],
  },
  {
    title: 'Institutional administration',
    roles: ['admin'],
    items: [
      {
        label: 'Executive Dashboard',
        href: '/dashboard',
        icon: (props) => (
          <svg className={props.className} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        ),
      },
      {
        label: 'Students Directory',
        href: '/students',
        icon: (props) => (
          <svg className={props.className} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
      },
      {
        label: 'Examination Results',
        href: '/examination/results',
        icon: (props) => (
          <svg className={props.className} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      },
      {
        label: 'Fee Invoices',
        href: '/finance/invoices',
        icon: (props) => (
          <svg className={props.className} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
      },
      {
        label: 'Institute Settings',
        href: '/settings/institute',
        icon: (props) => (
          <svg className={props.className} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const roles = useAuthStore((state) => state.roles);
  const activeRole = getActiveRole(roles);
  const portalStore = usePortalStore();

  // Strict role-based filtering: Users only see their authorized section
  const visibleSections = NAV_SECTIONS.filter((section) =>
    section.roles.includes(activeRole)
  );

  const navContent = (
    <div className="flex flex-col h-full bg-paper border-r border-rule w-72">
      {/* Brand & Academic Context */}
      <div className="h-14 border-b border-rule flex items-center justify-between px-4">
        <Link href={activeRole === 'student' ? '/portal/student' : activeRole === 'faculty' ? '/portal/faculty' : activeRole === 'hod' ? '/portal/hod' : activeRole === 'dean' ? '/portal/dean' : '/dashboard'} className="flex items-center space-x-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded">
          <div className="h-7 w-7 rounded bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-sm group-hover:bg-brand-700 transition-colors">
            D
          </div>
          <div>
            <div className="font-semibold text-xs text-ink">
              Demo University ERP
            </div>
            <div className="text-[11px] text-brand-600 font-medium capitalize">
              {activeRole} portal
            </div>
          </div>
        </Link>

        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          aria-label="Close sidebar navigation"
          className="md:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded"
        >
          <svg className="w-5 h-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5" aria-label="Main Navigation">
        {visibleSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-2.5 text-xs font-semibold text-ink-muted normal-case">
              {section.title}
            </div>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' &&
                    item.href !== '/portal/student' &&
                    item.href !== '/portal/faculty' &&
                    item.href !== '/portal/hod' &&
                    item.href !== '/portal/dean' &&
                    pathname?.startsWith(item.href));

                const badgeText = item.badge ? item.badge(portalStore) : undefined;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
                        isActive
                          ? 'bg-brand-50 text-brand-600 font-semibold'
                          : 'text-ink-2 hover:bg-paper-2 font-medium'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                        <item.icon
                          className={`w-4 h-4 flex-shrink-0 ${
                            isActive
                              ? 'text-brand-600'
                              : 'text-ink-muted'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {badgeText && (
                        <span
                          className={`flex-shrink-0 whitespace-nowrap px-2 py-0.5 text-[11px] font-medium rounded-full tabular-nums leading-none ${
                            isActive
                              ? 'bg-brand-100 text-brand-700'
                              : 'bg-paper-3 text-ink-2'
                          }`}
                        >
                          {badgeText}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer / Academic Context */}
      <div className="p-3 border-t border-rule text-xs text-ink-muted bg-paper-2">
        <div className="font-semibold text-ink capitalize">
          Authorized Role: {activeRole}
        </div>
        <div className="text-[11px] text-ink-muted mt-0.5">
          Demo University, Autumn 2025-26
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block flex-shrink-0">
        {navContent}
      </aside>

      {/* Mobile Slide-over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-ink/40 transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-paper shadow-xl">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
