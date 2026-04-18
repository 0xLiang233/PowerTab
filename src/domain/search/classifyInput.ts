import type { InputClassification } from '@/shared/types/models';
import { ensureUrlProtocol, tryParseUrl } from '@/shared/utils/url';

export function classifyInput(raw: string): InputClassification {
  const normalized = raw.trim();
  const lower = normalized.toLowerCase();
  const parsed = tryParseUrl(normalized);

  return {
    raw,
    normalized,
    isEmpty: normalized.length === 0,
    isLikelyUrl: Boolean(parsed),
    isLikelyHostname: !parsed && looksLikeHostname(lower),
  };
}

export function resolveAddressBarUrl(raw: string): string | null {
  const normalized = raw.trim();
  if (!normalized) return null;

  const parsed = tryParseUrl(normalized);
  if (parsed) return parsed.toString();
  if (looksLikeHostname(normalized.toLowerCase())) {
    return ensureUrlProtocol(normalized);
  }
  return null;
}

function looksLikeHostname(value: string): boolean {
  return /^(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/.test(value) || /^[\w.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(value);
}
