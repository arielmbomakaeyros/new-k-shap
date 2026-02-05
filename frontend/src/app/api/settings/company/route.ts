import { NextRequest } from 'next/server';
import { proxyRequest } from '../../_lib/proxy';

export async function GET(request: NextRequest) {
  return proxyRequest('GET', '/settings/company', request);
}
