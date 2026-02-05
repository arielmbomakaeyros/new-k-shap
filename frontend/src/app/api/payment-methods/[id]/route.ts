import { NextRequest } from 'next/server';
import { proxyRequest } from '../../_lib/proxy';
import { handleApiError } from '../../_lib/error-handler';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    return await proxyRequest('PATCH', `/payment-methods/${params.id}`, request);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    return await proxyRequest('DELETE', `/payment-methods/${params.id}`, request);
  } catch (error) {
    return handleApiError(error);
  }
}
