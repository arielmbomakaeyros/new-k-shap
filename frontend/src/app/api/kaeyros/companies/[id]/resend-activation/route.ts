import { NextRequest, NextResponse } from 'next/server';
import { proxyRequest } from '@/src/app/api/_lib/proxy';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  if (!params?.id || params.id === 'undefined' || params.id === 'null') {
    return NextResponse.json(
      { success: false, message: 'Company id is required.' },
      { status: 400 }
    );
  }
  return await proxyRequest('POST', `/kaeyros/companies/${params.id}/resend-activation`, request);
}
