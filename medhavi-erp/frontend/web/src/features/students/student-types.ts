export type FeeStatus = 'PAID' | 'PARTIAL' | 'DUE' | 'SCHOLARSHIP';
export type AcademicStatus = 'ACTIVE' | 'ON_LEAVE' | 'PROBATION' | 'GRADUATED';

export interface StudentRecord {
  id: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  program: string;
  branch: string;
  semester: number;
  batch: string;
  attendancePercentage: number;
  feeStatus: FeeStatus;
  feeDueAmount: number; // in INR
  status: AcademicStatus;
  guardianName: string;
  guardianPhone: string;
}

export interface StudentFiltersState {
  searchQuery: string;
  program: string;
  semester: string;
  feeStatus: string;
  attendanceThreshold: string;
}
