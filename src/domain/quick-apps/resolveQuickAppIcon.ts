import { DEFAULT_FAVICON } from '@/shared/constants/tabs';
import type { QuickApp } from '@/shared/types/models';

export function resolveQuickAppIcon(quickApp: Pick<QuickApp, 'url' | 'iconMode' | 'iconUrl'>): string {
  if (quickApp.iconMode === 'default') {
    return DEFAULT_FAVICON;
  }

  if (quickApp.iconUrl) {
    return quickApp.iconUrl;
  }

  try {
    const url = new URL(quickApp.url);
    return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
  } catch {
    return DEFAULT_FAVICON;
  }
}

export function createQuickAppFallbackIcon(urlValue: string): string {
  const letter = getQuickAppFallbackLetter(urlValue);
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="16" fill="#1a1613"/>
      <text x="50%" y="50%" dy="0.36em" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="700" fill="#f8f5f0">${letter}</text>
    </svg>
  `)}`;
}

function getQuickAppFallbackLetter(urlValue: string): string {
  try {
    const hostname = new URL(urlValue).hostname.replace(/^www\./, '');
    return hostname.charAt(0).toUpperCase() || 'P';
  } catch {
    return 'P';
  }
}
