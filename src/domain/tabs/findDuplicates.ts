import type { TabEntity } from '@/shared/types/models';

export function findDuplicateUrls(tabs: TabEntity[]): string[] {
  const counts = new Map<string, number>();
  for (const tab of tabs) {
    counts.set(tab.normalizedUrl, (counts.get(tab.normalizedUrl) ?? 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([url]) => url);
}
