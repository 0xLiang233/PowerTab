import { getSettings } from '@/features/settings/services/settingsRepository';
import { updateBadge } from '@/features/tabs/services/badgeService';
import { closeTab as closeBrowserTab, focusTab } from '@/infrastructure/chrome/tabGateway';
import { getWindowTabs } from '@/features/tabs/services/tabsService';
import { warmFaviconCache } from '@/features/favicon/services/faviconCacheService';
import {
  QUICK_TAB_SWITCHER_COMMAND,
  QUICK_TAB_SWITCHER_CLOSE_MESSAGE,
  QUICK_TAB_SWITCHER_FOCUS_MESSAGE,
} from '@/shared/constants/quickTabSwitcher';
import { QUICK_TAB_SWITCHER_CSS } from '@/shared/constants/quickTabSwitcherStyles';
import { messages } from '@/shared/i18n/messages';
import type { Language } from '@/shared/types/models';
import type { QuickTabSwitcherCloseMessage, QuickTabSwitcherFocusMessage, TabEntity } from '@/shared/types/models';

const tabActivationHistoryByWindow = new Map<number, number[]>();

type QuickTabSwitcherLabels = {
  title: string;
  hint: string;
  searchPlaceholder: string;
  previous: string;
  previousKey: string;
  previousTitle: string;
  count: string;
  searchCount: string;
  noMatches: string;
  empty: string;
  closeTab: string;
  current: string;
};

function refreshBadge() {
  void updateBadge();
}

console.log('[QuickTabSwitcher][background] service worker booted');

chrome.runtime.onInstalled.addListener(() => {
  refreshBadge();
  void warmOpenTabFavicons();
});
chrome.runtime.onStartup.addListener(() => {
  refreshBadge();
  void warmOpenTabFavicons();
});
chrome.tabs.onCreated.addListener((tab) => {
  refreshBadge();
  void warmFaviconCache({ pageUrl: tab.url ?? tab.pendingUrl, favIconUrl: tab.favIconUrl });
});
chrome.tabs.onRemoved.addListener((tabId) => {
  refreshBadge();
  removeFromActivationHistory(tabId);
});
chrome.tabs.onActivated.addListener(({ tabId, windowId }) => {
  rememberActivatedTab(windowId, tabId);
});
chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  refreshBadge();
  if (changeInfo.status === 'complete' || typeof changeInfo.favIconUrl === 'string' || typeof changeInfo.url === 'string') {
    void warmFaviconCache({ pageUrl: tab.url ?? tab.pendingUrl, favIconUrl: tab.favIconUrl });
  }
});
chrome.commands.onCommand.addListener((command) => {
  console.log('[QuickTabSwitcher][background] command received', command);
  void handleCommand(command, 'command');
});
chrome.action.onClicked.addListener((tab) => {
  console.log('[QuickTabSwitcher][background] action clicked', tab);
  void handleCommand(QUICK_TAB_SWITCHER_COMMAND, 'action');
});
chrome.runtime.onMessage.addListener((message: unknown) => {
  if (isFocusMessage(message)) {
    console.log('[QuickTabSwitcher][background] focus request', message);
    void focusTab(message.tabId, message.windowId);
    return;
  }
  if (isCloseMessage(message)) {
    console.log('[QuickTabSwitcher][background] close request', message);
    void closeBrowserTab(message.tabId);
  }
});

refreshBadge();

async function handleCommand(command: string, source: 'command' | 'action') {
  if (command !== QUICK_TAB_SWITCHER_COMMAND) return;

  console.log('[QuickTabSwitcher][background] handling trigger from', source);

  const settings = await getSettings();
  console.log('[QuickTabSwitcher][background] settings', settings);
  if (!settings.enableTabSwitcher) {
    console.log('[QuickTabSwitcher][background] skipped because disabled');
    return;
  }

  const activeTab = await getActiveTab();
  console.log('[QuickTabSwitcher][background] active tab', activeTab);
  if (!activeTab?.id || !activeTab.windowId || !activeTab.url) {
    console.log('[QuickTabSwitcher][background] skipped because active tab is missing data');
    return;
  }
  if (!canInjectIntoTab(activeTab.url)) {
    console.log('[QuickTabSwitcher][background] skipped because URL is not injectable', activeTab.url);
    return;
  }

  try {
    const tabs = await getWindowTabs(activeTab.windowId);
    rememberActivatedTab(activeTab.windowId, activeTab.id);
    const previousTab = getPreviousTab(tabs, activeTab.windowId, activeTab.id);
    console.log('[QuickTabSwitcher][background] window tabs', tabs.length, tabs);

    await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: mountQuickTabSwitcher,
      args: [QUICK_TAB_SWITCHER_CSS, tabs, previousTab, getQuickTabSwitcherLabels(settings.language), true],
    });
    console.log('[QuickTabSwitcher][background] inline switcher mounted');
  } catch (error) {
    console.error('[QuickTabSwitcher][background] command failed', error);
  }
}

async function getActiveTab(): Promise<chrome.tabs.Tab | undefined> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

function canInjectIntoTab(url: string): boolean {
  return /^https?:\/\//.test(url);
}

function isFocusMessage(message: unknown): message is QuickTabSwitcherFocusMessage {
  if (!message || typeof message !== 'object') return false;
  const candidate = message as Partial<QuickTabSwitcherFocusMessage>;
  return (
    candidate.type === QUICK_TAB_SWITCHER_FOCUS_MESSAGE &&
    typeof candidate.tabId === 'number' &&
    typeof candidate.windowId === 'number'
  );
}

function isCloseMessage(message: unknown): message is QuickTabSwitcherCloseMessage {
  if (!message || typeof message !== 'object') return false;
  const candidate = message as Partial<QuickTabSwitcherCloseMessage>;
  return candidate.type === QUICK_TAB_SWITCHER_CLOSE_MESSAGE && typeof candidate.tabId === 'number';
}

async function warmOpenTabFavicons(): Promise<void> {
  const tabs = await chrome.tabs.query({});
  await Promise.allSettled(
    tabs.map((tab) => warmFaviconCache({ pageUrl: tab.url ?? tab.pendingUrl, favIconUrl: tab.favIconUrl })),
  );
}

function rememberActivatedTab(windowId: number, tabId: number): void {
  const current = tabActivationHistoryByWindow.get(windowId) ?? [];
  const next = [tabId, ...current.filter((id) => id !== tabId)].slice(0, 12);
  tabActivationHistoryByWindow.set(windowId, next);
}

function removeFromActivationHistory(tabId: number): void {
  for (const [windowId, history] of tabActivationHistoryByWindow) {
    const next = history.filter((id) => id !== tabId);
    if (next.length === 0) {
      tabActivationHistoryByWindow.delete(windowId);
      continue;
    }
    tabActivationHistoryByWindow.set(windowId, next);
  }
}

function getPreviousTab(tabs: TabEntity[], windowId: number, activeTabId: number): TabEntity | null {
  const history = tabActivationHistoryByWindow.get(windowId) ?? [];
  const previousId = history.find((tabId) => tabId !== activeTabId && tabs.some((tab) => tab.id === tabId));
  return tabs.find((tab) => tab.id === previousId) ?? null;
}

function getQuickTabSwitcherLabels(language: Language): QuickTabSwitcherLabels {
  const dictionary = messages[language];
  return {
    title: dictionary['quickSwitcher.title'],
    hint: dictionary['quickSwitcher.hint'],
    searchPlaceholder: dictionary['quickSwitcher.searchPlaceholder'],
    previous: dictionary['quickSwitcher.previous'],
    previousKey: dictionary['quickSwitcher.previousKey'],
    previousTitle: dictionary['quickSwitcher.previousTitle'],
    count: dictionary['quickSwitcher.count'],
    searchCount: dictionary['quickSwitcher.searchCount'],
    noMatches: dictionary['quickSwitcher.noMatches'],
    empty: dictionary['quickSwitcher.empty'],
    closeTab: dictionary['quickSwitcher.closeTab'],
    current: dictionary['quickSwitcher.current'],
  };
}

function mountQuickTabSwitcher(
  cssText: string,
  nextTabs: TabEntity[],
  nextPreviousTab: TabEntity | null,
  nextLabels: QuickTabSwitcherLabels,
  advance: boolean,
) {
  const ROOT_ID = 'power-tab-quick-tab-switcher-root';
  const STYLE_ID = 'power-tab-quick-tab-switcher-style';
  const FOCUS_MESSAGE = 'power-tab:focus-quick-tab';
  const CLOSE_MESSAGE = 'power-tab:close-quick-tab';
  const CONTROLLER_KEY = '__powerTabQuickTabSwitcherController__';

  type QuickTabSwitcherController = {
    open: (tabs: TabEntity[], previousTab: TabEntity | null, labels: QuickTabSwitcherLabels, advance: boolean) => void;
    updateCss: (cssText: string) => void;
  };

  const controllerWindow = window as Window & {
    [CONTROLLER_KEY]?: QuickTabSwitcherController;
  };

  const existingRoot = document.getElementById(ROOT_ID);
  const existingController = controllerWindow[CONTROLLER_KEY];
  if (existingRoot?.shadowRoot && existingController) {
    existingController.updateCss(cssText);
    existingController.open(nextTabs, nextPreviousTab, nextLabels, advance);
    console.log('[QuickTabSwitcher][content] root already mounted');
    return;
  }

  delete controllerWindow[CONTROLLER_KEY];

  if (existingRoot) {
    existingRoot.remove();
  }

  const existingStyle = document.getElementById(STYLE_ID);
  if (existingStyle) {
    existingStyle.remove();
  }

  const host = document.createElement('div');
  host.id = ROOT_ID;

  const shadowRoot = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = cssText;

  const root = document.createElement('div');
  root.id = ROOT_ID;
  root.innerHTML = `
    <div class="power-tab-switcher__backdrop" hidden>
      <div class="power-tab-switcher" role="dialog" aria-modal="true" aria-labelledby="power-tab-switcher-title">
        <div class="power-tab-switcher__header">
          <div id="power-tab-switcher-title" class="power-tab-switcher__label"></div>
          <div class="power-tab-switcher__hint"></div>
        </div>
        <div class="power-tab-switcher__toolbar">
          <label class="power-tab-switcher__search">
            <span class="power-tab-switcher__search-icon" aria-hidden="true"></span>
            <input class="power-tab-switcher__search-input" type="search" autocomplete="off" spellcheck="false" />
            <span class="power-tab-switcher__search-count"></span>
          </label>
          <button type="button" class="power-tab-switcher__previous" hidden>
            <span class="power-tab-switcher__previous-label"></span>
            <span class="power-tab-switcher__previous-main">
              <span class="power-tab-switcher__previous-favicon"></span>
              <span class="power-tab-switcher__previous-copy">
                <span class="power-tab-switcher__previous-title"></span>
                <span class="power-tab-switcher__previous-subtitle"></span>
              </span>
              <span class="power-tab-switcher__previous-key"></span>
            </span>
          </button>
        </div>
        <div class="power-tab-switcher__list" role="listbox" aria-label="Open tabs"></div>
        <div class="power-tab-switcher__empty" hidden></div>
      </div>
    </div>
  `;
  shadowRoot.append(style, root);
  document.documentElement.appendChild(host);
  console.log('[QuickTabSwitcher][content] root mounted');

  const backdrop = root.querySelector<HTMLDivElement>('.power-tab-switcher__backdrop');
  const shell = root.querySelector<HTMLDivElement>('.power-tab-switcher');
  const list = root.querySelector<HTMLDivElement>('.power-tab-switcher__list');
  const empty = root.querySelector<HTMLDivElement>('.power-tab-switcher__empty');
  const searchInput = root.querySelector<HTMLInputElement>('.power-tab-switcher__search-input');
  const searchCount = root.querySelector<HTMLElement>('.power-tab-switcher__search-count');
  const previousButton = root.querySelector<HTMLButtonElement>('.power-tab-switcher__previous');
  const previousFavicon = root.querySelector<HTMLElement>('.power-tab-switcher__previous-favicon');
  const previousTitle = root.querySelector<HTMLElement>('.power-tab-switcher__previous-title');
  const previousSubtitle = root.querySelector<HTMLElement>('.power-tab-switcher__previous-subtitle');
  let allTabs: TabEntity[] = [];
  let visibleTabs: TabEntity[] = [];
  let previousTab: TabEntity | null = null;
  let labels = nextLabels;
  let query = '';
  let activeIndex = 0;
  let previewIndex = 0;
  const cardStore = new Map<number, HTMLButtonElement>();
  let activeCard: HTMLButtonElement | null = null;
  let previewCard: HTMLButtonElement | null = null;
  let isOpen = false;

  function render() {
    if (!backdrop || !list || !empty) return;

    backdrop.hidden = !isOpen;
    empty.hidden = visibleTabs.length !== 0;
    list.hidden = visibleTabs.length === 0;
    empty.textContent = query ? labels.noMatches : labels.empty;
    if (searchCount) {
      searchCount.textContent = query
        ? formatLabel(labels.searchCount, { visible: visibleTabs.length, total: allTabs.length })
        : formatLabel(labels.count, { count: allTabs.length });
    }

    syncCards();
    syncPreviousTab();
    updateHighlight();
  }

  function syncCards() {
    if (!list) return;

    const existing = new Map<string, HTMLButtonElement>();
    for (const child of list.querySelectorAll<HTMLButtonElement>('.power-tab-switcher__item')) {
      const id = child.dataset.tabId;
      if (id) existing.set(id, child);
    }
    cardStore.clear();

    const nextIds = new Set(visibleTabs.map((tab) => String(tab.id)));
    for (const [id, element] of existing) {
      if (!nextIds.has(id)) {
        element.remove();
      }
    }

    visibleTabs.forEach((tab, index) => {
      const id = String(tab.id);
      const existingCard = existing.get(id);
      const nextCard = existingCard ?? createCard(tab, index);
      list.appendChild(nextCard);
      nextCard.dataset.index = String(index);
      cardStore.set(index, nextCard);
      updateCard(nextCard, tab);
    });
  }

  function syncPreviousTab() {
    if (!previousButton || !previousFavicon || !previousTitle || !previousSubtitle) return;

    previousButton.hidden = !previousTab;
    if (!previousTab) return;

    previousTitle.textContent = previousTab.title;
    previousSubtitle.textContent = previousTab.hostname;
    previousButton.title = formatLabel(labels.previousTitle, { title: previousTab.title });
    renderFavicon(previousFavicon, previousTab);
  }

  function createCard(tab: TabEntity, index: number) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'power-tab-switcher__item';
    button.dataset.tabId = String(tab.id);
    button.dataset.index = String(index);
    button.innerHTML = '<span class="power-tab-switcher__headline"><span class="power-tab-switcher__favicon-shell"></span><span class="power-tab-switcher__title"></span><span class="power-tab-switcher__close" role="button" tabindex="0"><svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4 4L12 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M12 4L4 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span></span><span class="power-tab-switcher__subtitle"></span>';
    button.addEventListener('click', () => {
      const nextIndex = Number(button.dataset.index);
      void select(Number.isNaN(nextIndex) ? undefined : nextIndex);
    });
    button.addEventListener('pointerenter', () => {
      const nextIndex = Number(button.dataset.index);
      if (Number.isNaN(nextIndex)) return;
      previewIndex = nextIndex;
      updateHighlight();
    });
    button.addEventListener('focus', () => {
      const nextIndex = Number(button.dataset.index);
      if (Number.isNaN(nextIndex)) return;
      previewIndex = nextIndex;
      updateHighlight();
    });

    const closeButton = button.querySelector<HTMLElement>('.power-tab-switcher__close');
    if (closeButton) {
      closeButton.setAttribute('aria-label', labels.closeTab);
      closeButton.title = labels.closeTab;
    }
    closeButton?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const nextIndex = Number(button.dataset.index);
      if (Number.isNaN(nextIndex)) return;
      void closeAtIndex(nextIndex);
    });
    closeButton?.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      event.stopPropagation();
      const nextIndex = Number(button.dataset.index);
      if (Number.isNaN(nextIndex)) return;
      void closeAtIndex(nextIndex);
    });

    closeButton?.addEventListener('pointerenter', (event) => {
      event.stopPropagation();
      const nextIndex = Number(button.dataset.index);
      if (Number.isNaN(nextIndex)) return;
      previewIndex = nextIndex;
      updateHighlight();
    });
    return button;
  }

  function updateCard(button: HTMLButtonElement, tab: TabEntity) {
    const faviconShell = button.querySelector<HTMLElement>('.power-tab-switcher__favicon-shell');
    const title = button.querySelector<HTMLElement>('.power-tab-switcher__title');
    const subtitle = button.querySelector<HTMLElement>('.power-tab-switcher__subtitle');
    if (!faviconShell || !title || !subtitle) return;

    if (title.textContent !== tab.title) {
      title.textContent = tab.title;
    }
    title.dataset.currentLabel = labels.current;
    if (subtitle.textContent !== tab.hostname) {
      subtitle.textContent = tab.hostname;
    }

    renderFavicon(faviconShell, tab);
  }

  function renderFavicon(container: HTMLElement, tab: TabEntity) {
    const faviconUrl = tab.favIconUrl;
    const faviconKey = faviconUrl ? `icon:${faviconUrl}` : `fallback:${tab.hostname}`;
    if (container.dataset.faviconKey === faviconKey) {
      return;
    }

    container.dataset.faviconKey = faviconKey;
    container.replaceChildren();

    if (!faviconUrl) {
      container.appendChild(createFallbackFavicon(tab.hostname));
      return;
    }

    const image = document.createElement('img');
    image.className = 'power-tab-switcher__favicon';
    image.alt = tab.hostname;
    image.src = faviconUrl;
    image.referrerPolicy = 'no-referrer';
    image.decoding = 'async';
    image.addEventListener('error', () => {
      container.dataset.faviconKey = `fallback:${tab.hostname}`;
      container.replaceChildren(createFallbackFavicon(tab.hostname));
    }, { once: true });
    container.appendChild(image);
  }

  function createFallbackFavicon(hostname: string) {
    const fallback = document.createElement('span');
    fallback.className = 'power-tab-switcher__favicon power-tab-switcher__favicon--fallback';
    fallback.textContent = getHostnameInitialForSwitcher(hostname);
    return fallback;
  }

  function getHostnameInitialForSwitcher(hostname: string): string {
    const normalized = hostname.trim().replace(/^www\./i, '');
    const alphanumeric = normalized.match(/[A-Za-z0-9]/)?.[0];
    if (alphanumeric) {
      return alphanumeric.toUpperCase();
    }

    const firstChar = normalized.charAt(0);
    return firstChar ? firstChar.toUpperCase() : '•';
  }

  function updateHighlight() {
    for (const card of cardStore.values()) {
      card.classList.remove('power-tab-switcher__item--current', 'power-tab-switcher__item--preview');
    }

    const nextActiveCard = getCardByIndex(activeIndex);
    const nextPreviewCard = getCardByIndex(previewIndex);

    if (nextActiveCard) {
      nextActiveCard.classList.add('power-tab-switcher__item--current');
    }
    if (nextPreviewCard) {
      nextPreviewCard.classList.add('power-tab-switcher__item--preview');
    }

    activeCard = nextActiveCard;
    previewCard = nextPreviewCard;
  }

  function getCardByIndex(index: number): HTMLButtonElement | null {
    return cardStore.get(index) ?? null;
  }

  function open(
    nextTabs: TabEntity[],
    nextPreviousTab: TabEntity | null,
    nextLabels: QuickTabSwitcherLabels,
    advance: boolean,
  ) {
    const wasOpen = isOpen;
    allTabs = nextTabs;
    previousTab = nextPreviousTab;
    labels = nextLabels;
    query = '';
    if (searchInput) {
      searchInput.value = '';
    }
    syncStaticLabels();
    isOpen = true;
    applyFilter();

    if (visibleTabs.length === 0) {
      activeIndex = 0;
      previewIndex = 0;
      render();
      return;
    }

    activeIndex = visibleTabs.findIndex((tab) => tab.active);
    const baseIndex = activeIndex >= 0 ? activeIndex : 0;

    if (wasOpen && advance) {
      move(1);
      return;
    }

    previewIndex = advance ? (baseIndex + 1) % visibleTabs.length : baseIndex;
    render();
    queueMicrotask(() => searchInput?.focus({ preventScroll: true }));
  }

  function close() {
    isOpen = false;
    render();
  }

  function move(direction: 1 | -1) {
    if (visibleTabs.length === 0) return;
    previewIndex = (previewIndex + direction + visibleTabs.length) % visibleTabs.length;
    render();
  }

  function moveVertical(direction: 1 | -1) {
    if (!list || visibleTabs.length === 0) return;

    const cards = [...list.querySelectorAll<HTMLButtonElement>('.power-tab-switcher__item')];
    const currentCard = cards[previewIndex];
    if (!currentCard) return;

    const currentRect = currentCard.getBoundingClientRect();
    const currentCenterX = currentRect.left + currentRect.width / 2;
    const currentCenterY = currentRect.top + currentRect.height / 2;

    let bestIndex = -1;
    let bestScore = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      if (index === previewIndex) return;

      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaY = centerY - currentCenterY;

      if ((direction === 1 && deltaY <= 0) || (direction === -1 && deltaY >= 0)) {
        return;
      }

      const verticalDistance = Math.abs(deltaY);
      const horizontalDistance = Math.abs(centerX - currentCenterX);
      const score = verticalDistance * 1000 + horizontalDistance;

      if (score < bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });

    if (bestIndex >= 0) {
      previewIndex = bestIndex;
      updateHighlight();
      return;
    }

    move(direction);
  }

  async function select(index?: number) {
    if (typeof index === 'number') {
      previewIndex = index;
    }
    const tab = visibleTabs[previewIndex];
    console.log('[QuickTabSwitcher][content] select highlighted', tab);
    if (!tab) return;
    close();
    await chrome.runtime.sendMessage({ type: FOCUS_MESSAGE, tabId: tab.id, windowId: tab.windowId });
  }

  async function selectPrevious() {
    if (!previousTab) return;
    close();
    await chrome.runtime.sendMessage({ type: FOCUS_MESSAGE, tabId: previousTab.id, windowId: previousTab.windowId });
  }

  async function closeAtIndex(index: number) {
    const tab = visibleTabs[index];
    if (!tab) return;

    allTabs = allTabs.filter((candidate) => candidate.id !== tab.id);
    if (previousTab?.id === tab.id) {
      previousTab = null;
    }
    applyFilter();
    normalizeIndexes();
    render();

    await chrome.runtime.sendMessage({ type: CLOSE_MESSAGE, tabId: tab.id });
  }

  function applyFilter() {
    const normalizedQuery = query.trim().toLowerCase();
    visibleTabs = normalizedQuery
      ? allTabs.filter((tab) => getSearchText(tab).includes(normalizedQuery))
      : [...allTabs];
    normalizeIndexes();
  }

  function getSearchText(tab: TabEntity): string {
    return `${tab.title} ${tab.hostname} ${tab.url}`.toLowerCase();
  }

  function syncStaticLabels() {
    const title = root.querySelector<HTMLElement>('#power-tab-switcher-title');
    const hint = root.querySelector<HTMLElement>('.power-tab-switcher__hint');
    const previousLabel = root.querySelector<HTMLElement>('.power-tab-switcher__previous-label');
    const previousKey = root.querySelector<HTMLElement>('.power-tab-switcher__previous-key');
    if (title) title.textContent = labels.title;
    if (hint) hint.textContent = labels.hint;
    if (searchInput) searchInput.placeholder = labels.searchPlaceholder;
    if (previousLabel) previousLabel.textContent = labels.previous;
    if (previousKey) previousKey.textContent = labels.previousKey;
    for (const closeButton of root.querySelectorAll<HTMLElement>('.power-tab-switcher__close')) {
      closeButton.setAttribute('aria-label', labels.closeTab);
      closeButton.title = labels.closeTab;
    }
  }

  function formatLabel(template: string, replacements: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (match, key: string) => {
      const value = replacements[key];
      return value === undefined ? match : String(value);
    });
  }

  function normalizeIndexes() {
    if (visibleTabs.length === 0) {
      activeIndex = 0;
      previewIndex = 0;
      return;
    }

    activeIndex = visibleTabs.findIndex((tab) => tab.active);
    if (activeIndex < 0) {
      activeIndex = 0;
    }
    previewIndex = Math.min(Math.max(previewIndex, 0), visibleTabs.length - 1);
  }

  function onKeydown(event: KeyboardEvent) {
    if (!isOpen) return;
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      void selectPrevious();
      return;
    }
    if (event.key === 'Tab') {
      event.preventDefault();
      move(event.shiftKey ? -1 : 1);
      return;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      move(1);
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      move(-1);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveVertical(-1);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveVertical(1);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      void select();
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      if (query) {
        query = '';
        if (searchInput) {
          searchInput.value = '';
        }
        applyFilter();
        render();
        return;
      }
      close();
    }
  }

  searchInput?.addEventListener('input', () => {
    query = searchInput.value;
    previewIndex = 0;
    applyFilter();
    render();
  });

  previousButton?.addEventListener('click', () => {
    void selectPrevious();
  });

  backdrop?.addEventListener('click', () => {
    close();
  });

  shell?.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  document.addEventListener('keydown', onKeydown, true);
  window.addEventListener('blur', close);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      close();
    }
  });

  controllerWindow[CONTROLLER_KEY] = {
    open,
    updateCss(nextCssText: string) {
      style.textContent = nextCssText;
    },
  };

  syncStaticLabels();
  open(nextTabs, nextPreviousTab, nextLabels, advance);

}
