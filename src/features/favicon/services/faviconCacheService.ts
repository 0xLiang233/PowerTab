import { loadFaviconCache, saveFaviconCache } from '@/infrastructure/chrome/storage';
import type { FaviconCacheEntry } from '@/shared/types/models';
import { isLocalNetworkUrl } from '@/shared/utils/url';

const CACHE_LIMIT = 240;
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 14;
const FAILURE_TTL_MS = 1000 * 60 * 30;
const BLOCKED_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const FAVICON_SIZE = 32;
const FAVICON_PATH_PREFIX = '/_favicon/';

type FaviconTarget = {
  pageUrl?: string;
  favIconUrl?: string;
};

let cacheLoaded = false;
const entryStore = new Map<string, FaviconCacheEntry>();
const inflightStore = new Map<string, Promise<string | undefined>>();

export async function resolveCachedFavicon(target: FaviconTarget): Promise<string | undefined> {
  const pageUrl = getResolvablePageUrl(target);
  if (!pageUrl) return undefined;

  const cacheKey = getFaviconCacheKey(pageUrl);
  if (!cacheKey) return undefined;

  const entry = await getEntry(cacheKey);
  if (entry) {
    if (entry.status === 'ready' && entry.faviconUrl) {
      if (isExpired(entry) || shouldRefreshEntry(entry, target.favIconUrl)) {
        void warmFaviconCache(target);
      }
      return entry.faviconUrl;
    }

    if (entry.status === 'blocked') {
      return undefined;
    }

    if (entry.status === 'failed') {
      if (isExpired(entry)) {
        void warmFaviconCache(target);
      }
      return undefined;
    }
  }

  if (isLocalNetworkUrl(pageUrl)) {
    if (!entry || isExpired(entry) || entry.status === 'failed') {
      await upsertEntry({
        key: cacheKey,
        pageUrl,
        status: 'blocked',
        expiresAt: toIso(Date.now() + BLOCKED_TTL_MS),
      });
    }
    return undefined;
  }

  void warmFaviconCache(target);
  return undefined;
}

export async function warmFaviconCache(target: FaviconTarget): Promise<string | undefined> {
  const pageUrl = getResolvablePageUrl(target);
  if (!pageUrl || isLocalNetworkUrl(pageUrl)) {
    return undefined;
  }

  const cacheKey = getFaviconCacheKey(pageUrl);
  if (!cacheKey) return undefined;

  const existingTask = inflightStore.get(cacheKey);
  if (existingTask) {
    return existingTask;
  }

  const task = fetchAndCacheFavicon({
    cacheKey,
    pageUrl,
    sourceUrl: target.favIconUrl,
  }).finally(() => {
    inflightStore.delete(cacheKey);
  });

  inflightStore.set(cacheKey, task);
  return task;
}

async function fetchAndCacheFavicon(input: {
  cacheKey: string;
  pageUrl: string;
  sourceUrl?: string;
}): Promise<string | undefined> {
  const previousEntry = await getEntry(input.cacheKey);

  try {
    const response = await fetch(getBrowserFaviconUrl(input.pageUrl), { cache: 'force-cache' });
    if (!response.ok) {
      throw new Error(`Failed to fetch favicon: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    if (!isImageContentType(contentType)) {
      throw new Error(`Unexpected favicon content-type: ${contentType}`);
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength === 0) {
      throw new Error('Empty favicon payload');
    }

    const faviconUrl = arrayBufferToDataUrl(buffer, contentType);
    await upsertEntry({
      key: input.cacheKey,
      pageUrl: input.pageUrl,
      faviconUrl,
      status: 'ready',
      sourceUrl: input.sourceUrl,
      expiresAt: toIso(Date.now() + CACHE_TTL_MS),
    });
    return faviconUrl;
  } catch {
    if (previousEntry?.status === 'ready' && previousEntry.faviconUrl) {
      await upsertEntry({
        key: input.cacheKey,
        pageUrl: input.pageUrl,
        faviconUrl: previousEntry.faviconUrl,
        status: 'ready',
        sourceUrl: input.sourceUrl ?? previousEntry.sourceUrl,
        expiresAt: toIso(Date.now() + FAILURE_TTL_MS),
      });
      return previousEntry.faviconUrl;
    }

    await upsertEntry({
      key: input.cacheKey,
      pageUrl: input.pageUrl,
      status: 'failed',
      sourceUrl: input.sourceUrl,
      expiresAt: toIso(Date.now() + FAILURE_TTL_MS),
    });
    return undefined;
  }
}

async function getEntry(cacheKey: string): Promise<FaviconCacheEntry | undefined> {
  await ensureCacheLoaded();
  return entryStore.get(cacheKey);
}

async function ensureCacheLoaded(): Promise<void> {
  if (cacheLoaded) return;
  const entries = await loadFaviconCache();
  entryStore.clear();
  entries.forEach((entry) => {
    entryStore.set(entry.key, entry);
  });
  cacheLoaded = true;
}

async function upsertEntry(input: {
  key: string;
  pageUrl: string;
  status: FaviconCacheEntry['status'];
  expiresAt: string;
  faviconUrl?: string;
  sourceUrl?: string;
}): Promise<void> {
  await ensureCacheLoaded();

  entryStore.set(input.key, {
    key: input.key,
    pageUrl: input.pageUrl,
    faviconUrl: input.faviconUrl,
    status: input.status,
    sourceUrl: input.sourceUrl,
    updatedAt: toIso(Date.now()),
    expiresAt: input.expiresAt,
  });

  pruneEntries();
  await saveFaviconCache([...entryStore.values()]);
}

function pruneEntries(): void {
  if (entryStore.size <= CACHE_LIMIT) return;

  const nextEntries = [...entryStore.values()]
    .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt))
    .slice(0, CACHE_LIMIT);

  entryStore.clear();
  nextEntries.forEach((entry) => {
    entryStore.set(entry.key, entry);
  });
}

function shouldRefreshEntry(entry: FaviconCacheEntry, sourceUrl: string | undefined): boolean {
  return isExpired(entry) || (Boolean(sourceUrl) && entry.sourceUrl !== sourceUrl);
}

function isExpired(entry: Pick<FaviconCacheEntry, 'expiresAt'>): boolean {
  return Date.parse(entry.expiresAt) <= Date.now();
}

function getResolvablePageUrl(target: FaviconTarget): string | undefined {
  const pageUrl = target.pageUrl?.trim();
  if (!pageUrl) return undefined;
  return /^https?:\/\//.test(pageUrl) ? pageUrl : undefined;
}

function getFaviconCacheKey(pageUrl: string): string | undefined {
  try {
    const parsed = new URL(pageUrl);
    if (!/^https?:$/u.test(parsed.protocol)) {
      return undefined;
    }
    return parsed.origin;
  } catch {
    return undefined;
  }
}

function getBrowserFaviconUrl(pageUrl: string): string {
  const resourceUrl = new URL(FAVICON_PATH_PREFIX, chrome.runtime.getURL('/'));
  resourceUrl.searchParams.set('pageUrl', pageUrl);
  resourceUrl.searchParams.set('size', String(FAVICON_SIZE));
  return resourceUrl.toString();
}

function isImageContentType(contentType: string): boolean {
  return contentType.trim().toLowerCase().startsWith('image/');
}

function arrayBufferToDataUrl(buffer: ArrayBuffer, contentType: string): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return `data:${contentType};base64,${btoa(binary)}`;
}

function toIso(value: number): string {
  return new Date(value).toISOString();
}
