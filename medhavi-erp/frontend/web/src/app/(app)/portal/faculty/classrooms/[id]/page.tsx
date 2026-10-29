'use client';

/**
 * DESIGN BRIEF: Interactive Classroom Command Center
 * - Who uses: University faculty members managing specific course batches during and between lectures.
 * - Single most important thing: Execute all core classroom workflows (assign today's class, mark student attendance, publish quizzes, upload resources) from one unified console.
 * - Visual direction: Dense, paper-like institutional command desk with tabbed operational modules, tabular numerals, and instant feedback toasts.
 * - Tokens: Paper surface, slate rule borders, brand ink (#1E40AF), emerald (#059669), rose (#E11D48), amber (#D97706).
 * - Anti-slop: 0 emojis, 0 generic purple gradients, WCAG AA contrast, tabular-nums for roll numbers, times, and grades.
 */

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { usePortalStore, RosterStudent } from '@/features/portals/portal-store';
import type { Quiz, CourseModule, EnrolledCourse } from '@/features/portals/types';
import { MOCK_COURSES } from '@/features/portals/portals-mock-data';

export default function FacultyClassroomWorkspacePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const classroomId = params?.id as string;

  const courses = usePortalStore((state) => state.courses);
  const classes = usePortalStore((state) => state.classes);
  const quizzes = usePortalStore((state) => state.quizzes);
  const studentRoster = usePortalStore((state) => state.studentRoster);
  const addClass = usePortalStore((state) => state.addClass);
  const markClassAttendance = usePortalStore((state) => state.markClassAttendance);
  const publishQuiz = usePortalStore((state) => state.publishQuiz);
  const addCourseResource = usePortalStore((state) => state.addCourseResource);

  // Active Tab: 'today' | 'attendance' | 'quizzes' | 'resources'
  const initialTab = (searchParams?.get('tab') as 'today' | 'attendance' | 'quizzes' | 'resources') || 'today';
  const [activeTab, setActiveTab] = useState<'today' | 'attendance' | 'quizzes' | 'resources'>(initialTab);

  useEffect(() => {
    const tabParam = searchParams?.get('tab') as 'today' | 'attendance' | 'quizzes' | 'resources';
    if (tabParam && ['today', 'attendance', 'quizzes', 'resources'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Find course matching ID or fallback to first course
  const course: EnrolledCourse = useMemo(() => {
    const found = courses.find((c) => c.id === classroomId || c.code.toLowerCase() === classroomId?.toLowerCase());
    if (found) return found;
    if (courses[0]) return courses[0];
    return MOCK_COURSES[0]!;
  }, [courses, classroomId]);

  // Class sessions for this course
  const courseSessions = useMemo(() => {
    return classes.filter(
      (c) => c.subjectCode === course.code || c.subjectName.toLowerCase() === course.name.toLowerCase()
    );
  }, [classes, course]);

  // Today's scheduled class or fallback default
  const todayClass = useMemo(() => {
    const found = courseSessions.find((c) => !c.attendanceMarked);
    return (
      found ||
      courseSessions[0] || {
        id: `cls-${course.code.toLowerCase()}-today`,
        subjectCode: course.code,
        subjectName: course.name,
        facultyName: course.facultyName || 'Dr. Arun Sharma',
        facultyId: 'fac-101',
        batch: course.code === 'CS505' ? 'B.Tech CSE Sem 5 (Batch A1)' : 'B.Tech CSE Sem 5 (Sec A)',
        room: course.room,
        date: new Date().toISOString().split('T')[0] ?? '2026-10-29',
        startTime: '11:30 AM',
        endTime: '12:30 PM',
        topic: 'BCNF Decomposition & Lossless Join Property',
        type: course.name.toLowerCase().includes('lab') ? 'Lab' : 'Lecture',
        status: 'scheduled' as const,
        attendanceMarked: false,
        studentsCount: course.code === 'CS505' ? 32 : 64,
      }
    );
  }, [courseSessions, course]);

  // Local Attendance Roster State
  const [roster, setRoster] = useState<RosterStudent[]>(studentRoster);
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [filterAttendanceStatus, setFilterAttendanceStatus] = useState<string>('ALL');

  // Today Class Form State
  const [sessionTopic, setSessionTopic] = useState(todayClass.topic || '');
  const [sessionRoom, setSessionRoom] = useState(todayClass.room || course.room);
  const [sessionType, setSessionType] = useState<'Lecture' | 'Lab' | 'Tutorial'>((todayClass.type as 'Lecture' | 'Lab' | 'Tutorial') || 'Lecture');
  const [sessionTime, setSessionTime] = useState(todayClass.startTime || '11:30 AM');
  const [sessionEndTime, setSessionEndTime] = useState(todayClass.endTime || '12:30 PM');
  const [sessionNotes, setSessionNotes] = useState('Cover functional dependencies, candidate keys, and multi-valued dependencies.');

  // Quiz Modal State
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuizDuration, setNewQuizDuration] = useState(25);
  const [newQuizTotalMarks, setNewQuizTotalMarks] = useState(20);
  const [newQuizPassingMarks, setNewQuizPassingMarks] = useState(10);
  const [newQuizDeadline, setNewQuizDeadline] = useState('2026-11-05T18:00');
  const [newQuizQuestions, setNewQuizQuestions] = useState([
    {
      id: 'q1',
      prompt: 'Which normal form eliminates partial dependency on a candidate key?',
      options: [
        { id: 'opt1', text: 'First Normal Form (1NF)' },
        { id: 'opt2', text: 'Second Normal Form (2NF)' },
        { id: 'opt3', text: 'Third Normal Form (3NF)' },
        { id: 'opt4', text: 'Boyce-Codd Normal Form (BCNF)' },
      ],
      correctOptionId: 'opt2',
      points: 5,
    },
    {
      id: 'q2',
      prompt: 'A relation R with functional dependencies X -> Y is in BCNF if and only if:',
      options: [
        { id: 'opt1', text: 'Y is a subset of X' },
        { id: 'opt2', text: 'X is a superkey of R' },
        { id: 'opt3', text: 'Both (A) and (B) hold' },
        { id: 'opt4', text: 'R has no composite candidate key' },
      ],
      correctOptionId: 'opt2',
      points: 5,
    },
  ]);

  // Resource Modal State
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceType, setNewResourceType] = useState<'pdf' | 'slides' | 'code' | 'video'>('slides');
  const [newResourceModule, setNewResourceModule] = useState(course.modules[0]?.id || 'm1');
  const [newResourceSize, setNewResourceSize] = useState('3.8 MB');

  // Success Feedback
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  // 1. Assign / Update Today's Class
  const handleAssignTodayClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTopic.trim()) return;

    addClass({
      subjectCode: course.code,
      subjectName: course.name,
      facultyName: course.facultyName || 'Dr. Arun Sharma',
      facultyId: 'fac-101',
      batch: course.code === 'CS505' ? 'B.Tech CSE Sem 5 (Batch A1)' : 'B.Tech CSE Sem 5 (Sec A)',
      room: sessionRoom,
      date: new Date().toISOString().split('T')[0] ?? '2026-10-29',
      startTime: sessionTime,
      endTime: sessionEndTime,
      topic: sessionTopic,
      type: sessionType,
      studentsCount: course.code === 'CS505' ? 32 : 64,
    });

    triggerToast(`Today's class "${course.code}: ${sessionTopic}" assigned & scheduled!`);
  };

  // 2. Mark Attendance for Class
  const handleToggleStudentStatus = (studentId: string, status: RosterStudent['status']) => {
    setRoster((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status } : s))
    );
  };

  const handleMarkAll = (status: RosterStudent['status']) => {
    setRoster((prev) => prev.map((s) => ({ ...s, status })));
    triggerToast(`All students marked as ${status.replace('_', ' ').toUpperCase()}`);
  };

  const handleSaveAttendance = () => {
    markClassAttendance(todayClass.id, course.code, sessionTopic || todayClass.topic, roster);
    triggerToast(`Attendance saved for ${roster.length} students in ${course.code}! Synced with Student & HOD dashboards.`);
  };

  // 3. Publish Quiz
  const handlePublishQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuizTitle.trim()) return;

    const createdQuiz: Omit<Quiz, 'id'> = {
      title: newQuizTitle,
      subjectCode: course.code,
      subjectName: course.name,
      facultyName: course.facultyName || 'Dr. Arun Sharma',
      batch: course.code === 'CS505' ? 'B.Tech CSE Sem 5 (Batch A1)' : 'B.Tech CSE Sem 5 (Sec A)',
      durationMinutes: Number(newQuizDuration),
      totalMarks: Number(newQuizTotalMarks),
      passingMarks: Number(newQuizPassingMarks),
      deadline: newQuizDeadline,
      status: 'active',
      questionsCount: newQuizQuestions.length,
      instructions: [
        'Each question carries equal weightage.',
        'No negative marking for incorrect attempts.',
        'Submit within the designated time limit.',
      ],
      questions: newQuizQuestions.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        options: q.options,
        correctOptionId: q.correctOptionId,
        explanation: 'Standard curriculum solution verified by instructor.',
        points: q.points,
      })),
    };

    publishQuiz(createdQuiz);
    setShowQuizModal(false);
    setNewQuizTitle('');
    triggerToast(`Quiz "${newQuizTitle}" published to ${course.code}! Students can now take this assessment.`);
  };

  // 4. Upload Resource
  const handleUploadResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResourceTitle.trim()) return;

    const resourceItem: CourseModule['resources'][0] = {
      id: `r-${Date.now()}`,
      title: newResourceTitle,
      type: newResourceType,
      fileSize: newResourceSize || '2.4 MB',
      downloadUrl: '#',
    };

    addCourseResource(course.id, newResourceModule, resourceItem);
    setShowResourceModal(false);
    setNewResourceTitle('');
    triggerToast(`Resource "${newResourceTitle}" added to ${course.code}! Distributed to enrolled students.`);
  };

  // Attendance stats computation
  const presentCount = roster.filter((r) => r.status === 'present' || r.status === 'duty_leave').length;
  const absentCount = roster.filter((r) => r.status === 'absent').length;
  const lateCount = roster.filter((r) => r.status === 'late').length;
  const attendanceRate = Math.round((presentCount / (roster.length || 1)) * 100);
  const defaulterCount = roster.filter((r) => r.currentAttendance < 75).length;

  // Filtered Roster
  const filteredRoster = useMemo(() => {
    return roster.filter((s) => {
      if (filterAttendanceStatus !== 'ALL' && s.status !== filterAttendanceStatus) return false;
      if (attendanceSearch.trim()) {
        const query = attendanceSearch.toLowerCase();
        const matchName = s.name.toLowerCase().includes(query);
        const matchRoll = s.rollNo.toLowerCase().includes(query);
        if (!matchName && !matchRoll) return false;
      }
      return true;
    });
  }, [roster, filterAttendanceStatus, attendanceSearch]);

  // Quizzes for this course
  const courseQuizzes = useMemo(() => {
    return quizzes.filter(
      (q) => q.subjectCode === course.code || q.subjectName.toLowerCase() === course.name.toLowerCase()
    );
  }, [quizzes, course]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div
          role="status"
          aria-live="polite"
          className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-md"
        >
          <div className="flex items-center space-x-2.5">
            <svg aria-hidden="true" className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Classroom Hero Header */}
      <div className="bg-paper border border-rule rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold">
              <Link href="/portal/faculty" className="text-ink-muted hover:text-brand-600">
                Faculty Desk
              </Link>
              <span className="text-ink-muted">/</span>
              <Link href="/portal/faculty/classrooms" className="text-ink-muted hover:text-brand-600">
                Classrooms
              </Link>
              <span className="text-ink-muted">/</span>
              <span className="text-brand-600 font-bold">{course.code}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-900">
                {course.code}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
                {course.name}
              </h1>
            </div>

            <p className="text-xs text-ink-muted mt-1 font-medium">
              {course.code === 'CS505' ? 'B.Tech CSE Sem 5 (Batch A1)' : 'B.Tech CSE Sem 5 (Sec A)'} · Room {course.room} · {course.credits} Credits · {course.schedule}
            </p>
          </div>

          {/* Quick Classroom Switcher */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-ink-muted hidden sm:inline">Switch Class:</span>
            <select
              aria-label="Switch Classroom"
              value={course.id}
              onChange={(e) => router.push(`/portal/faculty/classrooms/${e.target.value}`)}
              className="h-9 px-3 text-xs font-semibold rounded-lg border border-rule bg-paper text-ink focus:outline-none focus:ring-2 focus:ring-brand-600"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}: {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4 Interactive Tab Switches */}
        <div className="mt-6 pt-4 border-t border-rule flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('today')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
              activeTab === 'today'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-paper-2 text-ink hover:bg-paper-3'
            }`}
          >
            1. Today's Class Plan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
              activeTab === 'attendance'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-paper-2 text-ink hover:bg-paper-3'
            }`}
          >
            2. Mark Attendance ({presentCount}/{roster.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('quizzes')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
              activeTab === 'quizzes'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-paper-2 text-ink hover:bg-paper-3'
            }`}
          >
            3. Publish Quizzes ({courseQuizzes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('resources')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
              activeTab === 'resources'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-paper-2 text-ink hover:bg-paper-3'
            }`}
          >
            4. Class Resources ({course.modules.reduce((a, m) => a + m.resources.length, 0)})
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ASSIGN TODAY'S CLASS */}
      {/* ========================================================================= */}
      {activeTab === 'today' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Today's Session Assignment Form */}
            <div className="lg:col-span-2 bg-paper border border-rule rounded-xl p-5 shadow-sm space-y-5">
              <div>
                <h2 className="text-base font-bold text-ink tracking-tight">
                  Assign &amp; Schedule Today's Session
                </h2>
                <p className="text-xs text-ink-muted mt-0.5">
                  Set today's lecture objectives, classroom room, topic deliverables, and sync with student timetables.
                </p>
              </div>

              <form onSubmit={handleAssignTodayClass} className="space-y-4">
                <div>
                  <label htmlFor="topic-input" className="block text-xs font-semibold text-ink mb-1.5 normal-case">
                    Lecture / Lab Topic Title <span className="text-danger">*</span>
                  </label>
                  <input
                    id="topic-input"
                    type="text"
                    required
                    value={sessionTopic}
                    onChange={(e) => setSessionTopic(e.target.value)}
                    placeholder="e.g. BCNF Decomposition &amp; Lossless Join Property"
                    className="w-full h-10 px-3.5 text-xs rounded-lg border border-rule bg-paper text-ink placeholder:text-ink-muted font-medium focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="type-select" className="block text-xs font-semibold text-ink mb-1.5 normal-case">
                      Session Type
                    </label>
                    <select
                      id="type-select"
                      value={sessionType}
                      onChange={(e) => setSessionType(e.target.value as 'Lecture' | 'Lab' | 'Tutorial')}
                      className="w-full h-10 px-3 text-xs rounded-lg border border-rule bg-paper text-ink font-medium focus:outline-none focus:ring-2 focus:ring-brand-600"
                    >
                      <option value="Lecture">Theory Lecture</option>
                      <option value="Lab">Practical Lab</option>
                      <option value="Tutorial">Tutorial Session</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="start-time" className="block text-xs font-semibold text-ink mb-1.5 normal-case">
                      Start Time
                    </label>
                    <input
                      id="start-time"
                      type="text"
                      value={sessionTime}
                      onChange={(e) => setSessionTime(e.target.value)}
                      placeholder="e.g. 11:30 AM"
                      className="w-full h-10 px-3 text-xs rounded-lg border border-rule bg-paper text-ink font-mono font-medium focus:outline-none focus:ring-2 focus:ring-brand-600"
                    />
                  </div>

                  <div>
                    <label htmlFor="end-time" className="block text-xs font-semibold text-ink mb-1.5 normal-case">
                      End Time
                    </label>
                    <input
                      id="end-time"
                      type="text"
                      value={sessionEndTime}
                      onChange={(e) => setSessionEndTime(e.target.value)}
                      placeholder="e.g. 12:30 PM"
                      className="w-full h-10 px-3 text-xs rounded-lg border border-rule bg-paper text-ink font-mono font-medium focus:outline-none focus:ring-2 focus:ring-brand-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="room-input" className="block text-xs font-semibold text-ink mb-1.5 normal-case">
                      Lecture Hall / Room Allocation
                    </label>
                    <input
                      id="room-input"
                      type="text"
                      value={sessionRoom}
                      onChange={(e) => setSessionRoom(e.target.value)}
                      className="w-full h-10 px-3.5 text-xs rounded-lg border border-rule bg-paper text-ink font-medium focus:outline-none focus:ring-2 focus:ring-brand-600"
                    />
                  </div>

                  <div>
                    <label htmlFor="module-select" className="block text-xs font-semibold text-ink mb-1.5 normal-case">
                      Curriculum Unit / Module
                    </label>
                    <select
                      id="module-select"
                      className="w-full h-10 px-3 text-xs rounded-lg border border-rule bg-paper text-ink font-medium focus:outline-none focus:ring-2 focus:ring-brand-600"
                    >
                      {course.modules.length > 0 ? (
                        course.modules.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.title}
                          </option>
                        ))
                      ) : (
                        <option value="m1">Module 1: Foundations</option>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="notes-area" className="block text-xs font-semibold text-ink mb-1.5 normal-case">
                    Session Objectives &amp; Preparation Instructions
                  </label>
                  <textarea
                    id="notes-area"
                    rows={3}
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="Instructions for students to read prior to class..."
                    className="w-full p-3 text-xs rounded-lg border border-rule bg-paper text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                  >
                    Confirm &amp; Schedule Today's Class
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('attendance')}
                    className="px-4 py-2.5 rounded-lg border border-rule bg-paper hover:bg-paper-2 text-ink font-medium text-xs transition-colors"
                  >
                    Proceed to Mark Attendance
                  </button>
                </div>
              </form>
            </div>

            {/* Right Col: Today's Classroom Live Status */}
            <div className="space-y-4">
              <div className="bg-paper border border-rule rounded-xl p-5 shadow-sm space-y-4">
                <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 normal-case">
                  Live Classroom Status
                </span>
                <div className="p-3.5 rounded-lg bg-paper-2 border border-rule space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-ink-muted">Assigned Slot:</span>
                    <span className="text-xs font-mono font-bold text-ink">{sessionTime} - {sessionEndTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-ink-muted">Allocated Room:</span>
                    <span className="text-xs font-bold text-ink">{sessionRoom}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-ink-muted">Attendance:</span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {todayClass.attendanceMarked ? 'Finalized' : 'Pending Roll Call'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-rule text-xs">
                  <div className="font-semibold text-ink">Active Session Deliverable:</div>
                  <p className="text-ink-muted leading-relaxed">
                    {sessionTopic || 'No topic assigned yet.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('attendance')}
                  className="w-full py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  Mark Classroom Attendance Now
                </button>
              </div>

              {/* Recent Classroom Sessions Log */}
              <div className="bg-paper border border-rule rounded-xl p-5 shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-ink">
                  Recent Conducted Lectures
                </h3>
                <div className="space-y-2 text-xs">
                  {courseSessions.slice(0, 3).map((s, idx) => (
                    <div key={s.id || idx} className="p-2.5 rounded-lg bg-paper-2 border border-rule flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-ink line-clamp-1">{s.topic}</div>
                        <div className="text-[11px] text-ink-muted mt-0.5">{s.date} · {s.startTime}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex-shrink-0">
                        Completed
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MARK STUDENT ATTENDANCE */}
      {/* ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-5">
          {/* Attendance KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            <div className="bg-paper border border-rule rounded-xl p-3.5">
              <span className="text-[11px] font-semibold text-ink-muted block normal-case">Enrolled Scholars</span>
              <span className="text-xl font-bold tabular-nums text-ink mt-0.5 block">{roster.length}</span>
            </div>
            <div className="bg-paper border border-rule rounded-xl p-3.5">
              <span className="text-[11px] font-semibold text-emerald-600 block normal-case">Present Today</span>
              <span className="text-xl font-bold tabular-nums text-emerald-600 mt-0.5 block">{presentCount}</span>
            </div>
            <div className="bg-paper border border-rule rounded-xl p-3.5">
              <span className="text-[11px] font-semibold text-rose-600 block normal-case">Absent Today</span>
              <span className="text-xl font-bold tabular-nums text-rose-600 mt-0.5 block">{absentCount}</span>
            </div>
            <div className="bg-paper border border-rule rounded-xl p-3.5">
              <span className="text-[11px] font-semibold text-amber-600 block normal-case">Late / Duty Leave</span>
              <span className="text-xl font-bold tabular-nums text-amber-600 mt-0.5 block">{lateCount}</span>
            </div>
            <div className="bg-paper border border-rule rounded-xl p-3.5">
              <span className="text-[11px] font-semibold text-ink-muted block normal-case">Compliance Rate</span>
              <span className="text-xl font-bold tabular-nums text-brand-600 mt-0.5 block">{attendanceRate}%</span>
            </div>
          </div>

          {/* Attendance Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-paper border border-rule rounded-xl p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleMarkAll('present')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('absent')}
                className="px-3 py-1.5 rounded-lg border border-rule bg-paper hover:bg-paper-2 text-ink text-xs font-medium transition-colors"
              >
                Clear All
              </button>
              <span className="text-ink-muted text-xs mx-1">|</span>
              <select
                aria-label="Filter Attendance Status"
                value={filterAttendanceStatus}
                onChange={(e) => setFilterAttendanceStatus(e.target.value)}
                className="h-8 px-2 text-xs rounded border border-rule bg-paper text-ink font-medium"
              >
                <option value="ALL">All Students ({roster.length})</option>
                <option value="present">Present ({presentCount})</option>
                <option value="absent">Absent ({absentCount})</option>
                <option value="late">Late ({lateCount})</option>
                <option value="duty_leave">Duty Leave</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={attendanceSearch}
                onChange={(e) => setAttendanceSearch(e.target.value)}
                placeholder="Search by student name or roll..."
                className="h-9 px-3 text-xs rounded-lg border border-rule bg-paper text-ink placeholder:text-ink-muted w-48 sm:w-60 focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
              <button
                type="button"
                onClick={handleSaveAttendance}
                className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 whitespace-nowrap"
              >
                Save Attendance
              </button>
            </div>
          </div>

          {/* Roster Table */}
          <div className="bg-paper border border-rule rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-paper-2 border-b border-rule text-ink-muted font-semibold">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4 w-36">Roll Number</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4 w-32 text-center">Aggregate Attendance</th>
                    <th className="py-3 px-4 w-64 text-center">Today's Roll Call</th>
                    <th className="py-3 px-4 w-44">Faculty Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {filteredRoster.map((student, idx) => {
                    const isDefaulter = student.currentAttendance < 75;

                    return (
                      <tr
                        key={student.id}
                        className="hover:bg-paper-2/60 transition-colors"
                      >
                        <td className="py-3 px-4 text-center font-mono text-ink-muted tabular-nums">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-ink tabular-nums">
                          DEMO/2024/{student.rollNo.slice(-7)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-ink">
                          {student.name}
                          {student.name === 'Priya Sharma' && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-normal">
                              Primary Demo Scholar
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded text-xs tabular-nums ${
                              isDefaulter
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {student.currentAttendance}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleStudentStatus(student.id, 'present')}
                              className={`px-2.5 py-1 text-xs font-bold rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-600 ${
                                student.status === 'present'
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'bg-paper-2 text-ink-muted hover:text-ink'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStudentStatus(student.id, 'absent')}
                              className={`px-2.5 py-1 text-xs font-bold rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-600 ${
                                student.status === 'absent'
                                  ? 'bg-rose-600 text-white shadow-sm'
                                  : 'bg-paper-2 text-ink-muted hover:text-ink'
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStudentStatus(student.id, 'late')}
                              className={`px-2.5 py-1 text-xs font-bold rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-600 ${
                                student.status === 'late'
                                  ? 'bg-amber-600 text-white shadow-sm'
                                  : 'bg-paper-2 text-ink-muted hover:text-ink'
                              }`}
                            >
                              Late
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStudentStatus(student.id, 'duty_leave')}
                              className={`px-2 py-1 text-xs font-bold rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-600 ${
                                student.status === 'duty_leave'
                                  ? 'bg-sky-600 text-white shadow-sm'
                                  : 'bg-paper-2 text-ink-muted hover:text-ink'
                              }`}
                            >
                              Duty Leave
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            placeholder="Optional remark..."
                            className="w-full h-8 px-2 text-xs rounded border border-rule bg-paper text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-brand-600"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Submit */}
            <div className="p-4 bg-paper-2 border-t border-rule flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-ink-muted font-medium">
                {defaulterCount > 0 ? (
                  <span className="text-rose-600 font-semibold">
                    Notice: {defaulterCount} students are currently below the 75% statutory attendance threshold.
                  </span>
                ) : (
                  <span>All students in this cohort currently meet compliance minimums.</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  className="px-6 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                >
                  Save &amp; Finalize Attendance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PUBLISH QUIZZES & ASSESSMENTS */}
      {/* ========================================================================= */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-paper border border-rule rounded-xl p-5 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-ink tracking-tight">
                Classroom Quizzes &amp; Periodic Tests ({courseQuizzes.length})
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Design and publish continuous internal assessments. Published quizzes immediately appear in enrolled student portals.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowQuizModal(true)}
              className="px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 self-start sm:self-auto"
            >
              + Create &amp; Publish New Quiz
            </button>
          </div>

          {/* Quizzes List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courseQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-paper border border-rule rounded-xl p-5 shadow-sm space-y-4 hover:border-brand-600/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-ink">
                      {quiz.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        quiz.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                          : 'bg-paper-2 text-ink-muted border border-rule'
                      }`}>
                        {quiz.status === 'active' ? 'Active' : 'Closed'}
                      </span>
                      <span className="text-xs text-ink-muted font-medium">
                        {quiz.subjectCode} · {quiz.batch}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-[11px] font-semibold text-ink-muted block">Total Marks</span>
                    <span className="font-mono font-bold text-sm text-ink tabular-nums">{quiz.totalMarks} Marks</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-paper-2 border border-rule text-xs text-center">
                  <div>
                    <span className="text-[11px] text-ink-muted block">Duration</span>
                    <span className="font-semibold text-ink tabular-nums">{quiz.durationMinutes} Mins</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-ink-muted block">Questions</span>
                    <span className="font-semibold text-ink tabular-nums">{quiz.questionsCount || quiz.questions.length} Items</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-ink-muted block">Pass Mark</span>
                    <span className="font-semibold text-ink tabular-nums">{quiz.passingMarks}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-rule text-xs">
                  <span className="text-ink-muted">
                    Deadline: <span className="font-semibold text-ink">{quiz.deadline.replace('T', ' ').slice(0, 16)}</span>
                  </span>
                  <Link
                    href={`/portal/faculty/quizzes`}
                    className="font-semibold text-brand-600 hover:underline"
                  >
                    View Submissions
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {courseQuizzes.length === 0 && (
            <div className="text-center py-12 bg-paper border border-rule rounded-xl p-8">
              <p className="text-sm font-semibold text-ink">No quizzes published yet for {course.code}.</p>
              <p className="text-xs text-ink-muted mt-1">Publish an online quiz to test understanding of current lecture units.</p>
              <button
                type="button"
                onClick={() => setShowQuizModal(true)}
                className="mt-3 px-4 py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold shadow-sm hover:bg-brand-700"
              >
                Create First Quiz
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: UPLOAD & SHARE CLASS RESOURCES */}
      {/* ========================================================================= */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-paper border border-rule rounded-xl p-5 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-ink tracking-tight">
                Course Resources &amp; Handouts ({course.modules.reduce((a, m) => a + m.resources.length, 0)} Files)
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Upload lecture slide decks, reference PDFs, lab problem statements, and code repositories directly to student LMS consoles.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowResourceModal(true)}
              className="px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 self-start sm:self-auto"
            >
              + Upload New Resource
            </button>
          </div>

          {/* Module-by-Module Resources Grid */}
          <div className="space-y-4">
            {course.modules.map((module, mIdx) => (
              <div
                key={module.id || mIdx}
                className="bg-paper border border-rule rounded-xl p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between border-b border-rule pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-ink">
                      {module.title}
                    </h3>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {module.description} · <span className="font-semibold text-ink tabular-nums">{module.hours} Lecture Hours</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewResourceModule(module.id);
                      setShowResourceModal(true);
                    }}
                    className="text-xs font-semibold text-brand-600 hover:underline"
                  >
                    + Add File
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {module.resources.map((res) => (
                    <div
                      key={res.id}
                      className="p-3.5 rounded-lg bg-paper-2 border border-rule flex items-center justify-between gap-3 hover:border-brand-600/40 transition-colors"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                          {res.type}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs text-ink truncate">
                            {res.title}
                          </div>
                          <div className="text-[11px] text-ink-muted mt-0.5 tabular-nums">
                            {res.fileSize} · Distributed to Batch
                          </div>
                        </div>
                      </div>

                      <a
                        href={res.downloadUrl}
                        download
                        onClick={(e) => {
                          e.preventDefault();
                          triggerToast(`Downloading ${res.title}`);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-brand-600 hover:text-brand-800 rounded bg-paper border border-rule flex-shrink-0"
                      >
                        Download
                      </a>
                    </div>
                  ))}

                  {module.resources.length === 0 && (
                    <div className="col-span-2 text-center py-4 text-xs text-ink-muted bg-paper-2 rounded-lg border border-dashed border-rule">
                      No files uploaded to this unit yet. Click "+ Add File" above.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE & PUBLISH QUIZ */}
      {/* ========================================================================= */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs" role="dialog" aria-modal="true">
          <div className="bg-paper border border-rule rounded-xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <div>
                <h3 className="text-base font-bold text-ink">
                  Publish New Quiz to {course.code}
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Students in {course.code} will be alerted to take this assessment immediately.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowQuizModal(false)}
                className="p-1 rounded text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
              >
                <svg className="w-5 h-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handlePublishQuiz} className="space-y-4">
              <div>
                <label htmlFor="quiz-title-input" className="block text-xs font-semibold text-ink mb-1.5 normal-case">
                  Quiz Title <span className="text-danger">*</span>
                </label>
                <input
                  id="quiz-title-input"
                  type="text"
                  required
                  value={newQuizTitle}
                  onChange={(e) => setNewQuizTitle(e.target.value)}
                  placeholder="e.g. Unit 3 Test: Transaction Management &amp; Concurrency"
                  className="w-full h-10 px-3.5 text-xs rounded-lg border border-rule bg-paper text-ink focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label htmlFor="duration-input" className="block text-xs font-semibold text-ink mb-1.5 normal-case">
                    Duration (Mins)
                  </label>
                  <input
                    id="duration-input"
                    type="number"
                    min={5}
                    value={newQuizDuration}
                    onChange={(e) => setNewQuizDuration(Number(e.target.value))}
                    className="w-full h-10 px-3 text-xs rounded-lg border border-rule bg-paper text-ink font-mono focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                </div>
                <div>
                  <label htmlFor="total-marks-input" className="block text-xs font-semibold text-ink mb-1.5 normal-case">
                    Total Marks
                  </label>
                  <input
                    id="total-marks-input"
                    type="number"
                    min={5}
                    value={newQuizTotalMarks}
                    onChange={(e) => setNewQuizTotalMarks(Number(e.target.value))}
                    className="w-full h-10 px-3 text-xs rounded-lg border border-rule bg-paper text-ink font-mono focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                </div>
                <div>
                  <label htmlFor="pass-marks-input" className="block text-xs font-semibold text-ink mb-1.5 normal-case">
                    Pass Mark
                  </label>
                  <input
                    id="pass-marks-input"
                    type="number"
                    min={1}
                    value={newQuizPassingMarks}
                    onChange={(e) => setNewQuizPassingMarks(Number(e.target.value))}
                    className="w-full h-10 px-3 text-xs rounded-lg border border-rule bg-paper text-ink font-mono focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                </div>
                <div>
                  <label htmlFor="deadline-input" className="block text-xs font-semibold text-ink mb-1.5 normal-case">
                    Submission Deadline
                  </label>
                  <input
                    id="deadline-input"
                    type="datetime-local"
                    value={newQuizDeadline}
                    onChange={(e) => setNewQuizDeadline(e.target.value)}
                    className="w-full h-10 px-2 text-xs rounded-lg border border-rule bg-paper text-ink font-mono focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                </div>
              </div>

              {/* Questions Section */}
              <div className="space-y-3 pt-2 border-t border-rule">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink">
                    Quiz Questions ({newQuizQuestions.length})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setNewQuizQuestions((prev) => [
                        ...prev,
                        {
                          id: `q${prev.length + 1}`,
                          prompt: `Question ${prev.length + 1}: Enter technical concept question...`,
                          options: [
                            { id: 'opt1', text: 'Option A' },
                            { id: 'opt2', text: 'Option B' },
                            { id: 'opt3', text: 'Option C' },
                            { id: 'opt4', text: 'Option D' },
                          ],
                          correctOptionId: 'opt1',
                          points: 5,
                        },
                      ])
                    }
                    className="text-xs font-semibold text-brand-600 hover:underline"
                  >
                    + Add Another Question
                  </button>
                </div>

                {newQuizQuestions.map((q, qIdx) => (
                  <div key={q.id} className="p-3.5 rounded-lg bg-paper-2 border border-rule space-y-2 text-xs">
                    <div className="font-semibold text-ink flex items-center justify-between">
                      <span>Question #{qIdx + 1}</span>
                      <span className="font-mono text-ink-muted">{q.points} Points</span>
                    </div>
                    <input
                      type="text"
                      value={q.prompt}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewQuizQuestions((prev) =>
                          prev.map((item, i) => (i === qIdx ? { ...item, prompt: val } : item))
                        );
                      }}
                      className="w-full h-8 px-2.5 rounded border border-rule bg-paper text-ink text-xs focus:outline-none focus:ring-1 focus:ring-brand-600"
                    />
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt) => (
                        <label
                          key={opt.id}
                          className={`flex items-center space-x-2 p-1.5 rounded border ${
                            q.correctOptionId === opt.id
                              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold'
                              : 'border-rule bg-paper text-ink'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correctOptionId === opt.id}
                            onChange={() => {
                              setNewQuizQuestions((prev) =>
                                prev.map((item, i) =>
                                  i === qIdx ? { ...item, correctOptionId: opt.id } : item
                                )
                              );
                            }}
                          />
                          <span className="truncate">{opt.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-rule">
                <button
                  type="button"
                  onClick={() => setShowQuizModal(false)}
                  className="px-4 py-2 rounded-lg border border-rule bg-paper text-ink text-xs font-medium hover:bg-paper-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                >
                  Publish Quiz to Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: UPLOAD COURSE RESOURCE */}
      {/* ========================================================================= */}
      {showResourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs" role="dialog" aria-modal="true">
          <div className="bg-paper border border-rule rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <div>
                <h3 className="text-base font-bold text-ink">
                  Upload Resource to {course.code}
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Distribute lecture slides, references, and code samples.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowResourceModal(false)}
                className="p-1 rounded text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
              >
                <svg className="w-5 h-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUploadResource} className="space-y-4">
              <div>
                <label htmlFor="res-title-input" className="block text-xs font-semibold text-ink mb-1.5 normal-case">
                  Resource Document Title <span className="text-danger">*</span>
                </label>
                <input
                  id="res-title-input"
                  type="text"
                  required
                  value={newResourceTitle}
                  onChange={(e) => setNewResourceTitle(e.target.value)}
                  placeholder="e.g. Lecture Notes: Normalization &amp; Functional Dependencies"
                  className="w-full h-10 px-3.5 text-xs rounded-lg border border-rule bg-paper text-ink focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="res-type-select" className="block text-xs font-semibold text-ink mb-1.5 normal-case">
                    Format Type
                  </label>
                  <select
                    id="res-type-select"
                    value={newResourceType}
                    onChange={(e) => setNewResourceType(e.target.value as any)}
                    className="w-full h-10 px-3 text-xs rounded-lg border border-rule bg-paper text-ink focus:outline-none focus:ring-2 focus:ring-brand-600"
                  >
                    <option value="slides">Presentation Slides</option>
                    <option value="pdf">PDF Handout</option>
                    <option value="code">Source Code / Lab Script</option>
                    <option value="video">Recorded Lecture</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="res-module-select" className="block text-xs font-semibold text-ink mb-1.5 normal-case">
                    Target Unit / Module
                  </label>
                  <select
                    id="res-module-select"
                    value={newResourceModule}
                    onChange={(e) => setNewResourceModule(e.target.value)}
                    className="w-full h-10 px-3 text-xs rounded-lg border border-rule bg-paper text-ink focus:outline-none focus:ring-2 focus:ring-brand-600"
                  >
                    {course.modules.length > 0 ? (
                      course.modules.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.title}
                        </option>
                      ))
                    ) : (
                      <option value="m1">Module 1</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="file-input" className="block text-xs font-semibold text-ink mb-1.5 normal-case">
                  Select File from Device (PDF, PPTX, ZIP)
                </label>
                <input
                  id="file-input"
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setNewResourceSize(`${(f.size / (1024 * 1024)).toFixed(1)} MB`);
                      if (!newResourceTitle) setNewResourceTitle(f.name.replace(/\.[^/.]+$/, ''));
                    }
                  }}
                  className="w-full text-xs text-ink-muted file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-rule">
                <button
                  type="button"
                  onClick={() => setShowResourceModal(false)}
                  className="px-4 py-2 rounded-lg border border-rule bg-paper text-ink text-xs font-medium hover:bg-paper-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                >
                  Upload &amp; Share
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
