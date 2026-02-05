import { NextRequest } from 'next/server';
import { proxyRequest } from '../../../../_lib/proxy';
import { handleApiError } from '../../../../_lib/error-handler';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    return await proxyRequest('PATCH', '/kaeyros/companies', request, context, {
      backendPath: `/kaeyros/companies/${(await context.params).id}/status`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
