import { NextRequest } from 'next/server';
import { proxyRequest } from '../../../_lib/proxy';

export async function PATCH(request: NextRequest) {
  return proxyRequest('PATCH', '/settings/company/notifications', request);
}
