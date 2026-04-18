import { classifyInput, resolveAddressBarUrl } from '@/domain/search/classifyInput';
import { rankCandidates } from '@/domain/search/rankCandidates';
import { matchOpenTabs } from '@/domain/tabs/matchOpenTabs';
import { getOpenTabs, focusOpenTab } from '@/features/tabs/services/tabsService';
import { openUrl } from '@/infrastructure/chrome/tabGateway';
import { SEARCH_ENGINE_LABELS, SEARCH_ENGINE_URLS } from '@/shared/constants/search';
import type {
  QuickApp,
  SearchActionPayload,
  SearchCandidate,
  SearchEngine,
} from '@/shared/types/models';

interface SearchOptions {
  quickApps: QuickApp[];
  engine: SearchEngine;
}

export async function buildSearchCandidates(query: string, options: SearchOptions): Promise<SearchCandidate[]> {
  const classification = classifyInput(query);
  if (classification.isEmpty) return [];

  const tabs = await getOpenTabs();
  const openTabCandidates = matchOpenTabs(query, tabs);
  const quickAppCandidates = buildQuickAppCandidates(query, options.quickApps);
  const searchCandidate = buildSearchActionCandidate(query, options.engine);

  return rankCandidates([...openTabCandidates, ...quickAppCandidates, searchCandidate]);
}

export async function executeSearchCandidate(candidate: SearchCandidate): Promise<void> {
  if (candidate.type === 'open-tab') {
    await focusOpenTab(candidate.payload as Awaited<ReturnType<typeof getOpenTabs>>[number]);
    return;
  }

  if (candidate.type === 'quick-app') {
    const quickApp = candidate.payload as QuickApp;
    await openUrl(quickApp.url);
    return;
  }

  const action = candidate.payload as SearchActionPayload;
  await openUrl(action.url);
}

function buildQuickAppCandidates(query: string, quickApps: QuickApp[]): SearchCandidate[] {
  const normalized = query.trim().toLowerCase();
  return quickApps
    .map((quickApp) => ({ quickApp, score: scoreQuickAppMatch(normalized, quickApp) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ quickApp, score }) => ({
      id: `quick-app-${quickApp.id}`,
      type: 'quick-app' as const,
      title: quickApp.name,
      subtitle: quickApp.url,
      score,
      group: 'Quick Apps' as const,
      payload: quickApp,
    }));
}

function buildSearchActionCandidate(query: string, engine: SearchEngine): SearchCandidate {
  const addressBarUrl = resolveAddressBarUrl(query);
  if (addressBarUrl) {
    return {
      id: `search-open-${addressBarUrl}`,
      type: 'search-action',
      title: `Open ${addressBarUrl}`,
      subtitle: 'Address bar action',
      score: 80,
      group: 'Search',
      payload: {
        query,
        engine,
        url: addressBarUrl,
      } satisfies SearchActionPayload,
    };
  }

  const encodedQuery = encodeURIComponent(query.trim());
  const template = SEARCH_ENGINE_URLS[engine];
  return {
    id: `search-query-${engine}-${encodedQuery}`,
    type: 'search-action',
    title: `Search ${SEARCH_ENGINE_LABELS[engine]} for “${query.trim()}”`,
    subtitle: 'Search action',
    score: 58,
    group: 'Search',
    payload: {
      query,
      engine,
      url: template.replace('%s', encodedQuery),
    } satisfies SearchActionPayload,
  };
}

function scoreQuickAppMatch(query: string, quickApp: QuickApp): number {
  const name = quickApp.name.toLowerCase();
  const url = quickApp.url.toLowerCase();

  if (name === query) return 55;
  if (url === query) return 52;
  if (name.startsWith(query)) return 45;
  if (name.includes(query)) return 35;
  if (url.includes(query)) return 25;
  return 0;
}
