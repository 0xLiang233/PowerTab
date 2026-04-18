import type { SearchEngine } from '@/shared/types/models';

export const SEARCH_ENGINE_LABELS: Record<SearchEngine, string> = {
  google: 'Google',
  bing: 'Bing',
  duckduckgo: 'DuckDuckGo',
};

export const SEARCH_ENGINE_URLS: Record<SearchEngine, string> = {
  google: 'https://www.google.com/search?q=%s',
  bing: 'https://www.bing.com/search?q=%s',
  duckduckgo: 'https://duckduckgo.com/?q=%s',
};
