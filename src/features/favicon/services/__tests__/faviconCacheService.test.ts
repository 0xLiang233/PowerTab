import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FaviconCacheEntry } from '@/shared/types/models';

const loadFaviconCacheMock = vi.fn<() => Promise<FaviconCacheEntry[]>>();
const saveFaviconCacheMock = vi.fn<(entries: FaviconCacheEntry[]) => Promise<void>>();
const fetchMock = vi.fn<typeof fetch>();

vi.mock('@/infrastructure/chrome/storage', () => ({
  loadFaviconCache: loadFaviconCacheMock,
  saveFaviconCache: saveFaviconCacheMock,
}));

describe('faviconCacheService', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    vi.stubGlobal('chrome', {
      runtime: {
        getURL: vi.fn((path: string) => `chrome-extension://test${path}`),
      },
    });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not return browser favicon urls for failed cache entries', async () => {
    loadFaviconCacheMock.mockResolvedValue([
      createEntry({
        key: 'https://a.example',
        pageUrl: 'https://a.example/page',
        status: 'failed',
        expiresAt: futureIso(),
      }),
    ]);

    const { resolveCachedFavicon } = await import('@/features/favicon/services/faviconCacheService');
    const result = await resolveCachedFavicon({ pageUrl: 'https://a.example/other' });

    expect(result).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not expose live favicon urls on cache miss', async () => {
    loadFaviconCacheMock.mockResolvedValue([]);
    fetchMock.mockRejectedValue(new Error('403'));

    const { resolveCachedFavicon } = await import('@/features/favicon/services/faviconCacheService');
    const result = await resolveCachedFavicon({ pageUrl: 'https://chatgpt.com/' });

    expect(result).toBeUndefined();
  });

  it('keeps the last successful favicon when background refresh fails', async () => {
    const cachedIcon = 'data:image/png;base64,AAAA';
    let savedEntries: FaviconCacheEntry[] = [];

    loadFaviconCacheMock.mockResolvedValue([
      createEntry({
        key: 'https://a.example',
        pageUrl: 'https://a.example/page',
        status: 'ready',
        faviconUrl: cachedIcon,
        expiresAt: pastIso(),
      }),
    ]);
    saveFaviconCacheMock.mockImplementation(async (entries) => {
      savedEntries = entries;
    });
    fetchMock.mockRejectedValue(new Error('403'));

    const { warmFaviconCache, resolveCachedFavicon } = await import('@/features/favicon/services/faviconCacheService');
    const warmResult = await warmFaviconCache({ pageUrl: 'https://a.example/other' });
    const resolved = await resolveCachedFavicon({ pageUrl: 'https://a.example/other' });

    expect(warmResult).toBe(cachedIcon);
    expect(resolved).toBe(cachedIcon);
    expect(savedEntries).toHaveLength(1);
    expect(savedEntries[0]?.status).toBe('ready');
    expect(savedEntries[0]?.faviconUrl).toBe(cachedIcon);
  });
});

function createEntry(input: Partial<FaviconCacheEntry> & Pick<FaviconCacheEntry, 'key' | 'pageUrl' | 'status'>): FaviconCacheEntry {
  return {
    key: input.key,
    pageUrl: input.pageUrl,
    faviconUrl: input.faviconUrl,
    status: input.status,
    sourceUrl: input.sourceUrl,
    updatedAt: input.updatedAt ?? new Date('2026-01-01T00:00:00.000Z').toISOString(),
    expiresAt: input.expiresAt ?? futureIso(),
  };
}

function futureIso(): string {
  return new Date(Date.now() + 60_000).toISOString();
}

function pastIso(): string {
  return new Date(Date.now() - 60_000).toISOString();
}
