export interface StudentProfile {
  id: string;
  rollNo: string;
  enrollmentNo: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  program: string;
  department: string;
  school: string;
  semester: number;
  batch: string;
  academicYear: string;
  cgpa: number;
  creditsEarned: number;
  totalCredits: number;
  attendancePercentage: number;
  advisorName: string;
  advisorEmail: string;
  bloodGroup: string;
  category: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  codeSnippet?: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  batch: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  deadline: string;
  status: 'active' | 'upcoming' | 'completed' | 'draft';
  questionsCount: number;
  questions: QuizQuestion[];
  instructions: string[];
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  submittedAt: string;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
  answers: Record<string, string>; // questionId -> selectedOptionId
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  hours: number;
  resources: {
    id: string;
    title: string;
    type: 'pdf' | 'slides' | 'code' | 'video';
    fileSize: string;
    downloadUrl: string;
  }[];
}

export interface EnrolledCourse {
  id: string;
  code: string;
  name: string;
  credits: number;
  facultyName: string;
  facultyDesignation: string;
  attendancePercentage: number;
  totalClasses: number;
  attendedClasses: number;
  modulesCompleted: number;
  totalModules: number;
  schedule: string;
  room: string;
  modules: CourseModule[];
  assignmentsCount: number;
  pendingQuizzesCount: number;
}

export interface StudentAttendanceRecord {
  id: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  conductedSessions: number;
  attendedSessions: number;
  percentage: number;
  status: 'safe' | 'warning' | 'critical';
  recentSessions: {
    date: string;
    time: string;
    status: 'present' | 'absent' | 'duty_leave' | 'late';
    topic: string;
  }[];
}

export interface SemesterResult {
  semester: number;
  academicSession: string;
  examDate: string;
  sgpa: number;
  cgpa: number;
  totalCredits: number;
  creditsEarned: number;
  status: 'PASS' | 'PROMOTED' | 'FAIL';
  subjects: {
    code: string;
    name: string;
    credits: number;
    internalMarks: number;
    externalMarks: number;
    totalMarks: number;
    gradePoint: number;
    letterGrade: string;
    status: 'PASS' | 'FAIL';
  }[];
}

export interface StudentInvoice {
  id: string;
  invoiceNumber: string;
  description: string;
  amount: number;
  paidAmount: number;
  balanceAmount: number;
  dueDate: string;
  status: 'PAID' | 'PARTIAL' | 'OVERDUE' | 'PENDING';
  receiptNumber?: string;
  paymentMethod?: string;
  paidDate?: string;
}

export interface FacultyWorkloadItem {
  facultyId: string;
  facultyName: string;
  designation: string;
  employeeCode: string;
  specialization: string;
  theoryHoursPerWeek: number;
  labHoursPerWeek: number;
  totalHoursPerWeek: number;
  assignedSubjects: string[];
  status: 'optimal' | 'overloaded' | 'underloaded';
}

export interface DeanApprovalRequest {
  id: string;
  title: string;
  category: 'Attendance Condonation' | 'Grade Moderation' | 'Faculty Leave' | 'Curriculum Revision';
  department: string;
  submittedBy: string;
  submittedDate: string;
  details: string;
  urgency: 'HIGH' | 'MEDIUM' | 'NORMAL';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  metadata: Record<string, string | number>;
}
