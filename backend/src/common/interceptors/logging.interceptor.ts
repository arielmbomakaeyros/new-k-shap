import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;
    const now = Date.now();

    const userInfo = user ? `[${user.email}]` : '[Anonymous]';

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const delay = Date.now() - now;
          this.logger.log(
            `${method} ${url} ${userInfo} - ${response.statusCode} ${delay}ms`,
          );
        },
        error: (error) => {
          const delay = Date.now() - now;
          this.logger.error(
            `${method} ${url} ${userInfo} - ${error.status || 500} ${delay}ms - ${error.message}`,
          );
        },
      }),
    );
  }
}
