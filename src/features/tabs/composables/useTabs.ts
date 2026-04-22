import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { PowerTabDuplicateSummary, TabEntity, TabGroup } from '@/shared/types/models';
import {
  closeDuplicatePowerTabs,
  closeDuplicateTabsForGroup,
  closeGroupTabs,
  closeSingleTab,
  focusOpenTab,
  getOpenTabs,
  getPowerTabDuplicateSummary,
  getTabGroups,
} from '@/features/tabs/services/tabsService';

export function useTabs() {
  const tabGroups = ref<TabGroup[]>([]);
  const openTabs = ref<TabEntity[]>([]);
  const powerTabDuplicateSummary = ref<PowerTabDuplicateSummary>({ tabs: [], closableCount: 0 });
  const isLoading = ref(false);
  const groupOrder = ref<string[]>([]);

  async function refresh() {
    isLoading.value = true;
    const [groups, tabs, powerTabSummary] = await Promise.all([
      getTabGroups(),
      getOpenTabs(),
      getPowerTabDuplicateSummary(),
    ]);
    tabGroups.value = stabilizeGroupOrder(groups, groupOrder.value);
    groupOrder.value = tabGroups.value.map((group) => group.id);
    openTabs.value = tabs;
    powerTabDuplicateSummary.value = powerTabSummary;
    isLoading.value = false;
  }

  async function focus(tab: TabEntity) {
    await focusOpenTab(tab);
  }

  async function closeOne(tabId: number) {
    await closeSingleTab(tabId);
    await refresh();
  }

  async function closeGroup(group: TabGroup) {
    await closeGroupTabs(group);
    await refresh();
  }

  async function closeDuplicates(group: TabGroup) {
    await closeDuplicateTabsForGroup(group);
    await refresh();
  }

  async function closePowerTabDuplicates() {
    await closeDuplicatePowerTabs();
    await refresh();
  }

  const listener = () => {
    void refresh();
  };

  onMounted(() => {
    void refresh();
    chrome.tabs.onCreated.addListener(listener);
    chrome.tabs.onRemoved.addListener(listener);
    chrome.tabs.onUpdated.addListener(listener);
  });

  onUnmounted(() => {
    chrome.tabs.onCreated.removeListener(listener);
    chrome.tabs.onRemoved.removeListener(listener);
    chrome.tabs.onUpdated.removeListener(listener);
  });

  return {
    tabGroups,
    openTabs,
    powerTabDuplicateSummary: computed(() => powerTabDuplicateSummary.value),
    isLoading: computed(() => isLoading.value),
    refresh,
    focus,
    closeOne,
    closeGroup,
    closeDuplicates,
    closePowerTabDuplicates,
  };
}

function stabilizeGroupOrder(groups: TabGroup[], previousOrder: string[]): TabGroup[] {
  if (previousOrder.length === 0) return groups;

  const byId = new Map(groups.map((group) => [group.id, group]));
  const ordered: TabGroup[] = [];

  for (const id of previousOrder) {
    const group = byId.get(id);
    if (!group) continue;
    ordered.push(group);
    byId.delete(id);
  }

  const remaining = [...byId.values()];
  const homepages = remaining.filter((group) => group.id === '__landing-pages__');
  const others = remaining.filter((group) => group.id !== '__landing-pages__');

  if (!ordered.some((group) => group.id === '__landing-pages__')) {
    ordered.unshift(...homepages);
  } else {
    ordered.push(...homepages);
  }

  ordered.push(...others);
  return ordered;
}
