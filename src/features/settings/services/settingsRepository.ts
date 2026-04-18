import { loadSettings, saveSettings } from '@/infrastructure/chrome/storage';
import type { Settings } from '@/shared/types/models';

export async function getSettings(): Promise<Settings> {
  return loadSettings();
}

export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await loadSettings();
  const next = { ...current, ...patch };
  await saveSettings(next);
  return next;
}
