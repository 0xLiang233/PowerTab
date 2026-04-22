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

export function getClosableDuplicateTabIds(tabs: TabEntity[]): number[] {
  const duplicateUrls = new Set(findDuplicateUrls(tabs));
  const keeperIds = new Set<number>();
  const grouped = new Map<string, TabEntity[]>();

  for (const tab of tabs) {
    if (!duplicateUrls.has(tab.normalizedUrl)) continue;
    const group = grouped.get(tab.normalizedUrl) ?? [];
    group.push(tab);
    grouped.set(tab.normalizedUrl, group);
  }

  for (const group of grouped.values()) {
    const keeper = group.find((tab) => tab.active) ?? group[0];
    if (keeper) {
      keeperIds.add(keeper.id);
    }
  }

  return tabs
    .filter((tab) => duplicateUrls.has(tab.normalizedUrl) && !keeperIds.has(tab.id))
    .map((tab) => tab.id);
}
