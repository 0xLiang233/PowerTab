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
