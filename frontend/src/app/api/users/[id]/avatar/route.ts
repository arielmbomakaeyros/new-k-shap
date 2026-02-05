import { NextRequest } from 'next/server';
import { proxyRequest } from '../../../_lib/proxy';
import { handleApiError } from '../../../_lib/error-handler';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    return await proxyRequest('POST', '/users', request, context, { backendPath: `/users/${(await context.params).id}/avatar` });
  } catch (error) {
    return handleApiError(error);
  }
}
