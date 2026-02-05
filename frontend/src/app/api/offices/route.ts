import { NextRequest } from 'next/server';
import { proxyRequest } from '../_lib/proxy';
import { handleApiError } from '../_lib/error-handler';

type OfficeLike = Record<string, unknown>;

function mapLocationToCityCountry(location?: string) {
  if (!location) return { city: undefined, country: undefined };
  const [rawCity, ...rest] = location.split(',');
  const city = rawCity?.trim() || undefined;
  const country = rest.join(',').trim() || undefined;
  return { city, country };
}

function normalizeOffice(office: OfficeLike) {
  if (!office || typeof office !== 'object') return office;
  const city = (office.city as string | undefined) || undefined;
  const country = (office.country as string | undefined) || undefined;
  let location = (office.location as string | undefined) || undefined;

  if (!location) {
    if (city && country) {
      location = `${city}, ${country}`;
    } else {
      location = city || country;
    }
  }

  return {
    ...office,
    city,
    country,
    ...(location ? { location } : {}),
  };
}

function normalizeOfficesResponse(data: unknown) {
  if (!data || typeof data !== 'object') return data;

  const root = data as Record<string, unknown>;
  const dataNode = root.data;

  if (Array.isArray(dataNode)) {
    return { ...root, data: dataNode.map((office) => normalizeOffice(office as OfficeLike)) };
  }

  if (dataNode && typeof dataNode === 'object' && Array.isArray((dataNode as any).data)) {
    const inner = dataNode as { data: OfficeLike[] };
    return { ...root, data: { ...dataNode, data: inner.data.map((office) => normalizeOffice(office)) } };
  }

  if (dataNode && typeof dataNode === 'object') {
    return { ...root, data: normalizeOffice(dataNode as OfficeLike) };
  }

  return data;
}

function normalizeOfficesRequest(body: unknown) {
  if (!body || typeof body !== 'object') return body;
  const payload = body as Record<string, unknown>;
  const location = payload.location as string | undefined;
  const city = (payload.city as string | undefined) || mapLocationToCityCountry(location).city;
  const country = (payload.country as string | undefined) || mapLocationToCityCountry(location).country;

  const { location: _location, ...rest } = payload;

  return {
    ...rest,
    ...(city ? { city } : {}),
    ...(country ? { country } : {}),
  };
}

export async function GET(request: NextRequest) {
  try {
    return await proxyRequest('GET', '/offices', request, undefined, {
      transformResponse: normalizeOfficesResponse,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    return await proxyRequest('POST', '/offices', request, undefined, {
      transformRequest: normalizeOfficesRequest,
      transformResponse: normalizeOfficesResponse,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
