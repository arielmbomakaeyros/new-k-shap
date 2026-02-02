import { NextRequest } from 'next/server';
import { proxyRequest } from '../../_lib/proxy';
import { handleApiError } from '../../_lib/error-handler';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    return await proxyRequest('GET', '/beneficiaries', request, context);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    return await proxyRequest('PUT', '/beneficiaries', request, context);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    return await proxyRequest('PATCH', '/beneficiaries', request, context);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    return await proxyRequest('DELETE', '/beneficiaries', request, context);
  } catch (error) {
    return handleApiError(error);
  }
}
