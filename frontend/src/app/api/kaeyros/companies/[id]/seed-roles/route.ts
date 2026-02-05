import { handleApiError } from '@/src/app/api/_lib/error-handler';
import { proxyRequest } from '@/src/app/api/_lib/proxy';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    return await proxyRequest('POST', `/kaeyros/companies/${params.id}/seed-roles`, request);
  } catch (error) {
    return handleApiError(error);
  }
}
