import { createId } from '@/shared/utils/id';
import { ensureUrlProtocol } from '@/shared/utils/url';
import { loadQuickApps, saveQuickApps } from '@/infrastructure/chrome/storage';
import type { QuickApp } from '@/shared/types/models';

export interface QuickAppInput {
  name: string;
  url: string;
  iconMode?: QuickApp['iconMode'];
  iconUrl?: string;
}

export async function listQuickApps(): Promise<QuickApp[]> {
  const quickApps = await loadQuickApps();
  return quickApps.slice().sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createQuickApp(input: QuickAppInput): Promise<QuickApp> {
  const quickApps = await listQuickApps();
  const now = new Date().toISOString();

  const quickApp: QuickApp = {
    id: createId('quick-app'),
    name: input.name.trim(),
    url: ensureUrlProtocol(input.url.trim()),
    iconMode: input.iconMode ?? 'favicon',
    iconUrl: input.iconUrl,
    sortOrder: quickApps.length,
    createdAt: now,
    updatedAt: now,
  };

  const next = [...quickApps, quickApp];
  await saveQuickApps(next);
  return quickApp;
}

export async function updateQuickApp(id: string, patch: Partial<QuickAppInput>): Promise<QuickApp | null> {
  const quickApps = await listQuickApps();
  const index = quickApps.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const current = quickApps[index];
  const nextItem: QuickApp = {
    ...current,
    ...patch,
    name: patch.name !== undefined ? patch.name.trim() : current.name,
    url: patch.url !== undefined ? patch.url.trim() : current.url,
    updatedAt: new Date().toISOString(),
  };

  const next = quickApps.slice();
  next[index] = nextItem;
  await saveQuickApps(next);
  return nextItem;
}

export async function removeQuickApp(id: string): Promise<void> {
  const quickApps = await listQuickApps();
  const next = quickApps
    .filter((item) => item.id !== id)
    .map((item, index) => ({ ...item, sortOrder: index }));
  await saveQuickApps(next);
}

export async function reorderQuickApps(ids: string[]): Promise<QuickApp[]> {
  const quickApps = await listQuickApps();
  const byId = new Map(quickApps.map((item) => [item.id, item]));
  const ordered = ids
    .map((id) => byId.get(id))
    .filter((item): item is QuickApp => Boolean(item))
    .map((item, index) => ({ ...item, sortOrder: index, updatedAt: new Date().toISOString() }));

  const missing = quickApps
    .filter((item) => !ids.includes(item.id))
    .map((item, index) => ({ ...item, sortOrder: ordered.length + index, updatedAt: new Date().toISOString() }));

  const next = [...ordered, ...missing];
  await saveQuickApps(next);
  return next;
}
