import { describe, expect, it } from 'vitest';
import { findDuplicateUrls, getClosableDuplicateTabIds } from '@/domain/tabs/findDuplicates';
import type { TabEntity } from '@/shared/types/models';

const createTab = (overrides: Partial<TabEntity>): TabEntity => ({
  id: 1,
  windowId: 1,
  title: 'Power Tab',
  url: 'chrome-extension://test/newtab.html',
  active: false,
  hostname: 'test',
  normalizedUrl: 'chrome-extension://test/newtab.html',
  isLandingPage: false,
  ...overrides,
});

describe('findDuplicates', () => {
  it('returns duplicate urls', () => {
    const duplicateUrl = 'chrome-extension://test/newtab.html';
    const tabs = [
      createTab({ id: 1, normalizedUrl: duplicateUrl }),
      createTab({ id: 2, normalizedUrl: duplicateUrl }),
      createTab({ id: 3, normalizedUrl: 'https://example.com/' }),
    ];

    expect(findDuplicateUrls(tabs)).toEqual([duplicateUrl]);
  });

  it('returns closable duplicate ids while keeping the first tab', () => {
    const duplicateUrl = 'chrome-extension://test/newtab.html';
    const tabs = [
      createTab({ id: 1, normalizedUrl: duplicateUrl }),
      createTab({ id: 2, normalizedUrl: duplicateUrl }),
      createTab({ id: 3, normalizedUrl: duplicateUrl }),
    ];

    expect(getClosableDuplicateTabIds(tabs)).toEqual([2, 3]);
  });

  it('keeps the active duplicate and closes the rest', () => {
    const duplicateUrl = 'chrome-extension://test/newtab.html';
    const tabs = [
      createTab({ id: 1, normalizedUrl: duplicateUrl }),
      createTab({ id: 2, normalizedUrl: duplicateUrl, active: true }),
      createTab({ id: 3, normalizedUrl: duplicateUrl }),
    ];

    expect(getClosableDuplicateTabIds(tabs)).toEqual([1, 3]);
  });
});
