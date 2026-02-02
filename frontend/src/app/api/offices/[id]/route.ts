import { NextRequest } from 'next/server';
import { proxyRequest } from '../../_lib/proxy';
import { handleApiError } from '../../_lib/error-handler';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    return await proxyRequest('GET', '/offices', request, context);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    return await proxyRequest('PUT', '/offices', request, context);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    return await proxyRequest('PATCH', '/offices', request, context);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    return await proxyRequest('DELETE', '/offices', request, context);
  } catch (error) {
    return handleApiError(error);
  }
}
