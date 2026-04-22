import { INTERNAL_PROTOCOL_PREFIXES } from '@/shared/constants/tabs';
import type { TabEntity } from '@/shared/types/models';
import { normalizeUrl } from '@/domain/tabs/normalizeUrl';
import { isLandingPageUrl } from '@/domain/tabs/groupTabs';
import { sanitizeFaviconUrl } from '@/shared/utils/url';

const POWER_TAB_URL = chrome.runtime.getURL('newtab.html');
const BROWSER_NEWTAB_URLS = new Set(['chrome://newtab', 'edge://newtab']);

type MappableChromeTab = chrome.tabs.Tab & { id: number; windowId: number };

function isInternalUrl(url: string): boolean {
  return INTERNAL_PROTOCOL_PREFIXES.some((prefix) => url.startsWith(prefix));
}

export async function listOpenTabs(): Promise<TabEntity[]> {
  const tabs = await chrome.tabs.query({});
  return mapOpenTabs(tabs);
}

export async function listWindowTabs(windowId: number): Promise<TabEntity[]> {
  const tabs = await chrome.tabs.query({ windowId });
  return mapQuickSwitcherTabs(tabs);
}

export async function listPowerTabTabs(): Promise<TabEntity[]> {
  const tabs = await chrome.tabs.query({});
  return mapPowerTabTabs(tabs);
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
    .filter((tab): tab is MappableChromeTab => typeof tab.id === 'number' && typeof tab.windowId === 'number')
    .map((tab) => ({ tab, tabUrl: getTabUrl(tab) }))
    .filter(hasTabUrl)
    .filter(({ tabUrl }) => !isInternalUrl(tabUrl))
    .map(({ tab, tabUrl }) => mapTabEntity(tab, tabUrl));
}

function mapQuickSwitcherTabs(tabs: chrome.tabs.Tab[]): TabEntity[] {
  return tabs
    .filter((tab): tab is MappableChromeTab => typeof tab.id === 'number' && typeof tab.windowId === 'number')
    .map((tab) => ({ tab, tabUrl: getTabUrl(tab) }))
    .filter(hasTabUrl)
    .filter(({ tab, tabUrl }) => !isInternalUrl(tabUrl) || isPowerTabTab(tab, tabUrl))
    .map(({ tab, tabUrl }) => {
      if (isPowerTabTab(tab, tabUrl)) {
        return mapTabEntity(tab, tabUrl, POWER_TAB_URL);
      }
      return mapTabEntity(tab, tabUrl);
    });
}

function mapPowerTabTabs(tabs: chrome.tabs.Tab[]): TabEntity[] {
  return tabs
    .filter((tab): tab is MappableChromeTab => typeof tab.id === 'number' && typeof tab.windowId === 'number')
    .map((tab) => ({ tab, tabUrl: getTabUrl(tab) }))
    .filter(hasTabUrl)
    .filter(({ tab, tabUrl }) => isPowerTabTab(tab, tabUrl))
    .map(({ tab, tabUrl }) => mapTabEntity(tab, tabUrl, POWER_TAB_URL));
}

function hasTabUrl(entry: { tab: MappableChromeTab; tabUrl: string | null }): entry is { tab: MappableChromeTab; tabUrl: string } {
  return typeof entry.tabUrl === 'string';
}

function mapTabEntity(tab: MappableChromeTab, tabUrl: string, normalizedUrl = normalizeUrl(tabUrl)): TabEntity {
  const parsed = safeUrl(tabUrl);
  return {
    id: tab.id,
    windowId: tab.windowId,
    title: tab.title || tabUrl,
    url: tabUrl,
    favIconUrl: sanitizeFaviconUrl(tab.favIconUrl),
    active: Boolean(tab.active),
    hostname: parsed?.hostname || 'unknown',
    normalizedUrl,
    isLandingPage: isLandingPageUrl(tabUrl),
  } satisfies TabEntity;
}

function getTabUrl(tab: MappableChromeTab): string | null {
  if (typeof tab.url === 'string') return tab.url;
  if (typeof tab.pendingUrl === 'string') return tab.pendingUrl;
  return null;
}

function isPowerTabTab(_tab: MappableChromeTab, tabUrl: string): boolean {
  return isPowerTabUrl(tabUrl) || isBrowserNewTabUrl(tabUrl);
}

function isBrowserNewTabUrl(value: string): boolean {
  return BROWSER_NEWTAB_URLS.has(normalizeBrowserNewTabUrl(value));
}

function normalizeBrowserNewTabUrl(value: string): string {
  return value.replace(/\/+$/u, '');
}

function isPowerTabUrl(value: string): boolean {
  const url = safeUrl(value);
  const powerTabUrl = safeUrl(POWER_TAB_URL);
  if (!url || !powerTabUrl) return false;
  return (
    url.protocol === powerTabUrl.protocol &&
    url.host === powerTabUrl.host &&
    url.pathname === powerTabUrl.pathname
  );
}

function safeUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}
