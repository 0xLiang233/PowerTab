import type { QuickApp, ReadLaterItem, Settings } from '@/shared/types/models';

export const DEFAULT_SETTINGS: Settings = {
  defaultEngine: 'google',
  enableTabSwitcher: false,
  stylePreset: 'mock-v1',
};

export const DEFAULT_QUICK_APPS: QuickApp[] = [
  createDefaultQuickApp('gmail', 'Gmail', 'https://mail.google.com/'),
  createDefaultQuickApp('github', 'GitHub', 'https://github.com/'),
  createDefaultQuickApp('claude', 'Claude', 'https://claude.ai/'),
  createDefaultQuickApp('notion', 'Notion', 'https://www.notion.so/'),
  createDefaultQuickApp('vercel', 'Vercel', 'https://vercel.com/'),
  createDefaultQuickApp('youtube', 'YouTube', 'https://www.youtube.com/'),
];

export const DEFAULT_READ_LATER: ReadLaterItem[] = [];

function createDefaultQuickApp(id: string, name: string, url: string): QuickApp {
  const now = new Date().toISOString();
  return {
    id,
    name,
    url,
    iconMode: 'favicon',
    sortOrder: Number.MAX_SAFE_INTEGER,
    createdAt: now,
    updatedAt: now,
  };
}

DEFAULT_QUICK_APPS.forEach((app, index) => {
  app.sortOrder = index;
});
