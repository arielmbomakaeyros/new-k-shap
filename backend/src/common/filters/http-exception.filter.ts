import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string | string[];
    let error: string;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
      error = 'Error';
    } else if (typeof exceptionResponse === 'object') {
      const responseObj = exceptionResponse as any;
      message = responseObj.message || exception.message;
      error = responseObj.error || 'Error';
    } else {
      message = exception.message;
      error = 'Error';
    }

    const errorResponse = {
      success: false,
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.warn(
      `${request.method} ${request.url} - ${status} - ${JSON.stringify(message)}`,
    );

    response.status(status).json(errorResponse);
  }
}
