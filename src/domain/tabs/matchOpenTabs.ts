import type { SearchCandidate, TabEntity } from '@/shared/types/models';
import { tryParseUrl } from '@/shared/utils/url';

export function matchOpenTabs(query: string, tabs: TabEntity[]): SearchCandidate[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const parsed = tryParseUrl(query);

  return tabs
    .map((tab) => ({ tab, score: scoreTabMatch(normalized, parsed, tab) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ tab, score }) => ({
      id: `open-tab-${tab.id}`,
      type: 'open-tab' as const,
      title: tab.title,
      subtitle: tab.url,
      score,
      group: 'Open Tabs' as const,
      payload: tab,
    }));
}

function scoreTabMatch(query: string, parsed: URL | null, tab: TabEntity): number {
  const title = tab.title.toLowerCase();
  const url = tab.url.toLowerCase();
  const hostname = tab.hostname.toLowerCase();
  const parsedNormalized = parsed ? parsed.toString().replace(/\/$/, '') : null;

  if ((parsedNormalized && tab.normalizedUrl === parsedNormalized) || tab.normalizedUrl === query) {
    return 120;
  }

  if (parsed && parsed.hostname === hostname) {
    return url === parsed.toString().toLowerCase() ? 115 : 100;
  }

  if (hostname === query) return 95;
  if (url.includes(query)) return 82;
  if (title.includes(query)) return tab.active ? 78 : 70;
  if (hostname.includes(query)) return 68;
  return 0;
}
