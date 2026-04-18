import { closeTab, closeTabs, focusTab, listOpenTabs, listWindowTabs } from '@/infrastructure/chrome/tabGateway';
import { groupTabs } from '@/domain/tabs/groupTabs';
import { findDuplicateUrls } from '@/domain/tabs/findDuplicates';
import type { TabEntity, TabGroup } from '@/shared/types/models';

export async function getTabGroups(): Promise<TabGroup[]> {
  const tabs = await listOpenTabs();
  return groupTabs(tabs);
}

export async function getOpenTabs(): Promise<TabEntity[]> {
  return listOpenTabs();
}

export async function getWindowTabs(windowId: number): Promise<TabEntity[]> {
  return listWindowTabs(windowId);
}

export async function focusOpenTab(tab: TabEntity): Promise<void> {
  await focusTab(tab.id, tab.windowId);
}

export async function closeSingleTab(tabId: number): Promise<void> {
  await closeTab(tabId);
}

export async function closeGroupTabs(group: TabGroup): Promise<void> {
  await closeTabs(group.tabs.map((tab) => tab.id));
}

export async function closeDuplicateTabsForGroup(group: TabGroup): Promise<void> {
  const duplicateUrls = new Set(findDuplicateUrls(group.tabs));
  const kept = new Set<string>();
  const toClose: number[] = [];

  for (const tab of group.tabs) {
    if (!duplicateUrls.has(tab.normalizedUrl)) continue;
    if (!kept.has(tab.normalizedUrl)) {
      kept.add(tab.normalizedUrl);
      continue;
    }
    if (!tab.active) {
      toClose.push(tab.id);
    }
  }

  await closeTabs(toClose);
}
