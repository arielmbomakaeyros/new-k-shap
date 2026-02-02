import { NextRequest } from 'next/server';
import { proxyRequest } from '../../../_lib/proxy';
import { handleApiError } from '../../../_lib/error-handler';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    return await proxyRequest('POST', `/users/${params.id}/resend-activation`, request);
  } catch (error) {
    return handleApiError(error);
  }
}
