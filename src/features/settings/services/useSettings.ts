import { computed, onMounted, ref } from 'vue';
import { getSettings, updateSettings } from '@/features/settings/services/settingsRepository';
import type { Language, SearchEngine, StylePreset } from '@/shared/types/models';

export function useSettings() {
  const defaultEngine = ref<SearchEngine>('google');
  const enableTabSwitcher = ref(false);
  const stylePreset = ref<StylePreset>('mock-v1');
  const language = ref<Language>('en');
  const isLoading = ref(false);

  async function load() {
    isLoading.value = true;
    const settings = await getSettings();
    defaultEngine.value = settings.defaultEngine;
    enableTabSwitcher.value = settings.enableTabSwitcher;
    stylePreset.value = settings.stylePreset;
    language.value = settings.language;
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

  async function setStylePreset(value: StylePreset) {
    const settings = await updateSettings({ stylePreset: value });
    stylePreset.value = settings.stylePreset;
  }

  async function setLanguage(value: Language) {
    const settings = await updateSettings({ language: value });
    language.value = settings.language;
  }

  onMounted(load);

  return {
    defaultEngine,
    enableTabSwitcher,
    stylePreset,
    language,
    isLoading: computed(() => isLoading.value),
    load,
    setDefaultEngine,
    setEnableTabSwitcher,
    setStylePreset,
    setLanguage,
  };
}
