import { NextRequest } from 'next/server';
import { proxyRequest } from '../../../_lib/proxy';
import { handleApiError } from '../../../_lib/error-handler';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    return await proxyRequest('GET', `/exports/${params.id}/download`, request, undefined, { responseType: 'arraybuffer' });
  } catch (error) {
    return handleApiError(error);
  }
}
