import { NextRequest } from 'next/server';
import { proxyRequest } from '../_lib/proxy';
import { handleApiError } from '../_lib/error-handler';

export async function GET(request: NextRequest) {
  try {
    return await proxyRequest('GET', '/settings', request);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    return await proxyRequest('PUT', '/settings', request);
  } catch (error) {
    return handleApiError(error);
  }
}
