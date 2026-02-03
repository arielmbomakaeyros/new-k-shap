import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog } from '../../database/schemas/audit-log.schema';
import { ActionType } from '../../database/schemas/enums';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip, headers, body } = request;

    // Only log write operations
    const writeOperations = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (!writeOperations.includes(method)) {
      return next.handle();
    }

    // Skip audit logging if there's no authenticated user
    if (!user?._id) {
      return next.handle();
    }

    // Extract resource info from URL
    const urlParts = url.split('/').filter(Boolean);
    const resourceType = this.extractResourceType(urlParts);
    const resourceId = this.extractResourceId(urlParts);
    const action = this.mapMethodToAction(method);
    const actionDescription = this.generateActionDescription(
      method,
      resourceType,
      url,
    );

    // Store request metadata
    request.auditMetadata = {
      method,
      url,
      userId: user?._id?.toString(),
      userEmail: user?.email,
      company: user?.company ? (user.company._id || user.company).toString() : undefined,
      ipAddress: ip,
      userAgent: headers['user-agent'],
      timestamp: new Date(),
    };

    const startTime = Date.now();

    return next.handle().pipe(
      tap(async (response) => {
        // Log successful operation
        try {
          await this.createAuditLog({
            company: user?.company
              ? (new Types.ObjectId((user.company._id || user.company).toString()) as any)
              : undefined,
            isKaeyrosAction: !user?.company,
            user: user?._id ? (new Types.ObjectId(user._id) as any) : undefined,
            userEmail: user?.email,
            userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
            userRole: user?.systemRoles?.[0] || 'user',
            action,
            actionDescription,
            resourceType,
            resourceId: resourceId
              ? (new Types.ObjectId(resourceId) as any)
              : response?.id || response?._id
                ? (new Types.ObjectId(response.id || response._id) as any)
                : undefined,
            resourceName:
              response?.name ||
              response?.title ||
              body?.name ||
              body?.title ||
              undefined,
            newValues: this.sanitizeData(body) ?? undefined,
            metadata: {
              responseTime: Date.now() - startTime,
              statusCode: 200,
            },
            ipAddress: ip || request.connection?.remoteAddress,
            userAgent: headers['user-agent'],
            endpoint: url,
            method,
            severity: 'info',
            status: 'success',
          });
        } catch (error) {
          this.logger.error(`Failed to create audit log: ${error.message}`);
        }
      }),
      catchError(async (error) => {
        // Log failed operation
        try {
          await this.createAuditLog({
            company: user?.company
              ? (new Types.ObjectId((user.company._id || user.company).toString()) as any)
              : undefined,
            isKaeyrosAction: !user?.company,
            user: user?._id ? (new Types.ObjectId(user._id) as any) : undefined,
            userEmail: user?.email,
            userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
            userRole: user?.systemRoles?.[0] || 'user',
            action,
            actionDescription: `Failed: ${actionDescription}`,
            resourceType,
            resourceId: resourceId
              ? (new Types.ObjectId(resourceId) as any)
              : undefined,
            newValues: this.sanitizeData(body) ?? undefined,
            metadata: {
              responseTime: Date.now() - startTime,
              statusCode: error.status || 500,
            },
            ipAddress: ip || request.connection?.remoteAddress,
            userAgent: headers['user-agent'],
            endpoint: url,
            method,
            severity: error.status >= 500 ? 'critical' : 'warning',
            status: 'failure',
            errorMessage: error.message,
          });
        } catch (logError) {
          this.logger.error(
            `Failed to create audit log for error: ${logError.message}`,
          );
        }
        throw error;
      }),
    );
  }

  private extractResourceType(urlParts: string[]): string {
    // Remove 'api' and 'v1' from the path
    const relevantParts = urlParts.filter(
      (part) =>
        part !== 'api' && part !== 'v1' && !Types.ObjectId.isValid(part),
    );
    return relevantParts[0] || 'unknown';
  }

  private extractResourceId(urlParts: string[]): string | null {
    for (const part of urlParts) {
      if (Types.ObjectId.isValid(part)) {
        return part;
      }
    }
    return null;
  }

  private mapMethodToAction(method: string): ActionType {
    switch (method) {
      case 'POST':
        return ActionType.CREATE;
      case 'PUT':
      case 'PATCH':
        return ActionType.UPDATE;
      case 'DELETE':
        return ActionType.DELETE;
      default:
        return ActionType.CUSTOM;
    }
  }

  private generateActionDescription(
    method: string,
    resourceType: string,
    url: string,
  ): string {
    const resource = resourceType.replace(/-/g, ' ');

    // Handle special endpoints
    if (url.includes('/approve')) return `Approved ${resource}`;
    if (url.includes('/reject')) return `Rejected ${resource}`;
    if (url.includes('/cancel')) return `Cancelled ${resource}`;
    if (url.includes('/restore')) return `Restored ${resource}`;
    if (url.includes('/complete')) return `Completed ${resource}`;
    if (url.includes('/activate')) return `Activated ${resource}`;
    if (url.includes('/deactivate')) return `Deactivated ${resource}`;
    if (url.includes('/upload')) return `Uploaded file to ${resource}`;

    switch (method) {
      case 'POST':
        return `Created new ${resource}`;
      case 'PUT':
        return `Replaced ${resource}`;
      case 'PATCH':
        return `Updated ${resource}`;
      case 'DELETE':
        return `Deleted ${resource}`;
      default:
        return `Modified ${resource}`;
    }
  }

  private sanitizeData(data: any): Record<string, any> | undefined {
    if (!data) return undefined;

    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
    ];
    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private async createAuditLog(logData: Partial<AuditLog>): Promise<void> {
    try {
      const auditLog = new this.auditLogModel(logData);
      await auditLog.save();
      this.logger.log(
        `Audit: ${logData.userEmail} ${logData.actionDescription} (${logData.method} ${logData.endpoint})`,
      );
    } catch (error) {
      this.logger.error(`Failed to save audit log: ${error.message}`);
    }
  }
}
