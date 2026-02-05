import { NextRequest } from 'next/server';
import { proxyRequest } from '../../../../_lib/proxy';
import { handleApiError } from '../../../../_lib/error-handler';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    return await proxyRequest('POST', `/kaeyros/companies/${params.id}/seed-payment-methods`, request);
  } catch (error) {
    return handleApiError(error);
  }
}
