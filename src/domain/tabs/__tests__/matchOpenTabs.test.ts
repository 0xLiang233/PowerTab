import { describe, expect, it } from 'vitest';
import { matchOpenTabs } from '@/domain/tabs/matchOpenTabs';
import type { TabEntity } from '@/shared/types/models';

const tab: TabEntity = {
  id: 1,
  windowId: 1,
  title: 'Claude Docs',
  url: 'https://claude.ai/docs',
  active: true,
  hostname: 'claude.ai',
  normalizedUrl: 'https://claude.ai/docs',
  isLandingPage: false,
};

describe('matchOpenTabs', () => {
  it('prioritizes direct hostname matches', () => {
    const matches = matchOpenTabs('claude.ai', [tab]);
    expect(matches[0]?.type).toBe('open-tab');
    expect(matches[0]?.score).toBeGreaterThan(0);
  });
});
