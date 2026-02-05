import { NextRequest } from 'next/server';
import { proxyRequest } from '../../_lib/proxy';
import { handleApiError } from '../../_lib/error-handler';

export async function POST(request: NextRequest) {
  try {
    return await proxyRequest('POST', '/file-upload/upload-multiple', request);
  } catch (error) {
    return handleApiError(error);
  }
}
