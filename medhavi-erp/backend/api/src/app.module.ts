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

    BatchesModule,

    AuthModule, 
  ],
})
export class AppModule {}