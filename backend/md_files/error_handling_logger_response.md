// ==================== src/common/constants/error-messages.ts ====================

export const ERROR_MESSAGES = {
  // Authentication
  AUTH_INVALID_CREDENTIALS: 'Invalid email or password',
  AUTH_ACCOUNT_LOCKED: 'Your account has been locked. Please contact support.',
  AUTH_ACCOUNT_NOT_ACTIVATED: 'Please activate your account using the link sent to your email',
  AUTH_TOKEN_EXPIRED: 'Your session has expired. Please login again.',
  AUTH_TOKEN_INVALID: 'Invalid authentication token',
  AUTH_UNAUTHORIZED: 'You are not authorized to perform this action',
  AUTH_FORBIDDEN: 'Access denied',
  AUTH_MUST_CHANGE_PASSWORD: 'You must change your password before accessing the application',
  
  // User
  USER_NOT_FOUND: 'User not found',
  USER_EMAIL_EXISTS: 'Email already registered',
  USER_CANNOT_LOGIN: 'Account activation pending. Check your email.',
  USER_INACTIVE: 'User account is inactive',
  USER_DELETED: 'User has been deleted',
  
  // Company
  COMPANY_NOT_FOUND: 'Company not found',
  COMPANY_SUSPENDED: 'Company account is suspended',
  COMPANY_EXPIRED: 'Company subscription has expired',
  COMPANY_SLUG_EXISTS: 'Company slug already exists',
  COMPANY_MAX_USERS_REACHED: 'Maximum user limit reached for this company',
  
  // Disbursement
  DISBURSEMENT_NOT_FOUND: 'Disbursement not found',
  DISBURSEMENT_ALREADY_VALIDATED: 'Disbursement already validated at this stage',
  DISBURSEMENT_ALREADY_REJECTED: 'Disbursement has been rejected',
  DISBURSEMENT_ALREADY_COMPLETED: 'Disbursement already completed',
  DISBURSEMENT_WRONG_STATUS: 'Invalid disbursement status for this action',
  DISBURSEMENT_INSUFFICIENT_PERMISSION: 'You do not have permission to validate this disbursement',
  DISBURSEMENT_AMOUNT_EXCEEDS_LIMIT: 'Disbursement amount exceeds your approval limit',
  DISBURSEMENT_CANNOT_DELETE: 'Cannot delete completed disbursements',
  
  // Collection
  COLLECTION_NOT_FOUND: 'Collection not found',
  
  // Permissions
  PERMISSION_DENIED: 'You do not have permission to perform this action',
  PERMISSION_NOT_FOUND: 'Permission not found',
  ROLE_NOT_FOUND: 'Role not found',
  
  // Department & Office
  DEPARTMENT_NOT_FOUND: 'Department not found',
  OFFICE_NOT_FOUND: 'Office not found',
  
  // Validation
  VALIDATION_FAILED: 'Validation failed',
  INVALID_INPUT: 'Invalid input data',
  INVALID_DATE_RANGE: 'Invalid date range',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_TOO_LARGE: 'File size exceeds maximum limit',
  
  // System
  SERVER_ERROR: 'An unexpected error occurred. Our team has been notified.',
  DATABASE_ERROR: 'Database operation failed',
  CACHE_ERROR: 'Cache operation failed',
  EMAIL_SEND_FAILED: 'Failed to send email',
  
  // Kaeyros
  KAEYROS_ONLY: 'This action is restricted to Kaeyros administrators',
  COMPANY_FEATURE_DISABLED: 'This feature is not enabled for your company',
} as const;

export const SUCCESS_MESSAGES = {
  // Auth
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PASSWORD_CHANGED: 'Password changed successfully',
  PASSWORD_RESET_EMAIL_SENT: 'Password reset link sent to your email',
  ACCOUNT_ACTIVATED: 'Account activated successfully',
  
  // User
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  USER_RESTORED: 'User restored successfully',
  
  // Company
  COMPANY_CREATED: 'Company created successfully',
  COMPANY_UPDATED: 'Company updated successfully',
  COMPANY_FEATURE_TOGGLED: 'Company feature updated successfully',
  
  // Disbursement
  DISBURSEMENT_CREATED: 'Disbursement created successfully',
  DISBURSEMENT_UPDATED: 'Disbursement updated successfully',
  DISBURSEMENT_VALIDATED: 'Disbursement validated successfully',
  DISBURSEMENT_APPROVED: 'Disbursement approved successfully',
  DISBURSEMENT_EXECUTED: 'Disbursement executed successfully',
  DISBURSEMENT_REJECTED: 'Disbursement rejected',
  DISBURSEMENT_FORCE_COMPLETED: 'Disbursement force completed',
  
  // Collection
  COLLECTION_CREATED: 'Collection created successfully',
  COLLECTION_UPDATED: 'Collection updated successfully',
  
  // General
  OPERATION_SUCCESS: 'Operation completed successfully',
  DATA_EXPORTED: 'Data exported successfully',
} as const;

// ==================== src/common/interfaces/api-response.interface.ts ====================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: ValidationError[];
  timestamp: string;
  path?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// ==================== src/common/dto/response.dto.ts ====================

import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data?: T;

  @ApiProperty()
  meta?: PaginationMeta;

  @ApiProperty()
  timestamp: string;

  constructor(success: boolean, message: string, data?: T, meta?: PaginationMeta) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.meta = meta;
    this.timestamp = new Date().toISOString();
  }
}

// ==================== src/common/filters/all-exceptions.filter.ts ====================

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ERROR_MESSAGES } from '../constants/error-messages';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = ERROR_MESSAGES.SERVER_ERROR;
    let errors: any[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        errors = (exceptionResponse as any).errors || [];
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log the error
    this.logger.error(
      `${request.method} ${request.url}`,
      {
        exception,
        user: (request as any).user?.email,
        company: (request as any).user?.company,
        body: request.body,
        params: request.params,
        query: request.query,
      },
    );

    // Send standardized error response
    response.status(status).json({
      success: false,
      message,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
      path: request.url,
      statusCode: status,
    });
  }
}

// ==================== src/common/interceptors/transform.interceptor.ts ====================

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map(data => {
        // If data is already formatted, return as is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Otherwise, wrap in standard response
        return {
          success: true,
          message: data?.message || 'Operation successful',
          data: data?.data || data,
          meta: data?.meta,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}

// ==================== src/logger/logger.service.ts ====================

import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;
  private emailService: EmailService;

  constructor(
    private configService: ConfigService,
  ) {
    this.initializeLogger();
  }

  setEmailService(emailService: EmailService) {
    this.emailService = emailService;
  }

  private initializeLogger() {
    const logLevel = this.configService.get('LOG_LEVEL', 'info');

    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json(),
      ),
      transports: [
        // Console transport
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
              return `${timestamp} [${context || 'Application'}] ${level}: ${message} ${
                Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
              }`;
            }),
          ),
        }),

        // Error log file (rotated daily)
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxFiles: '30d',
          maxSize: '20m',
        }),

        // Combined log file
        new DailyRotateFile({
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxFiles: '30d',
          maxSize: '20m',
        }),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string, metadata?: any) {
    this.logger.error(message, { context, trace, ...metadata });
    
    // Send email to Kaeyros for critical errors
    this.sendCriticalErrorEmail(message, trace, context, metadata);
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }

  private async sendCriticalErrorEmail(
    message: string,
    trace?: string,
    context?: string,
    metadata?: any,
  ) {
    if (!this.emailService) return;

    const kaeyrosEmails = this.configService.get('KAEYROS_ADMIN_EMAILS', '').split(',');
    
    if (kaeyrosEmails.length === 0) return;

    try {
      await this.emailService.sendCriticalErrorAlert({
        to: kaeyrosEmails,
        error: message,
        stackTrace: trace,
        context,
        metadata,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      // Don't let email failure crash the app
      console.error('Failed to send error email:', err);
    }
  }
}

// ==================== src/common/interceptors/audit-log.interceptor.ts ====================

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from '@/modules/audit-logs/audit-logs.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { user, method, url, body, params } = request;

    return next.handle().pipe(
      tap(async (response) => {
        // Only log if user is authenticated
        if (!user) return;

        // Determine action type from route and method
        const action = this.determineAction(method, url);
        
        if (action) {
          await this.auditLogService.log({
            user: user._id,
            company: user.company,
            action,
            method,
            endpoint: url,
            requestBody: this.sanitizeBody(body),
            params,
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
          });
        }
      }),
    );
  }

  private determineAction(method: string, url: string): string | null {
    // Map routes to action types
    // This is simplified - you'll expand based on your routes
    if (url.includes('/disbursements')) {
      if (method === 'POST') return 'DISBURSEMENT_CREATED';
      if (method === 'PUT' || method === 'PATCH') return 'DISBURSEMENT_UPDATED';
      if (method === 'DELETE') return 'DISBURSEMENT_DELETED';
    }
    
    return null;
  }

  private sanitizeBody(body: any): any {
    // Remove sensitive data like passwords
    const sanitized = { ...body };
    if (sanitized.password) sanitized.password = '[REDACTED]';
    if (sanitized.currentPassword) sanitized.currentPassword = '[REDACTED]';
    return sanitized;
  }
}