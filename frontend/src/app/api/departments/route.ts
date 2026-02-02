import { NextRequest } from 'next/server';
import { proxyRequest } from '../_lib/proxy';
import { handleApiError } from '../_lib/error-handler';

export async function GET(request: NextRequest) {
  try {
    return await proxyRequest('GET', '/departments', request);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    return await proxyRequest('POST', '/departments', request);
  } catch (error) {
    return handleApiError(error);
  }
}
