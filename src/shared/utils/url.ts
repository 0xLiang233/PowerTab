import {
  LOCAL_NETWORK_HOSTNAMES,
  LOCAL_NETWORK_IPV4_PATTERNS,
  LOCAL_NETWORK_IPV6_PATTERNS,
} from '@/shared/constants/tabs';

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

export function isLocalNetworkUrl(value: string): boolean {
  const parsed = tryParseUrl(value);
  if (!parsed) return false;
  return isLocalNetworkHostname(parsed.hostname);
}

export function sanitizeFaviconUrl(value: string | undefined): string | undefined {
  if (!value || isLocalNetworkUrl(value)) {
    return undefined;
  }
  return value;
}

export function isLocalNetworkHostname(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase();
  if (!normalized) return false;
  return (
    LOCAL_NETWORK_HOSTNAMES.includes(normalized) ||
    isPrivateIpv4Address(normalized) ||
    isPrivateIpv6Address(normalized)
  );
}

function isPrivateIpv4Address(hostname: string): boolean {
  return LOCAL_NETWORK_IPV4_PATTERNS.some((pattern) => pattern.test(hostname));
}

function isPrivateIpv6Address(hostname: string): boolean {
  const normalized = hostname.replace(/^\[|\]$/g, '');
  return LOCAL_NETWORK_IPV6_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function getDisplayUrl(value: string): string {
  const parsed = tryParseUrl(value);
  if (!parsed) return value;

  const pathname = parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/$/, '');
  const search = parsed.search ? '…' : '';
  return `${parsed.hostname}${pathname}${search}`;
}

export function getHostnameInitial(hostname: string): string {
  const normalized = hostname.trim().replace(/^www\./i, '');
  const alphanumeric = normalized.match(/[A-Za-z0-9]/)?.[0];
  if (alphanumeric) {
    return alphanumeric.toUpperCase();
  }

  const firstChar = normalized.charAt(0);
  return firstChar ? firstChar.toUpperCase() : '•';
}
