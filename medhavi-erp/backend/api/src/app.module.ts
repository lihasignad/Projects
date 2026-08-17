import { AuthModule } from './modules/auth/auth.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { MongoModule } from './infrastructure/mongo/mongo.module';
import { HealthModule } from './infrastructure/health/health.module';
import { QueueModule } from './queues/queue.module';
import { TenantModule } from './tenancy/tenant.module';
import configuration from './config/configuration';
import { validateEnv } from './config/env.validation';
import { InstitutesModule } from './modules/institutes/institutes.module';
import { CampusesModule } from './modules/campuses/campuses.module';
import { SchoolsModule } from './modules/schools/schools.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { ProgramsModule } from './modules/programs/programs.module';
import { AcademicYearsModule } from './modules/academic-years/academic-years.module';
import { BatchesModule } from './modules/batches/batches.module';
import { StudentsModule } from './modules/students/students.module';
import { UsersModule } from './modules/users/users.module';
import { FacultyModule } from './modules/faculty/faculty.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { TermsModule } from './modules/terms/terms.module';
import { SectionsModule } from './modules/sections/sections.module';
import { SubjectOfferingsModule } from './modules/subject-offerings/subject-offerings.module';
import { CoursesModule } from './modules/courses/courses.module';
import { CourseModulesModule } from './modules/course-modules/course-modules.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { DiscussionThreadsModule } from './modules/discussion-threads/discussion-threads.module';
import { DiscussionCommentsModule } from './modules/discussion-comments/discussion-comments.module';
import { LmsSessionsModule } from './modules/lms-sessions/lms-sessions.module';
import { AssignmentCategoriesModule } from './modules/assignment-categories/assignment-categories.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { AssignmentSubmissionsModule } from './modules/assignment-submissions/assignment-submissions.module';
import { QuizQuestionsModule } from './modules/quiz-questions/quiz-questions.module';
import { QuizBanksModule } from './modules/quiz-banks/quiz-banks.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { QuizAttemptsModule } from './modules/quiz-attempts/quiz-attempts.module';
import { AttendanceSessionsModule } from './modules/attendance-sessions/attendance-sessions.module';
import { AttendanceRecordsModule } from './modules/attendance-records/attendance-records.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { LabsModule } from './modules/labs/labs.module';
import { TimeSlotsModule } from './modules/time-slots/time-slots.module';
import { TimetablesModule } from './modules/timetables/timetables.module';
import { TimetableEntriesModule } from './modules/timetable-entries/timetable-entries.module';
import { ClassSessionsModule } from './modules/class-sessions/class-sessions.module';
import { ExamsModule } from './modules/exams/exams.module';
import { ExamSchedulesModule } from './modules/exam-schedules/exam-schedules.module';
import { InvigilationAssignmentsModule } from './modules/invigilation-assignments/invigilation-assignments.module';
import { HallTicketsModule } from './modules/hall-tickets/hall-tickets.module';
import { MarksEntriesModule } from './modules/marks-entries/marks-entries.module';
import { ModerationsModule } from './modules/moderations/moderations.module';
import { ResultsModule } from './modules/results/results.module';
import { TranscriptsModule } from './modules/transcripts/transcripts.module';
import { RevaluationRequestsModule } from './modules/revaluation-requests/revaluation-requests.module';
import { CourseEnrollmentsModule } from './modules/course-enrollments/course-enrollments.module';
import { QuizResultsModule } from './modules/quiz-results/quiz-results.module';
import { FacultyWorkloadsModule } from './modules/faculty-workloads/faculty-workloads.module';
import { MentorshipsModule } from './modules/mentorships/mentorships.module';
import { FacultyAdvisorsModule } from './modules/faculty-advisors/faculty-advisors.module';
import { AdvisorStudentsModule } from './modules/advisor-students/advisor-students.module';
import { RegistrationCyclesModule } from './modules/registration-cycles/registration-cycles.module';
import { CourseRegistrationsModule } from './modules/course-registrations/course-registrations.module';
import { RegistrationSubjectsModule } from './modules/registration-subjects/registration-subjects.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),

    PrismaModule,
    MongoModule,
    RedisModule,
    QueueModule,
    TenantModule,
    HealthModule,
    InstitutesModule,
    CampusesModule,
    SchoolsModule,
    DepartmentsModule,
    ProgramsModule,
    AcademicYearsModule,
    StudentsModule,
    UsersModule,
    FacultyModule,
    SubjectsModule,
    TermsModule,
    SectionsModule,
    SubjectOfferingsModule,
    CoursesModule,
    CourseModulesModule,
    ResourcesModule,
    DiscussionThreadsModule,
    DiscussionCommentsModule,
    LmsSessionsModule,
    AssignmentCategoriesModule,
    AssignmentsModule,
    AssignmentSubmissionsModule,
    QuizQuestionsModule,
    BatchesModule,
    QuizBanksModule,
    QuizzesModule,
    QuizAttemptsModule,
    AttendanceSessionsModule,
    AttendanceRecordsModule,
    RoomsModule,
    LabsModule,
    TimeSlotsModule,
    TimetablesModule,
    TimetableEntriesModule,
    ClassSessionsModule,
    ExamsModule,
    ExamSchedulesModule,
    InvigilationAssignmentsModule,
    HallTicketsModule,
    MarksEntriesModule,
    ModerationsModule,
    ResultsModule,
    TranscriptsModule,
    RevaluationRequestsModule,
    CourseEnrollmentsModule,
    QuizResultsModule,
    FacultyWorkloadsModule,
    MentorshipsModule,
    FacultyAdvisorsModule,
    AdvisorStudentsModule,
    RegistrationCyclesModule,
    CourseRegistrationsModule,
    RegistrationSubjectsModule,
    AuthModule, 
  ],
})
export class AppModule {}