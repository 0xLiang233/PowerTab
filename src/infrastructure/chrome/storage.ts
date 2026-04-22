import { DEFAULT_QUICK_APPS, DEFAULT_READ_LATER, DEFAULT_SETTINGS } from '@/shared/constants/defaults';
import type { ReadLaterItem, Settings, StorageSchema, QuickApp } from '@/shared/types/models';

const STORAGE_KEYS = {
  quickApps: 'quickApps',
  readLater: 'readLater',
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

export async function loadReadLater(): Promise<ReadLaterItem[]> {
  const result = await getStorageArea().get(STORAGE_KEYS.readLater);
  return (result[STORAGE_KEYS.readLater] as ReadLaterItem[] | undefined) ?? DEFAULT_READ_LATER;
}

export async function saveReadLater(readLater: ReadLaterItem[]): Promise<void> {
  await getStorageArea().set({ [STORAGE_KEYS.readLater]: readLater });
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
  const [quickApps, readLater, settings] = await Promise.all([loadQuickApps(), loadReadLater(), loadSettings()]);
  return { quickApps, readLater, settings };
}
