import {
  closeTab,
  closeTabs,
  focusTab,
  listOpenTabs,
  listPowerTabTabs,
  listWindowTabs,
} from '@/infrastructure/chrome/tabGateway';
import { groupTabs } from '@/domain/tabs/groupTabs';
import { getClosableDuplicateTabIds } from '@/domain/tabs/findDuplicates';
import type { PowerTabDuplicateSummary, TabEntity, TabGroup } from '@/shared/types/models';

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

export async function getPowerTabDuplicateSummary(): Promise<PowerTabDuplicateSummary> {
  const tabs = await listPowerTabTabs();
  return {
    tabs,
    closableCount: getClosableDuplicateTabIds(tabs).length,
  };
}

export async function closeDuplicateTabsForGroup(group: TabGroup): Promise<void> {
  await closeTabs(getClosableDuplicateTabIds(group.tabs));
}

export async function closeDuplicatePowerTabs(): Promise<void> {
  const tabs = await listPowerTabTabs();
  await closeTabs(getClosableDuplicateTabIds(tabs));
}
