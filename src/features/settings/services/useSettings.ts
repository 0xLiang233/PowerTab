import { computed, onMounted, ref } from 'vue';
import { getSettings, updateSettings } from '@/features/settings/services/settingsRepository';
import type { SearchEngine } from '@/shared/types/models';

export function useSettings() {
  const defaultEngine = ref<SearchEngine>('google');
  const enableTabSwitcher = ref(false);
  const isLoading = ref(false);

  async function load() {
    isLoading.value = true;
    const settings = await getSettings();
    defaultEngine.value = settings.defaultEngine;
    enableTabSwitcher.value = settings.enableTabSwitcher;
    isLoading.value = false;
  }

  async function setDefaultEngine(engine: SearchEngine) {
    const settings = await updateSettings({ defaultEngine: engine });
    defaultEngine.value = settings.defaultEngine;
  }

  async function setEnableTabSwitcher(value: boolean) {
    const settings = await updateSettings({ enableTabSwitcher: value });
    enableTabSwitcher.value = settings.enableTabSwitcher;
  }

  onMounted(load);

  return {
    defaultEngine,
    enableTabSwitcher,
    isLoading: computed(() => isLoading.value),
    load,
    setDefaultEngine,
    setEnableTabSwitcher,
  };
}
