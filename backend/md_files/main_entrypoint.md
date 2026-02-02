// ==================== src/main.ts ====================

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import * as helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggerService } from './logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const logger = app.get(LoggerService);

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: configService.get('FRONTEND_URL'),
    credentials: true,
  });

  // API prefix
  app.setGlobalPrefix(configService.get('API_PREFIX', 'api/v1'));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global response transformer
  app.useGlobalInterceptors(new TransformInterceptor());

  const port = configService.get('PORT', 4000);
  await app.listen(port);

  logger.log(`🚀 K-shap API running on http://localhost:${port}/${configService.get('API_PREFIX')}`, 'Bootstrap');
  logger.log(`📚 Environment: ${configService.get('NODE_ENV')}`, 'Bootstrap');
}

bootstrap();

// ==================== src/app.module.ts ====================

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
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get('RATE_LIMIT_TTL', 60),
        limit: configService.get('RATE_LIMIT_LIMIT', 100),
      }),
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

// ==================== src/database/database.module.ts ====================

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Import all schemas
import { User, UserSchema } from './schemas/user.schema';
import { Company, CompanySchema } from './schemas/company.schema';
import { Role, RoleSchema } from './schemas/role.schema';
import { Permission, PermissionSchema } from './schemas/permission.schema';
import { Department, DepartmentSchema } from './schemas/department.schema';
import { Office, OfficeSchema } from './schemas/office.schema';
import { Disbursement, DisbursementSchema } from './schemas/disbursement.schema';
import { Collection, CollectionSchema } from './schemas/collection.schema';
import { DisbursementType, DisbursementTypeSchema } from './schemas/disbursement-type.schema';
import { Beneficiary, BeneficiarySchema } from './schemas/beneficiary.schema';
import { AuditLog, AuditLogSchema } from './schemas/audit-log.schema';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { ChatMessage, ChatMessageSchema } from './schemas/chat-message.schema';
import { DeletedDataRegistry, DeletedDataRegistrySchema } from './schemas/deleted-data-registry.schema';
import { ErrorLog, ErrorLogSchema } from './schemas/error-log.schema';
import { EmailSettings, EmailSettingsSchema } from './schemas/email-settings.schema';
import { ReminderSettings, ReminderSettingsSchema } from './schemas/reminder-settings.schema';

const schemas = [
  { name: User.name, schema: UserSchema },
  { name: Company.name, schema: CompanySchema },
  { name: Role.name, schema: RoleSchema },
  { name: Permission.name, schema: PermissionSchema },
  { name: Department.name, schema: DepartmentSchema },
  { name: Office.name, schema: OfficeSchema },
  { name: Disbursement.name, schema: DisbursementSchema },
  { name: Collection.name, schema: CollectionSchema },
  { name: DisbursementType.name, schema: DisbursementTypeSchema },
  { name: Beneficiary.name, schema: BeneficiarySchema },
  { name: AuditLog.name, schema: AuditLogSchema },
  { name: Notification.name, schema: NotificationSchema },
  { name: ChatMessage.name, schema: ChatMessageSchema },
  { name: DeletedDataRegistry.name, schema: DeletedDataRegistrySchema },
  { name: ErrorLog.name, schema: ErrorLogSchema },
  { name: EmailSettings.name, schema: EmailSettingsSchema },
  { name: ReminderSettings.name, schema: ReminderSettingsSchema },
];

@Module({
  imports: [MongooseModule.forFeature(schemas)],
  exports: [MongooseModule],
})
export class DatabaseModule {}

// ==================== src/logger/logger.module.ts ====================

import { Module, Global } from '@nestjs/common';
import { LoggerService } from './logger.service';

@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}

// ==================== src/cache/cache.module.ts ====================

import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get('REDIS_HOST', 'localhost'),
            port: configService.get('REDIS_PORT', 6379),
          },
          password: configService.get('REDIS_PASSWORD'),
          ttl: configService.get('REDIS_TTL', 3600), // 1 hour default
        }),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
export class CacheModule {}

// ==================== src/cache/cache.service.ts ====================

import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    await this.cacheManager.reset();
  }

  // Helper methods for common cache patterns
  async wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const result = await fn();
    await this.set(key, result, ttl);
    return result;
  }

  // Invalidate cache by pattern (e.g., "user:*", "company:123:*")
  async invalidatePattern(pattern: string): Promise<void> {
    // Note: This requires Redis SCAN command
    // Implementation depends on your cache-manager-redis-yet version
    // You may need to access the Redis client directly
  }

  // Company-scoped cache helpers
  getCompanyKey(companyId: string, key: string): string {
    return `company:${companyId}:${key}`;
  }

  async getCompanyData<T>(companyId: string, key: string): Promise<T | undefined> {
    return this.get<T>(this.getCompanyKey(companyId, key));
  }

  async setCompanyData(companyId: string, key: string, value: any, ttl?: number): Promise<void> {
    await this.set(this.getCompanyKey(companyId, key), value, ttl);
  }
}