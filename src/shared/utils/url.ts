export function ensureUrlProtocol(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (/^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(trimmed)) {
    return trimmed;
  }
  if (/^(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/.test(trimmed)) {
    return `http://${trimmed}`;
  }
  if (/^[\w.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export function tryParseUrl(value: string): URL | null {
  try {
    return new URL(ensureUrlProtocol(value));
  } catch {
    return null;
  }
}

export function getDisplayUrl(value: string): string {
  const parsed = tryParseUrl(value);
  if (!parsed) return value;

  const pathname = parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/$/, '');
  const search = parsed.search ? '…' : '';
  return `${parsed.hostname}${pathname}${search}`;
}
