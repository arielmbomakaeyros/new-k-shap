import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip, headers } = request;

    // Store request metadata for potential audit logging
    request.auditMetadata = {
      method,
      url,
      userId: user?._id?.toString(),
      userEmail: user?.email,
      company: user?.company?.toString(),
      ipAddress: ip,
      userAgent: headers['user-agent'],
      timestamp: new Date(),
    };

    return next.handle().pipe(
      tap({
        next: () => {
          // Success - audit logging is handled in services for specific actions
        },
        error: () => {
          // Error - audit logging is handled in exception filters
        },
      }),
    );
  }
}
