import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError, AxiosRequestConfig, Method } from 'axios';

// Backend API URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api/v1';

export interface ProxyOptions {
  /** Override the default backend path */
  backendPath?: string;
  /** Transform the request body before sending */
  transformRequest?: (body: unknown) => unknown;
  /** Transform the response data before returning */
  transformResponse?: (data: unknown) => unknown;
  /** Additional headers to include */
  headers?: Record<string, string>;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Axios responseType override (useful for downloads) */
  responseType?: AxiosRequestConfig['responseType'];
}

export interface ProxyResult {
  success: boolean;
  data?: unknown;
  message?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Create a proxy handler for Next.js API routes
 */
export function createProxyHandler(basePath: string, options: ProxyOptions = {}) {
  return {
    GET: (request: NextRequest, context?: { params?: Promise<{ id?: string }> }) =>
      proxyRequest('GET', basePath, request, context, options),
    POST: (request: NextRequest, context?: { params?: Promise<{ id?: string }> }) =>
      proxyRequest('POST', basePath, request, context, options),
    PUT: (request: NextRequest, context?: { params?: Promise<{ id?: string }> }) =>
      proxyRequest('PUT', basePath, request, context, options),
    PATCH: (request: NextRequest, context?: { params?: Promise<{ id?: string }> }) =>
      proxyRequest('PATCH', basePath, request, context, options),
    DELETE: (request: NextRequest, context?: { params?: Promise<{ id?: string }> }) =>
      proxyRequest('DELETE', basePath, request, context, options),
  };
}

/**
 * Proxy a single request to the backend
 */
export async function proxyRequest(
  method: Method,
  basePath: string,
  request: NextRequest,
  context?: { params?: Promise<{ id?: string }> },
  options: ProxyOptions = {}
): Promise<NextResponse> {
  try {
    // Get ID from dynamic route params
    const params = context?.params ? await context.params : undefined;
    const id = params?.id;

    // Build backend URL
    let backendUrl = options.backendPath || basePath;
    if (id && !options.backendPath) {
      backendUrl = `${backendUrl}/${id}`;
    }

    // Forward query parameters
    const url = new URL(request.url);
    const queryString = url.searchParams.toString();
    if (queryString) {
      backendUrl = `${backendUrl}?${queryString}`;
    }

    // Get authorization + cookie headers
    const authHeader = request.headers.get('authorization');
    let cookieHeader = request.headers.get('cookie');
    if (!cookieHeader && request.cookies) {
      const cookies = request.cookies.getAll();
      if (cookies.length) {
        cookieHeader = cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ');
      }
    }

    // Parse request body for non-GET requests
    let body: unknown = undefined;
    if (method !== 'GET' && method !== 'DELETE') {
      const contentType = request.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        body = await request.json();
        if (options.transformRequest) {
          body = options.transformRequest(body);
        }
      } else if (contentType?.includes('multipart/form-data')) {
        // For file uploads, forward the form data
        body = await request.formData();
      }
    }

    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

    // Build axios config
    const headers: Record<string, string> = {
      ...(authHeader && { Authorization: authHeader }),
      ...(cookieHeader && { Cookie: cookieHeader }),
      ...options.headers,
    };

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    if (isFormData) {
      const fetchHeaders = new Headers();
      if (authHeader) {
        fetchHeaders.set('Authorization', authHeader);
      }
      if (cookieHeader) {
        fetchHeaders.set('Cookie', cookieHeader);
      }
      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          fetchHeaders.set(key, value);
        });
      }

      const fetchResponse = await fetch(`${BACKEND_URL}${backendUrl}`, {
        method,
        headers: fetchHeaders,
        body: body as FormData,
      });

      const responseContentType = fetchResponse.headers.get('content-type') || '';
      const isJsonResponse = responseContentType.includes('application/json');

      if (!isJsonResponse || options.responseType === 'arraybuffer' || options.responseType === 'stream') {
        const buffer = await fetchResponse.arrayBuffer();
        const responseHeaders = new Headers();
        if (responseContentType) {
          responseHeaders.set('Content-Type', responseContentType);
        }
        const disposition = fetchResponse.headers.get('content-disposition');
        if (disposition) {
          responseHeaders.set('Content-Disposition', disposition);
        }

      const binaryResponse = new NextResponse(buffer, {
        status: fetchResponse.status,
        headers: responseHeaders,
      });
      const setCookie = fetchResponse.headers.get('set-cookie');
      if (setCookie) {
        binaryResponse.headers.set('set-cookie', setCookie);
      }
      return binaryResponse;
      }

      let responseData = await fetchResponse.json();
      if (options.transformResponse) {
        responseData = options.transformResponse(responseData);
      }

      const jsonResponse = NextResponse.json(responseData, { status: fetchResponse.status });
      const setCookie = fetchResponse.headers.get('set-cookie');
      if (setCookie) {
        jsonResponse.headers.set('set-cookie', setCookie);
      }
      return jsonResponse;
    }

    const config: AxiosRequestConfig = {
      method,
      url: `${BACKEND_URL}${backendUrl}`,
      timeout: options.timeout || 30000,
      headers,
      responseType: options.responseType,
    };

    if (body !== undefined) {
      // Attach body as data for non-GET requests; Axios accepts various body types (JSON, FormData, etc.)
      config.data = body as AxiosRequestConfig['data'];
    }

    // Make request to backend
    const response = await axios(config);

    const contentType = response.headers?.['content-type'] || '';
    const isJson = contentType.includes('application/json');
    const isBinary = options.responseType === 'arraybuffer' || options.responseType === 'stream' || !isJson;

    if (isBinary) {
      const responseHeaders = new Headers();
      if (contentType) {
        responseHeaders.set('Content-Type', contentType);
      }
      const disposition = response.headers?.['content-disposition'];
      if (disposition) {
        responseHeaders.set('Content-Disposition', disposition);
      }

      const binaryResponse = new NextResponse(response.data, {
        status: response.status,
        headers: responseHeaders,
      });
      const setCookie = response.headers?.['set-cookie'];
      if (setCookie) {
        if (Array.isArray(setCookie)) {
          setCookie.forEach((cookie) => binaryResponse.headers.append('set-cookie', cookie));
        } else {
          binaryResponse.headers.set('set-cookie', setCookie);
        }
      }
      return binaryResponse;
    }

    // Transform response if needed
    let responseData = response.data;
    if (options.transformResponse) {
      responseData = options.transformResponse(responseData);
    }

    const jsonResponse = NextResponse.json(responseData, { status: response.status });
    const setCookie = response.headers?.['set-cookie'];
    if (setCookie) {
      if (Array.isArray(setCookie)) {
        setCookie.forEach((cookie) => jsonResponse.headers.append('set-cookie', cookie));
      } else {
        jsonResponse.headers.set('set-cookie', setCookie);
      }
    }
    return jsonResponse;
  } catch (error) {
    return handleProxyError(error);
  }
}

/**
 * Handle errors from the proxy request
 */
export function handleProxyError(error: unknown): NextResponse {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      message?: string;
      errors?: Record<string, string[]>;
    }>;

    const status = axiosError.response?.status || 500;
    const message =
      axiosError.response?.data?.message ||
      axiosError.message ||
      'Internal server error';
    const errors = axiosError.response?.data?.errors;

    return NextResponse.json(
      {
        success: false,
        message,
        ...(errors && { errors }),
      },
      { status }
    );
  }

  // Unknown error
  return NextResponse.json(
    {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    },
    { status: 500 }
  );
}

/**
 * Helper to create standard API response
 */
export function createApiResponse<T>(
  data: T,
  status: number = 200,
  message?: string
): NextResponse {
  return NextResponse.json(
    {
      success: status >= 200 && status < 300,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

/**
 * Helper to create error response
 */
export function createErrorResponse(
  message: string,
  status: number = 400,
  errors?: Record<string, string[]>
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
      ...(errors && { errors }),
    },
    { status }
  );
}
