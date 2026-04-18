import { describe, expect, it } from 'vitest';
import { groupTabs } from '@/domain/tabs/groupTabs';
import type { TabEntity } from '@/shared/types/models';

const createTab = (overrides: Partial<TabEntity>): TabEntity => ({
  id: 1,
  windowId: 1,
  title: 'Example',
  url: 'https://example.com/',
  active: false,
  hostname: 'example.com',
  normalizedUrl: 'https://example.com/',
  isLandingPage: false,
  ...overrides,
});

describe('groupTabs', () => {
  it('groups landing pages first', () => {
    const groups = groupTabs([
      createTab({ id: 1, hostname: 'github.com', isLandingPage: true }),
      createTab({ id: 2, hostname: 'example.com' }),
    ]);

    expect(groups[0]?.label).toBe('Homepages');
  });
});
