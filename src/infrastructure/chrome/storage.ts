import { DEFAULT_QUICK_APPS, DEFAULT_SETTINGS } from '@/shared/constants/defaults';
import type { Settings, StorageSchema, QuickApp } from '@/shared/types/models';

const STORAGE_KEYS = {
  quickApps: 'quickApps',
  settings: 'settings',
} as const;

function getStorageArea(): chrome.storage.StorageArea {
  return chrome.storage.local;
}

export async function loadQuickApps(): Promise<QuickApp[]> {
  const result = await getStorageArea().get(STORAGE_KEYS.quickApps);
  return (result[STORAGE_KEYS.quickApps] as QuickApp[] | undefined) ?? DEFAULT_QUICK_APPS;
}

export async function saveQuickApps(quickApps: QuickApp[]): Promise<void> {
  await getStorageArea().set({ [STORAGE_KEYS.quickApps]: quickApps });
}

export async function loadSettings(): Promise<Settings> {
  const result = await getStorageArea().get(STORAGE_KEYS.settings);
  return {
    ...DEFAULT_SETTINGS,
    ...(result[STORAGE_KEYS.settings] as Settings | undefined),
  };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await getStorageArea().set({ [STORAGE_KEYS.settings]: settings });
}

export async function loadStorageSnapshot(): Promise<StorageSchema> {
  const [quickApps, settings] = await Promise.all([loadQuickApps(), loadSettings()]);
  return { quickApps, settings };
}
