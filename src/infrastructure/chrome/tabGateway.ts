import { INTERNAL_PROTOCOL_PREFIXES } from '@/shared/constants/tabs';
import type { TabEntity } from '@/shared/types/models';
import { normalizeUrl } from '@/domain/tabs/normalizeUrl';
import { isLandingPageUrl } from '@/domain/tabs/groupTabs';

function isInternalUrl(url: string): boolean {
  return INTERNAL_PROTOCOL_PREFIXES.some((prefix) => url.startsWith(prefix));
}

export async function listOpenTabs(): Promise<TabEntity[]> {
  const tabs = await chrome.tabs.query({});
  return mapOpenTabs(tabs);
}

export async function listWindowTabs(windowId: number): Promise<TabEntity[]> {
  const tabs = await chrome.tabs.query({ windowId });
  return mapOpenTabs(tabs);
}

export async function focusTab(tabId: number, windowId: number): Promise<void> {
  await chrome.tabs.update(tabId, { active: true });
  await chrome.windows.update(windowId, { focused: true });
}

export async function openUrl(url: string): Promise<void> {
  await chrome.tabs.create({ url });
}

export async function closeTab(tabId: number): Promise<void> {
  await chrome.tabs.remove(tabId);
}

export async function closeTabs(tabIds: number[]): Promise<void> {
  if (tabIds.length === 0) return;
  await chrome.tabs.remove(tabIds);
}

function mapOpenTabs(tabs: chrome.tabs.Tab[]): TabEntity[] {
  return tabs
    .filter((tab): tab is chrome.tabs.Tab & { id: number; windowId: number; url: string } =>
      typeof tab.id === 'number' &&
      typeof tab.windowId === 'number' &&
      typeof tab.url === 'string' &&
      !isInternalUrl(tab.url),
    )
    .map((tab) => {
      const parsed = safeUrl(tab.url);
      return {
        id: tab.id,
        windowId: tab.windowId,
        title: tab.title || tab.url,
        url: tab.url,
        favIconUrl: tab.favIconUrl,
        active: Boolean(tab.active),
        hostname: parsed?.hostname || 'unknown',
        normalizedUrl: normalizeUrl(tab.url),
        isLandingPage: isLandingPageUrl(tab.url),
      } satisfies TabEntity;
    });
}

function safeUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}
