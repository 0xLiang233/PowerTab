import { describe, expect, it } from 'vitest';
import { rankCandidates } from '@/domain/search/rankCandidates';

describe('rankCandidates', () => {
  it('sorts by descending score', () => {
    const ranked = rankCandidates([
      { id: 'a', type: 'search-action', title: 'a', score: 1, group: 'Search', payload: null },
      { id: 'b', type: 'open-tab', title: 'b', score: 10, group: 'Open Tabs', payload: null },
    ]);

    expect(ranked[0]?.id).toBe('b');
  });
});
