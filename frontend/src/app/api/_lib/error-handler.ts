import { NextResponse } from 'next/server';
import { AxiosError } from 'axios';

export interface ApiErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
  timestamp: string;
}

export class ApiError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode: number = 500,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

/**
 * Centralized error handler for API routes
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  // Handle ApiError instances
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        statusCode: error.statusCode,
        errors: error.errors,
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode }
    );
  }

  // Handle Axios errors from backend
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      message?: string;
      errors?: Record<string, string[]>;
      statusCode?: number;
    }>;

    const status = axiosError.response?.status || 500;
    const message =
      axiosError.response?.data?.message ||
      axiosError.message ||
      'An error occurred while communicating with the server';

    return NextResponse.json(
      {
        success: false,
        message,
        statusCode: status,
        errors: axiosError.response?.data?.errors,
        timestamp: new Date().toISOString(),
      },
      { status }
    );
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    const message =
      process.env.NODE_ENV === 'development'
        ? error.message
        : 'An unexpected error occurred';

    return NextResponse.json(
      {
        success: false,
        message,
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      success: false,
      message: 'An unexpected error occurred',
      statusCode: 500,
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}

/**
 * Type guard for Axios errors
 */
function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as { isAxiosError: boolean }).isAxiosError === true
  );
}

/**
 * Create standardized error responses
 */
export const ErrorResponses = {
  unauthorized: (message = 'Unauthorized') =>
    NextResponse.json(
      {
        success: false,
        message,
        statusCode: 401,
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    ),

  forbidden: (message = 'Forbidden') =>
    NextResponse.json(
      {
        success: false,
        message,
        statusCode: 403,
        timestamp: new Date().toISOString(),
      },
      { status: 403 }
    ),

  notFound: (message = 'Resource not found') =>
    NextResponse.json(
      {
        success: false,
        message,
        statusCode: 404,
        timestamp: new Date().toISOString(),
      },
      { status: 404 }
    ),

  badRequest: (message = 'Bad request', errors?: Record<string, string[]>) =>
    NextResponse.json(
      {
        success: false,
        message,
        statusCode: 400,
        errors,
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    ),

  conflict: (message = 'Resource already exists') =>
    NextResponse.json(
      {
        success: false,
        message,
        statusCode: 409,
        timestamp: new Date().toISOString(),
      },
      { status: 409 }
    ),

  unprocessableEntity: (
    message = 'Validation error',
    errors?: Record<string, string[]>
  ) =>
    NextResponse.json(
      {
        success: false,
        message,
        statusCode: 422,
        errors,
        timestamp: new Date().toISOString(),
      },
      { status: 422 }
    ),

  internalError: (message = 'Internal server error') =>
    NextResponse.json(
      {
        success: false,
        message,
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    ),
};

/**
 * Wrapper for API route handlers with error handling
 */
export function withErrorHandler<T>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | ApiErrorResponse>> {
  return handler().catch((error) => handleApiError(error));
}
