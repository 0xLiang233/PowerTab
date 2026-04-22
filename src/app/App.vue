<script setup lang="ts">
import { ref } from 'vue';
import MainShell from '@/components/layout/MainShell.vue';
import QuickAppsSection from '@/components/quick-apps/QuickAppsSection.vue';
import SearchSection from '@/components/search/SearchSection.vue';
import SettingsModal from '@/components/settings/SettingsModal.vue';
import TabsSection from '@/components/tabs/TabsSection.vue';
import { useQuickApps } from '@/features/quick-apps/composables/useQuickApps';
import { useSearch } from '@/features/search/composables/useSearch';
import { useSettings } from '@/features/settings/services/useSettings';
import { useTabs } from '@/features/tabs/composables/useTabs';
import { openUrl } from '@/infrastructure/chrome/tabGateway';
import type { QuickApp, TabEntity, TabGroup } from '@/shared/types/models';

const quickAppsState = useQuickApps();
const settingsState = useSettings();
const tabsState = useTabs();
const searchState = useSearch({
  quickApps: quickAppsState.quickApps,
  engine: settingsState.defaultEngine,
  onAfterExecute: tabsState.refresh,
});

const quickApps = quickAppsState.quickApps;
const addQuickApp = quickAppsState.add;
const updateQuickApp = quickAppsState.update;
const removeQuickApp = quickAppsState.remove;
const reorderQuickApp = quickAppsState.reorder;

const defaultEngine = settingsState.defaultEngine;
const enableTabSwitcher = settingsState.enableTabSwitcher;
const setDefaultEngine = settingsState.setDefaultEngine;
const setEnableTabSwitcher = settingsState.setEnableTabSwitcher;

const isSettingsOpen = ref(false);

const query = searchState.query;
const searchLoading = searchState.isLoading;
const groupedCandidates = searchState.groupedCandidates;
const highlightedIndex = searchState.highlightedIndex;
const moveHighlight = searchState.moveHighlight;
const executeHighlighted = searchState.executeHighlighted;
const executeCandidateAt = searchState.executeCandidateAt;

const tabGroups = tabsState.tabGroups;
const tabsLoading = tabsState.isLoading;
const powerTabDuplicateSummary = tabsState.powerTabDuplicateSummary;

async function handleOpenQuickApp(quickApp: QuickApp) {
  await openUrl(quickApp.url);
  await tabsState.refresh();
}

async function handleFocusTab(tab: TabEntity) {
  await tabsState.focus(tab);
}

async function handleCloseTab(tab: TabEntity) {
  await tabsState.closeOne(tab.id);
}

async function handleCloseGroup(group: TabGroup) {
  await tabsState.closeGroup(group);
}

async function handleCloseDuplicates(group: TabGroup) {
  await tabsState.closeDuplicates(group);
}

async function handleClosePowerTabDuplicates() {
  await tabsState.closePowerTabDuplicates();
}

function openSettings() {
  isSettingsOpen.value = true;
}
</script>

<template>
  <MainShell @open-settings="openSettings">
    <template #search>
      <SearchSection
        v-model:query="query"
        :engine="defaultEngine"
        :loading="searchLoading"
        :groups="groupedCandidates"
        :highlighted-index="highlightedIndex"
        @update:engine="setDefaultEngine"
        @move="moveHighlight"
        @submit="executeHighlighted"
        @select="executeCandidateAt"
      />
    </template>

    <template #quick-apps>
      <QuickAppsSection
        :quick-apps="quickApps"
        @open="handleOpenQuickApp"
        @add="addQuickApp"
        @update="(id, patch) => updateQuickApp(id, patch)"
        @remove="(quickApp) => removeQuickApp(quickApp.id)"
        @reorder="(fromId, toId) => reorderQuickApp(fromId, toId)"
      />
    </template>

    <template #tabs>
      <TabsSection
        :groups="tabGroups"
        :loading="tabsLoading"
        :power-tab-duplicate-count="powerTabDuplicateSummary.closableCount"
        @focus="handleFocusTab"
        @close-tab="handleCloseTab"
        @close-group="handleCloseGroup"
        @close-duplicates="handleCloseDuplicates"
        @close-power-tab-duplicates="handleClosePowerTabDuplicates"
      />
    </template>
  </MainShell>

  <SettingsModal
    v-model="isSettingsOpen"
    :enable-tab-switcher="enableTabSwitcher"
    @update:enable-tab-switcher="setEnableTabSwitcher"
  />
</template>
