import { NextRequest } from 'next/server';
import { proxyRequest } from '../../../_lib/proxy';
import { handleApiError } from '../../../_lib/error-handler';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    return await proxyRequest('DELETE', `/settings/workflow-templates/${params.id}`, request);
  } catch (error) {
    return handleApiError(error);
  }
}
