export type Language = 'fr' | 'en';

export const DEFAULT_LANGUAGE: Language = 'fr';

export function normalizeLanguage(value?: string): Language | undefined {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  if (normalized.startsWith('fr')) return 'fr';
  if (normalized.startsWith('en')) return 'en';
  return undefined;
}

export function resolveLanguage(params: {
  user?: { preferredLanguage?: string; company?: any } | null;
  company?: { defaultLanguage?: string } | null;
  header?: string | string[] | undefined;
}): Language {
  const headerValue = Array.isArray(params.header)
    ? params.header[0]
    : params.header;

  const headerLang = normalizeLanguage(headerValue?.split(',')[0]);

  const userLang = normalizeLanguage(params.user?.preferredLanguage);
  const companyLang = normalizeLanguage(
    params.company?.defaultLanguage ||
      (params.user as any)?.company?.defaultLanguage,
  );

  return userLang || companyLang || headerLang || DEFAULT_LANGUAGE;
}
