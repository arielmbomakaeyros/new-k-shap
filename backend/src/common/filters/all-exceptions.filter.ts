import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request, Response } from 'express';
import { createHash } from 'crypto';
import { ErrorLog } from '../../database/schemas/error-log.schema';
import { resolveLanguage } from '../i18n/language';
import { translateValidationMessages } from '../i18n/validation';

@Injectable()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(
    @InjectModel(ErrorLog.name) private errorLogModel: Model<ErrorLog>,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const language = resolveLanguage({
      user: (request as any)?.user,
      header: request.headers['accept-language'],
    });

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';
    let errors: string[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        error = responseObj.error || 'Error';

        if (status === HttpStatus.BAD_REQUEST && Array.isArray(responseObj.message)) {
          const translatedMessages = translateValidationMessages(
            responseObj.message,
            language,
          );
          errors = translatedMessages;
          message = translatedMessages.join('; ');
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;

      // Log unexpected errors
      this.logger.error(
        `Unexpected error: ${exception.message}`,
        exception.stack,
      );
    }

    // Persist 500 errors to DB
    if (status >= 500) {
      this.persistErrorLog(exception, request, status, message).catch((err) => {
        this.logger.error(`Failed to persist error log: ${err.message}`);
      });
    }

    const errorResponse = {
      success: false,
      statusCode: status,
      error,
      message,
      ...(errors ? { errors } : {}),
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // Log error details
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
    );

    response.status(status).json(errorResponse);
  }

  private async persistErrorLog(
    exception: unknown,
    request: Request,
    status: number,
    message: string,
  ) {
    try {
      const stack = exception instanceof Error ? exception.stack || '' : '';
      const errorType = exception instanceof Error ? exception.constructor.name : 'UnknownError';

      // Compute error hash for deduplication
      const hashInput = `${errorType}:${message}:${request.url}:${request.method}`;
      const errorHash = createHash('md5').update(hashInput).digest('hex');

      // Upsert: increment count if same hash exists, otherwise create new
      const existing = await this.errorLogModel.findOne({ errorHash, isResolved: false });

      if (existing) {
        existing.occurrenceCount += 1;
        existing.timestamp = new Date();
        await existing.save();
      } else {
        const user = (request as any)?.user;
        const severity = status >= 500 ? 'high' : 'medium';

        await this.errorLogModel.create({
          company: user?.company?._id || user?.company || null,
          user: user?.sub || user?._id || null,
          errorType,
          message,
          stackTrace: stack,
          endpoint: request.url,
          method: request.method,
          requestBody: this.sanitizeBody(request.body),
          requestParams: request.params || {},
          environment: process.env.NODE_ENV || 'development',
          nodeVersion: process.version,
          severity,
          errorHash,
          occurrenceCount: 1,
        });
      }
    } catch (err) {
      // Prevent infinite loops - if error logging fails, just log to console
      this.logger.error(`Error logging to DB failed: ${err.message}`);
    }
  }

  private sanitizeBody(body: any): Record<string, any> {
    if (!body || typeof body !== 'object') return {};
    const sanitized = { ...body };
    // Remove sensitive fields
    delete sanitized.password;
    delete sanitized.refreshToken;
    delete sanitized.token;
    delete sanitized.secret;
    return sanitized;
  }
}
