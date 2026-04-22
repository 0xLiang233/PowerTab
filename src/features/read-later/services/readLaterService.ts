import { createId } from '@/shared/utils/id';
import { loadReadLater, saveReadLater } from '@/infrastructure/chrome/storage';
import { listOpenTabs, focusTab, openUrl } from '@/infrastructure/chrome/tabGateway';
import { sanitizeFaviconUrl } from '@/shared/utils/url';
import type { ReadLaterItem, TabEntity } from '@/shared/types/models';

export async function listReadLaterItems(): Promise<ReadLaterItem[]> {
  const items = await loadReadLater();
  return items.slice().sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
}

export async function saveTabForLater(tab: TabEntity): Promise<ReadLaterItem> {
  const items = await listReadLaterItems();
  const existing = items.find((item) => item.normalizedUrl === tab.normalizedUrl);
  const now = new Date().toISOString();

  if (existing) {
    const nextItem: ReadLaterItem = {
      ...existing,
      title: tab.title,
      url: tab.url,
      hostname: tab.hostname,
      favIconUrl: sanitizeFaviconUrl(tab.favIconUrl),
      updatedAt: now,
    };

    const next = items.map((item) => (item.id === existing.id ? nextItem : item));
    await saveReadLater(next);
    return nextItem;
  }

  const nextItem: ReadLaterItem = {
    id: createId('read-later'),
    title: tab.title,
    url: tab.url,
    hostname: tab.hostname,
    normalizedUrl: tab.normalizedUrl,
    favIconUrl: sanitizeFaviconUrl(tab.favIconUrl),
    createdAt: now,
    updatedAt: now,
  };

  await saveReadLater([nextItem, ...items]);
  return nextItem;
}

export async function removeReadLaterItem(id: string): Promise<void> {
  const items = await listReadLaterItems();
  await saveReadLater(items.filter((item) => item.id !== id));
}

export async function openReadLaterItem(item: ReadLaterItem): Promise<void> {
  const openTabs = await listOpenTabs();
  const existing = openTabs.find((tab) => tab.normalizedUrl === item.normalizedUrl);
  if (existing) {
    await focusTab(existing.id, existing.windowId);
    return;
  }

  await openUrl(item.url);
}
