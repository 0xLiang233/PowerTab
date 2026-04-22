export type SearchEngine = 'google' | 'bing' | 'duckduckgo';

export interface QuickApp {
  id: string;
  name: string;
  url: string;
  iconMode: 'favicon' | 'default';
  iconUrl?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReadLaterItem {
  id: string;
  title: string;
  url: string;
  hostname: string;
  normalizedUrl: string;
  favIconUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  defaultEngine: SearchEngine;
  enableTabSwitcher: boolean;
}

export interface StorageSchema {
  quickApps: QuickApp[];
  readLater: ReadLaterItem[];
  settings: Settings;
}

export interface TabEntity {
  id: number;
  windowId: number;
  title: string;
  url: string;
  favIconUrl?: string;
  active: boolean;
  hostname: string;
  normalizedUrl: string;
  isLandingPage: boolean;
}

export interface TabGroup {
  id: string;
  domain: string;
  label: string;
  tabs: TabEntity[];
  duplicateUrls: string[];
}

export interface PowerTabDuplicateSummary {
  tabs: TabEntity[];
  closableCount: number;
}

export interface QuickTabSwitcherOpenMessage {
  type: 'power-tab:open-quick-tab-switcher';
  tabs: TabEntity[];
  advance: boolean;
}

export interface QuickTabSwitcherFocusMessage {
  type: 'power-tab:focus-quick-tab';
  tabId: number;
  windowId: number;
}

export type SearchCandidateGroup = 'Open Tabs' | 'Quick Apps' | 'Search';
export type SearchCandidateType = 'open-tab' | 'quick-app' | 'search-action';

export interface SearchCandidate {
  id: string;
  type: SearchCandidateType;
  title: string;
  subtitle?: string;
  score: number;
  group: SearchCandidateGroup;
  payload: unknown;
}

export interface SearchActionPayload {
  query: string;
  engine: SearchEngine;
  url: string;
}

export interface InputClassification {
  raw: string;
  normalized: string;
  isEmpty: boolean;
  isLikelyUrl: boolean;
  isLikelyHostname: boolean;
}
