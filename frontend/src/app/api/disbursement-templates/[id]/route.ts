import { NextRequest } from 'next/server';
import { proxyRequest } from '../../_lib/proxy';
import { handleApiError } from '../../_lib/error-handler';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    return await proxyRequest('GET', '/disbursement-templates', request, context);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    return await proxyRequest('PATCH', '/disbursement-templates', request, context);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    return await proxyRequest('DELETE', '/disbursement-templates', request, context);
  } catch (error) {
    return handleApiError(error);
  }
}
