import { NextRequest } from 'next/server';
import { proxyRequest } from '../../../../_lib/proxy';
import { handleApiError } from '../../../../_lib/error-handler';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    return await proxyRequest('PATCH', `/settings/workflow-templates/${params.id}/activate`, request);
  } catch (error) {
    return handleApiError(error);
  }
}
