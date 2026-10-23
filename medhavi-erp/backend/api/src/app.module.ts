import { AuthModule } from './modules/auth/auth.module';
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TenantMiddleware } from './tenancy/tenant.middleware';
import { HttpLoggingMiddleware } from './common/middleware/http-logging.middleware';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { MongoModule } from './infrastructure/mongo/mongo.module';
import { HealthModule } from './infrastructure/health/health.module';
import { QueueModule } from './queues/queue.module';
import { TenantModule } from './tenancy/tenant.module';
import { StorageModule } from './infrastructure/storage/storage.module';
import { MailerModule } from './infrastructure/mailer/mailer.module';
import { SmsModule } from './infrastructure/sms/sms.module';
import { NotificationsModule } from './infrastructure/notifications/notifications.module';
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

import { FeeStructuresModule } from './modules/fee-structures/fee-structures.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ScholarshipsModule } from './modules/scholarships/scholarships.module';
import { WalletsModule } from './modules/wallets/wallets.module';
import { WalletTransactionsModule } from './modules/wallet-transactions/wallet-transactions.module';
import { FeeWaiversModule } from './modules/fee-waivers/fee-waivers.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { HelpCenterArticlesModule } from './modules/help-center-articles/help-center-articles.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { BooksModule } from './modules/books/books.module';
import { BookCopiesModule } from './modules/book-copies/book-copies.module';
import { BookIssuesModule } from './modules/book-issues/book-issues.module';
import { BookReservationsModule } from './modules/book-reservations/book-reservations.module';
import { LibraryFinesModule } from './modules/library-fines/library-fines.module';
import { HostelsModule } from './modules/hostels/hostels.module';
import { HostelRoomsModule } from './modules/hostel-rooms/hostel-rooms.module';
import { HostelAllocationsModule } from './modules/hostel-allocations/hostel-allocations.module';
import { HostelLeaveRequestsModule } from './modules/hostel-leave-requests/hostel-leave-requests.module';
import { TransportRoutesModule } from './modules/transport-routes/transport-routes.module';
import { TransportVehiclesModule } from './modules/transport-vehicles/transport-vehicles.module';
import { TransportStopsModule } from './modules/transport-stops/transport-stops.module';
import { TransportPassesModule } from './modules/transport-passes/transport-passes.module';
import { ClubsModule } from './modules/clubs/clubs.module';
import { ClubMembershipsModule } from './modules/club-memberships/club-memberships.module';
import { EventsModule } from './modules/events/events.module';
import { EventRegistrationsModule } from './modules/event-registrations/event-registrations.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { PlacementDrivesModule } from './modules/placement-drives/placement-drives.module';
import { PlacementApplicationsModule } from './modules/placement-applications/placement-applications.module';
import { PlacementOffersModule } from './modules/placement-offers/placement-offers.module';
import { ResearchProjectsModule } from './modules/research-projects/research-projects.module';
import { PublicationsModule } from './modules/publications/publications.module';
import { GrantsModule } from './modules/grants/grants.module';
import { PatentsModule } from './modules/patents/patents.module';

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
    StorageModule,
    MailerModule,
    SmsModule,
    NotificationsModule,
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
    FeeStructuresModule,
    InvoicesModule,
    PaymentsModule,
    ScholarshipsModule,
    WalletsModule,
    WalletTransactionsModule,
    FeeWaiversModule,
    DocumentsModule,
    CertificatesModule,
    HelpCenterArticlesModule,
    TicketsModule,
    BooksModule,
    BookCopiesModule,
    BookIssuesModule,
    BookReservationsModule,
    LibraryFinesModule,
    HostelsModule,
    HostelRoomsModule,
    HostelAllocationsModule,
    HostelLeaveRequestsModule,
    TransportRoutesModule,
    TransportVehiclesModule,
    TransportStopsModule,
    TransportPassesModule,
    ClubsModule,
    ClubMembershipsModule,
    EventsModule,
    EventRegistrationsModule,
    FeedbackModule,
    CompaniesModule,
    PlacementDrivesModule,
    PlacementApplicationsModule,
    PlacementOffersModule,
    ResearchProjectsModule,
    PublicationsModule,
    GrantsModule,
    PatentsModule,
    AuthModule, 
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggingMiddleware, TenantMiddleware).forRoutes('*');
  }
}