import { NextRequest } from 'next/server';
import { proxyRequest } from '../../_lib/proxy';
import { handleApiError } from '../../_lib/error-handler';

export async function GET(request: NextRequest) {
  try {
    return await proxyRequest('GET', '/disbursements/export', request, undefined, {
      responseType: 'arraybuffer',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
