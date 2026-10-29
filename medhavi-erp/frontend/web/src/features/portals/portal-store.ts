import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  StudentProfile,
  Quiz,
  QuizSubmission,
  EnrolledCourse,
  StudentAttendanceRecord,
  SemesterResult,
  StudentInvoice,
  FacultyWorkloadItem,
  DeanApprovalRequest,
  ScheduledClass,
  CourseModule,
} from './types';
import {
  MOCK_STUDENT,
  MOCK_QUIZZES,
  MOCK_QUIZ_SUBMISSIONS,
  MOCK_COURSES,
  MOCK_ATTENDANCE_SUMMARY,
  MOCK_SEMESTER_RESULTS,
  MOCK_INVOICES,
  MOCK_HOD_FACULTY_WORKLOAD,
  MOCK_DEAN_APPROVALS,
} from './portals-mock-data';

export interface RosterStudent {
  id: string;
  rollNo: string;
  name: string;
  currentAttendance: number;
  status: 'present' | 'absent' | 'duty_leave' | 'late';
}

export const INITIAL_SCHEDULED_CLASSES: ScheduledClass[] = [
  {
    id: 'cls-501',
    subjectCode: 'CS501',
    subjectName: 'Database Management Systems',
    facultyName: 'Dr. Arvind Rao',
    facultyId: 'fac-101',
    batch: 'B.Tech CSE Sem 5 Sec A (64 Students)',
    room: 'Lecture Hall LT-2',
    date: '2026-10-28',
    startTime: '11:30 AM',
    endTime: '12:30 PM',
    topic: 'BCNF Decomposition & Lossless Join Property',
    type: 'Lecture',
    status: 'scheduled',
    attendanceMarked: false,
    studentsCount: 64,
  },
  {
    id: 'cls-505',
    subjectCode: 'CS505',
    subjectName: 'Database Systems Practical Lab (Batch A1)',
    facultyName: 'Dr. Arvind Rao',
    facultyId: 'fac-101',
    batch: 'B.Tech CSE Sem 5 (32 Students)',
    room: 'Computer Lab 3',
    date: '2026-10-28',
    startTime: '02:00 PM',
    endTime: '04:00 PM',
    topic: 'PostgreSQL Query Optimization & Index Profiling',
    type: 'Lab',
    status: 'scheduled',
    attendanceMarked: false,
    studentsCount: 32,
  },
  {
    id: 'cls-502',
    subjectCode: 'CS502',
    subjectName: 'Operating Systems',
    facultyName: 'Dr. Sneha Joshi',
    facultyId: 'fac-102',
    batch: 'B.Tech CSE Sem 5 Sec A',
    room: 'Lecture Hall LT-4',
    date: '2026-10-28',
    startTime: '09:30 AM',
    endTime: '11:00 AM',
    topic: 'Process Synchronization & Semaphores',
    type: 'Lecture',
    status: 'completed',
    attendanceMarked: true,
    studentsCount: 64,
  },
];

export const INITIAL_STUDENT_ROSTER: RosterStudent[] = [
  { id: '1', rollNo: '2023CSE001', name: 'Aarav Singhania', currentAttendance: 68.4, status: 'duty_leave' },
  { id: '2', rollNo: '2023CSE002', name: 'Aakash Verma', currentAttendance: 85.2, status: 'present' },
  { id: '3', rollNo: '2023CSE003', name: 'Ananya Deshmukh', currentAttendance: 92.0, status: 'present' },
  { id: '4', rollNo: '2023CSE004', name: 'Ayush Patel', currentAttendance: 76.5, status: 'present' },
  { id: '5', rollNo: '2023CSE011', name: 'Bhavya Nair', currentAttendance: 88.0, status: 'present' },
  { id: '6', rollNo: '2023CSE018', name: 'Devendra Joshi', currentAttendance: 71.0, status: 'absent' },
  { id: '7', rollNo: '2023CSE024', name: 'Ishaan Mukhopadhyay', currentAttendance: 94.1, status: 'present' },
  { id: '8', rollNo: '2023CSE035', name: 'Manish Chhetri', currentAttendance: 82.3, status: 'present' },
  { id: '9', rollNo: '2023CSE042', name: 'Priya Sharma', currentAttendance: 88.2, status: 'present' },
  { id: '10', rollNo: '2023CSE048', name: 'Rohan Kulkarni', currentAttendance: 69.8, status: 'absent' },
  { id: '11', rollNo: '2023CSE055', name: 'Siddharth Roy', currentAttendance: 81.4, status: 'present' },
  { id: '12', rollNo: '2023CSE062', name: 'Tanvi Agarwal', currentAttendance: 90.6, status: 'present' },
];

export interface PortalState {
  // Synchronized entities
  classes: ScheduledClass[];
  studentProfile: StudentProfile;
  attendanceRecords: StudentAttendanceRecord[];
  quizzes: Quiz[];
  quizSubmissions: QuizSubmission[];
  courses: EnrolledCourse[];
  semesterResults: SemesterResult[];
  invoices: StudentInvoice[];
  facultyWorkload: FacultyWorkloadItem[];
  deanApprovals: DeanApprovalRequest[];
  studentRoster: RosterStudent[];
  totalLecturesConductedToday: number;

  // Actions
  addClass: (newClass: Omit<ScheduledClass, 'id' | 'attendanceMarked' | 'status'>) => ScheduledClass;
  markClassAttendance: (
    classId: string,
    subjectCode: string,
    topic: string,
    roster: RosterStudent[]
  ) => void;
  publishQuiz: (quizData: Omit<Quiz, 'id'>) => Quiz;
  submitQuiz: (submission: Omit<QuizSubmission, 'id' | 'submittedAt'>) => QuizSubmission;
  approveDeanRequest: (id: string) => void;
  rejectDeanRequest: (id: string) => void;
  addCourseResource: (courseId: string, moduleId: string, resource: CourseModule['resources'][0]) => void;
  resetToDefaults: () => void;
}

export const usePortalStore = create<PortalState>()(
  persist(
    (set, get) => ({
      classes: INITIAL_SCHEDULED_CLASSES,
      studentProfile: MOCK_STUDENT,
      attendanceRecords: MOCK_ATTENDANCE_SUMMARY,
      quizzes: MOCK_QUIZZES,
      quizSubmissions: MOCK_QUIZ_SUBMISSIONS,
      courses: MOCK_COURSES,
      semesterResults: MOCK_SEMESTER_RESULTS,
      invoices: MOCK_INVOICES,
      facultyWorkload: MOCK_HOD_FACULTY_WORKLOAD,
      deanApprovals: MOCK_DEAN_APPROVALS,
      studentRoster: INITIAL_STUDENT_ROSTER,
      totalLecturesConductedToday: 1,

      addClass: (newClassData) => {
        const id = 'cls-' + Date.now();
        const createdClass: ScheduledClass = {
          ...newClassData,
          id,
          status: 'scheduled',
          attendanceMarked: false,
        };

        set((state) => ({
          classes: [createdClass, ...state.classes],
        }));

        return createdClass;
      },

      markClassAttendance: (classId, subjectCode, topic, updatedRoster) => {
        const state = get();

        // 1. Mark class completed
        const updatedClasses = state.classes.map((c) =>
          c.id === classId || (c.subjectCode === subjectCode && !c.attendanceMarked)
            ? { ...c, status: 'completed' as const, attendanceMarked: true, topic }
            : c
        );

        // 2. Identify Priya Sharma's marked status (student id: std-2023-042, rollNo: 2023CSE042)
        const priyaRecord = updatedRoster.find(
          (r) => r.rollNo === '2023CSE042' || r.id === 'std-2023-042' || r.name.includes('Priya')
        );
        const priyaStatus = priyaRecord ? priyaRecord.status : 'present';

        // 3. Update attendance records for the subject
        let updatedAttendancePercentage = state.studentProfile.attendancePercentage;
        const updatedAttendanceRecords = state.attendanceRecords.map((att) => {
          if (att.subjectCode === subjectCode) {
            const newConducted = att.conductedSessions + 1;
            const newAttended =
              priyaStatus === 'present' || priyaStatus === 'duty_leave'
                ? att.attendedSessions + 1
                : att.attendedSessions;
            const newPercentage = Number(((newAttended / newConducted) * 100).toFixed(1));

            const newSession = {
              date: new Date().toISOString().split('T')[0] ?? '2026-10-28',
              time: '11:30 AM',
              status: priyaStatus,
              topic: topic || 'Advanced Class Lecture',
            };

            return {
              ...att,
              conductedSessions: newConducted,
              attendedSessions: newAttended,
              percentage: newPercentage,
              status: (newPercentage >= 75 ? 'safe' : 'warning') as 'safe' | 'warning',
              recentSessions: [newSession, ...att.recentSessions],
            };
          }
          return att;
        });

        // 4. Update overall student attendance percentage across all subjects
        const totalConducted = updatedAttendanceRecords.reduce((acc, a) => acc + a.conductedSessions, 0);
        const totalAttended = updatedAttendanceRecords.reduce((acc, a) => acc + a.attendedSessions, 0);
        if (totalConducted > 0) {
          updatedAttendancePercentage = Number(((totalAttended / totalConducted) * 100).toFixed(1));
        }

        // 5. Update course list for student
        const updatedCourses = state.courses.map((course) => {
          if (course.code === subjectCode) {
            const newTotal = course.totalClasses + 1;
            const newAttended =
              priyaStatus === 'present' || priyaStatus === 'duty_leave'
                ? course.attendedClasses + 1
                : course.attendedClasses;
            return {
              ...course,
              totalClasses: newTotal,
              attendedClasses: newAttended,
              attendancePercentage: Number(((newAttended / newTotal) * 100).toFixed(1)),
            };
          }
          return course;
        });

        // 6. Update student roster with historical % changes
        const newRoster = updatedRoster.map((item) => {
          const isPresent = item.status === 'present' || item.status === 'duty_leave';
          // Approximate slight increment/decrement based on 35 classes
          const diff = isPresent ? 0.3 : -1.2;
          const newPct = Number(Math.min(100, Math.max(10, item.currentAttendance + diff)).toFixed(1));
          return {
            ...item,
            currentAttendance: newPct,
          };
        });

        set({
          classes: updatedClasses,
          studentProfile: {
            ...state.studentProfile,
            attendancePercentage: updatedAttendancePercentage,
          },
          attendanceRecords: updatedAttendanceRecords,
          courses: updatedCourses,
          studentRoster: newRoster,
          totalLecturesConductedToday: state.totalLecturesConductedToday + 1,
        });
      },

      publishQuiz: (quizData) => {
        const id = 'quiz-' + Date.now();
        const newQuiz: Quiz = {
          ...quizData,
          id,
        };

        set((state) => ({
          quizzes: [newQuiz, ...state.quizzes],
        }));

        return newQuiz;
      },

      submitQuiz: (subData) => {
        const id = 'sub-' + Date.now();
        const newSubmission: QuizSubmission = {
          ...subData,
          id,
          submittedAt: new Date().toISOString(),
        };

        // Also mark quiz status in quizzes if applicable
        set((state) => ({
          quizSubmissions: [newSubmission, ...state.quizSubmissions],
          quizzes: state.quizzes.map((q) =>
            q.id === subData.quizId
              ? { ...q, status: 'completed' as const }
              : q
          ),
        }));

        return newSubmission;
      },

      approveDeanRequest: (id) => {
        set((state) => ({
          deanApprovals: state.deanApprovals.map((req) =>
            req.id === id ? { ...req, status: 'APPROVED' as const } : req
          ),
        }));
      },

      rejectDeanRequest: (id) => {
        set((state) => ({
          deanApprovals: state.deanApprovals.map((req) =>
            req.id === id ? { ...req, status: 'REJECTED' as const } : req
          ),
        }));
      },

      addCourseResource: (courseId, moduleId, resource) => {
        set((state) => ({
          courses: state.courses.map((course) => {
            if (course.id === courseId) {
              return {
                ...course,
                modules: course.modules.map((mod) =>
                  mod.id === moduleId
                    ? { ...mod, resources: [...mod.resources, resource] }
                    : mod
                ),
              };
            }
            return course;
          }),
        }));
      },

      resetToDefaults: () => {
        set({
          classes: INITIAL_SCHEDULED_CLASSES,
          studentProfile: MOCK_STUDENT,
          attendanceRecords: MOCK_ATTENDANCE_SUMMARY,
          quizzes: MOCK_QUIZZES,
          quizSubmissions: MOCK_QUIZ_SUBMISSIONS,
          courses: MOCK_COURSES,
          semesterResults: MOCK_SEMESTER_RESULTS,
          invoices: MOCK_INVOICES,
          facultyWorkload: MOCK_HOD_FACULTY_WORKLOAD,
          deanApprovals: MOCK_DEAN_APPROVALS,
          studentRoster: INITIAL_STUDENT_ROSTER,
          totalLecturesConductedToday: 1,
        });
      },
    }),
    {
      name: 'demo-unified-portal-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
