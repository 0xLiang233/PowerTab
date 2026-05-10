<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import MainShell from '@/components/layout/MainShell.vue';
import QuickAppsSection from '@/components/quick-apps/QuickAppsSection.vue';
import ReadLaterSection from '@/components/read-later/ReadLaterSection.vue';
import SettingsModal from '@/components/settings/SettingsModal.vue';
import TabsSection from '@/components/tabs/TabsSection.vue';
import { useReadLater } from '@/features/read-later/composables/useReadLater';
import { useQuickApps } from '@/features/quick-apps/composables/useQuickApps';
import { useSettings } from '@/features/settings/services/useSettings';
import { useTabs } from '@/features/tabs/composables/useTabs';
import { openUrl } from '@/infrastructure/chrome/tabGateway';
import { setLocale } from '@/shared/i18n';
import type { QuickApp, ReadLaterItem, TabEntity, TabGroup } from '@/shared/types/models';

const quickAppsState = useQuickApps();
const readLaterState = useReadLater();
const settingsState = useSettings();
const tabsState = useTabs();

const quickApps = quickAppsState.quickApps;
const addQuickApp = quickAppsState.add;
const updateQuickApp = quickAppsState.update;
const removeQuickApp = quickAppsState.remove;
const reorderQuickApp = quickAppsState.reorder;

const enableTabSwitcher = settingsState.enableTabSwitcher;
const stylePreset = settingsState.stylePreset;
const language = settingsState.language;
const setEnableTabSwitcher = settingsState.setEnableTabSwitcher;
const setStylePreset = settingsState.setStylePreset;
const setLanguage = settingsState.setLanguage;

const isSettingsOpen = ref(false);

const tabGroups = tabsState.tabGroups;
const tabsLoading = tabsState.isLoading;
const powerTabDuplicateSummary = tabsState.powerTabDuplicateSummary;
const readLaterItems = readLaterState.items;
const readLaterLoading = readLaterState.isLoading;
const readLaterUrls = computed(() => readLaterItems.value.map((item) => item.normalizedUrl));

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

async function handleAddReadLater(tab: TabEntity) {
  await readLaterState.add(tab);
}

async function handleOpenReadLater(item: ReadLaterItem) {
  await readLaterState.open(item);
  await tabsState.refresh();
}

async function handleRemoveReadLater(item: ReadLaterItem) {
  await readLaterState.remove(item.id);
}

function openSettings() {
  isSettingsOpen.value = true;
}

function applyStylePreset(value: string) {
  document.documentElement.dataset.stylePreset = value;
}

watch(stylePreset, (value) => {
  applyStylePreset(value);
});

watch(language, (value) => {
  setLocale(value);
});

onMounted(() => {
  applyStylePreset(stylePreset.value);
  setLocale(language.value);
});
</script>

<template>
  <div class="app-root" :data-style-preset="stylePreset">
    <MainShell @open-settings="openSettings">
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
        <div class="tab-dashboard">
          <TabsSection
            :groups="tabGroups"
            :loading="tabsLoading"
            :power-tab-duplicate-count="powerTabDuplicateSummary.closableCount"
            :saved-read-later-urls="readLaterUrls"
            @focus="handleFocusTab"
            @close-tab="handleCloseTab"
            @close-group="handleCloseGroup"
            @close-duplicates="handleCloseDuplicates"
            @close-power-tab-duplicates="handleClosePowerTabDuplicates"
            @add-read-later="handleAddReadLater"
          />
          <ReadLaterSection
            :items="readLaterItems"
            :loading="readLaterLoading"
            @open="handleOpenReadLater"
            @remove="handleRemoveReadLater"
          />
        </div>
      </template>
    </MainShell>

    <SettingsModal
      v-model="isSettingsOpen"
      :enable-tab-switcher="enableTabSwitcher"
      :style-preset="stylePreset"
      :language="language"
      @update:enable-tab-switcher="setEnableTabSwitcher"
      @update:style-preset="setStylePreset"
      @update:language="setLanguage"
    />
  </div>
</template>
