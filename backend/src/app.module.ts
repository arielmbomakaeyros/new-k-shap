import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

// Core modules
import { DatabaseModule } from './database/database.module';
import { LoggerModule } from './logger/logger.module';
import { EmailModule } from './email/email.module';
import { CacheModule } from './cache/cache.module';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { OfficesModule } from './modules/offices/offices.module';
import { DisbursementsModule } from './modules/disbursements/disbursements.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { DisbursementTypesModule } from './modules/disbursement-types/disbursement-types.module';
import { BeneficiariesModule } from './modules/beneficiaries/beneficiaries.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ChatModule } from './modules/chat/chat.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ExportsModule } from './modules/exports/exports.module';
import { ReportsModule } from './modules/reports/reports.module';
import { KaeyrosModule } from './modules/kaeyros/kaeyros.module';
import { FileUploadModule } from './modules/file-upload/file-upload.module';

// Jobs
import { JobsModule } from './jobs/jobs.module';

// Guards
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { CompanyAccessGuard } from './common/guards/company-access.guard';

// Interceptors
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        retryWrites: true,
        w: 'majority',
      }),
      inject: [ConfigService],
    }),

    // Scheduling for cron jobs
    ScheduleModule.forRoot(),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => [
        {
          ttl: configService.get('RATE_LIMIT_TTL', 60),
          limit: configService.get('RATE_LIMIT_LIMIT', 100),
        },
      ],
      inject: [ConfigService],
    }),

    // Core modules
    DatabaseModule,
    LoggerModule,
    EmailModule,
    CacheModule,

    // Feature modules
    AuthModule,
    UsersModule,
    CompaniesModule,
    RolesModule,
    PermissionsModule,
    DepartmentsModule,
    OfficesModule,
    DisbursementsModule,
    CollectionsModule,
    DisbursementTypesModule,
    BeneficiariesModule,
    NotificationsModule,
    ChatModule,
    AuditLogsModule,
    SettingsModule,
    ExportsModule,
    ReportsModule,
    KaeyrosModule,
    FileUploadModule,
    JobsModule,
  ],
  providers: [
    // Global guards (order matters!)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // First: Authentication
    },
    {
      provide: APP_GUARD,
      useClass: CompanyAccessGuard, // Second: Multi-tenant isolation
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard, // Third: Authorization
    },
    // Global interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor, // Log all actions
    },
  ],
})
export class AppModule {}
