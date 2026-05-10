import type { QuickApp, ReadLaterItem, Settings } from '@/shared/types/models';

export const DEFAULT_SETTINGS: Settings = {
  defaultEngine: 'google',
  enableTabSwitcher: false,
  stylePreset: 'mock-v1',
  language: 'en',
};

export const DEFAULT_QUICK_APPS: QuickApp[] = [];

export const DEFAULT_READ_LATER: ReadLaterItem[] = [];
