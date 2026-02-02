import { NextRequest } from 'next/server';
import { proxyRequest } from '../../_lib/proxy';
import { handleApiError } from '../../_lib/error-handler';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ key: string }> }
) {
  try {
    const params = await context.params;
    return await proxyRequest('GET', `/settings/${params.key}`, request);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ key: string }> }
) {
  try {
    const params = await context.params;
    return await proxyRequest('PUT', `/settings/${params.key}`, request);
  } catch (error) {
    return handleApiError(error);
  }
}
