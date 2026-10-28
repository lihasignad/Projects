export type PortalRole = 'student' | 'faculty' | 'hod' | 'dean' | 'admin';

export interface UserAccountCredential {
  email: string;
  name: string;
  role: PortalRole;
  roleTitle: string;
  department: string;
  targetPath: string;
}

export const REGISTERED_ACCOUNTS: UserAccountCredential[] = [
  {
    email: 'priya.sharma@medhavi.ac.in',
    name: 'Priya Sharma',
    role: 'student',
    roleTitle: 'Student (2023CSE042)',
    department: 'B.Tech CSE Sem 5',
    targetPath: '/portal/student',
  },
  {
    email: 'priya.sharma@msu.edu.in',
    name: 'Priya Sharma',
    role: 'student',
    roleTitle: 'Student (2023CSE042)',
    department: 'B.Tech CSE Sem 5',
    targetPath: '/portal/student',
  },
  {
    email: 'arun.sharma@medhavi.ac.in',
    name: 'Dr. Arun Sharma',
    role: 'faculty',
    roleTitle: 'Associate Professor',
    department: 'Computer Science & Engineering',
    targetPath: '/portal/faculty',
  },
  {
    email: 'arvind.rao@msu.edu.in',
    name: 'Dr. Arvind Rao',
    role: 'faculty',
    roleTitle: 'Associate Professor',
    department: 'Computer Science & Engineering',
    targetPath: '/portal/faculty',
  },
  {
    email: 'rajesh.verma@medhavi.ac.in',
    name: 'Prof. Rajesh Verma',
    role: 'hod',
    roleTitle: 'Head of Department (CSE)',
    department: 'Dept of Computer Science & Engineering',
    targetPath: '/portal/hod',
  },
  {
    email: 'hod.cse@msu.edu.in',
    name: 'Dr. Meenakshi Sundaram',
    role: 'hod',
    roleTitle: 'Head of Department (CSE)',
    department: 'Dept of Computer Science & Engineering',
    targetPath: '/portal/hod',
  },
  {
    email: 'k.menon@medhavi.ac.in',
    name: 'Dr. K. Menon',
    role: 'dean',
    roleTitle: 'Dean of Faculty',
    department: 'School of Engineering & Technology',
    targetPath: '/portal/dean',
  },
  {
    email: 'dean.soe@msu.edu.in',
    name: 'Prof. Rajeshwar Kulkarni',
    role: 'dean',
    roleTitle: 'Dean of Faculty',
    department: 'School of Engineering & Technology',
    targetPath: '/portal/dean',
  },
  {
    email: 'admin@coachup.dev',
    name: 'University Registrar',
    role: 'admin',
    roleTitle: 'Super Administrator',
    department: 'Central Administration',
    targetPath: '/dashboard',
  },
  {
    email: 'admin@medhavi.local',
    name: 'University Registrar',
    role: 'admin',
    roleTitle: 'Super Administrator',
    department: 'Central Administration',
    targetPath: '/dashboard',
  },
];

export function getActiveRole(roles?: { key: string; isPrimary?: boolean }[]): PortalRole {
  if (!roles || roles.length === 0) return 'student';
  const primary = roles.find((r) => r.isPrimary) || roles[0];
  if (!primary) return 'student';
  const key = primary.key.toLowerCase();
  if (key.includes('student')) return 'student';
  if (key.includes('faculty') || key.includes('teacher') || key.includes('instructor')) return 'faculty';
  if (key.includes('hod')) return 'hod';
  if (key.includes('dean')) return 'dean';
  if (key.includes('admin')) return 'admin';
  return 'student';
}

export function isRouteAllowedForRole(pathname: string, role: PortalRole): boolean {
  if (role === 'admin') return true; // Admin has full access

  if (role === 'student') {
    return pathname.startsWith('/portal/student');
  }

  if (role === 'faculty') {
    return pathname.startsWith('/portal/faculty');
  }

  if (role === 'hod') {
    return pathname.startsWith('/portal/hod') || pathname.startsWith('/portal/faculty');
  }

  if (role === 'dean') {
    return pathname.startsWith('/portal/dean');
  }

  return false;
}

export function getDefaultRedirectForRole(role: PortalRole): string {
  switch (role) {
    case 'student':
      return '/portal/student';
    case 'faculty':
      return '/portal/faculty';
    case 'hod':
      return '/portal/hod';
    case 'dean':
      return '/portal/dean';
    case 'admin':
    default:
      return '/dashboard';
  }
}
