import { NextRequest, NextResponse } from 'next/server';
import { proxyRequest } from '../../_lib/proxy';
import { handleApiError } from '../../_lib/error-handler';

export async function POST(request: NextRequest) {
  try {
    return await proxyRequest('POST', '/auth/forgot-password', request);
  } catch (error) {
    return handleApiError(error);
  }
}
