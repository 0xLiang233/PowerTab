import { getSettings } from '@/features/settings/services/settingsRepository';
import { updateBadge } from '@/features/tabs/services/badgeService';
import { focusTab } from '@/infrastructure/chrome/tabGateway';
import { getWindowTabs } from '@/features/tabs/services/tabsService';
import {
  QUICK_TAB_SWITCHER_COMMAND,
  QUICK_TAB_SWITCHER_FOCUS_MESSAGE,
  QUICK_TAB_SWITCHER_OPEN_MESSAGE,
} from '@/shared/constants/quickTabSwitcher';
import { QUICK_TAB_SWITCHER_CSS } from '@/shared/constants/quickTabSwitcherStyles';
import type { QuickTabSwitcherFocusMessage, QuickTabSwitcherOpenMessage, TabEntity } from '@/shared/types/models';

function refreshBadge() {
  void updateBadge();
}

console.log('[QuickTabSwitcher][background] service worker booted');

chrome.runtime.onInstalled.addListener(refreshBadge);
chrome.runtime.onStartup.addListener(refreshBadge);
chrome.tabs.onCreated.addListener(refreshBadge);
chrome.tabs.onRemoved.addListener(refreshBadge);
chrome.tabs.onUpdated.addListener(refreshBadge);
chrome.commands.onCommand.addListener((command) => {
  console.log('[QuickTabSwitcher][background] command received', command);
  void handleCommand(command, 'command');
});
chrome.action.onClicked.addListener((tab) => {
  console.log('[QuickTabSwitcher][background] action clicked', tab);
  void handleCommand(QUICK_TAB_SWITCHER_COMMAND, 'action');
});
chrome.runtime.onMessage.addListener((message: unknown) => {
  if (!isFocusMessage(message)) return;
  console.log('[QuickTabSwitcher][background] focus request', message);
  void focusTab(message.tabId, message.windowId);
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
    await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: mountQuickTabSwitcher,
      args: [QUICK_TAB_SWITCHER_CSS],
    });
    console.log('[QuickTabSwitcher][background] inline switcher mounted');

    const tabs = await getWindowTabs(activeTab.windowId);
    console.log('[QuickTabSwitcher][background] window tabs', tabs.length, tabs);

    const message: QuickTabSwitcherOpenMessage = {
      type: QUICK_TAB_SWITCHER_OPEN_MESSAGE,
      tabs,
      advance: true,
    };

    await chrome.tabs.sendMessage(activeTab.id, message);
    console.log('[QuickTabSwitcher][background] open message sent');
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

function mountQuickTabSwitcher(cssText: string) {
  const ROOT_ID = 'power-tab-quick-tab-switcher-root';
  const STYLE_ID = 'power-tab-quick-tab-switcher-style';
  const OPEN_MESSAGE = 'power-tab:open-quick-tab-switcher';
  const FOCUS_MESSAGE = 'power-tab:focus-quick-tab';

  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = cssText;
    document.documentElement.appendChild(style);
  }

  if (document.getElementById(ROOT_ID)) {
    console.log('[QuickTabSwitcher][content] root already mounted');
    return;
  }

  const root = document.createElement('div');
  root.id = ROOT_ID;
  root.innerHTML = `
    <div class="power-tab-switcher__backdrop" hidden>
      <div class="power-tab-switcher" role="dialog" aria-modal="true" aria-labelledby="power-tab-switcher-title">
        <div class="power-tab-switcher__header">
          <div id="power-tab-switcher-title" class="power-tab-switcher__label">Quick Tab Switcher</div>
          <div class="power-tab-switcher__hint">Alt+Q · Tab / ← / → · Enter</div>
        </div>
        <div class="power-tab-switcher__list" role="listbox" aria-label="Open tabs"></div>
        <div class="power-tab-switcher__empty" hidden>No switchable tabs in this window.</div>
      </div>
    </div>
  `;
  document.documentElement.appendChild(root);
  console.log('[QuickTabSwitcher][content] root mounted');

  const backdrop = root.querySelector('.power-tab-switcher__backdrop');
  const shell = root.querySelector('.power-tab-switcher');
  const list = root.querySelector('.power-tab-switcher__list');
  const empty = root.querySelector('.power-tab-switcher__empty');
  let tabs: TabEntity[] = [];
  let highlightedIndex = 0;
  let isOpen = false;

  function render() {
    if (!backdrop || !list || !empty) return;

    backdrop.hidden = !isOpen;
    empty.hidden = tabs.length !== 0;
    list.hidden = tabs.length === 0;

    syncCards();
    updateHighlight();
  }

  function syncCards() {
    if (!list) return;

    const existing = new Map<string, HTMLButtonElement>();
    for (const child of list.querySelectorAll<HTMLButtonElement>('.power-tab-switcher__item')) {
      const id = child.dataset.tabId;
      if (id) existing.set(id, child);
    }

    const nextIds = new Set(tabs.map((tab) => String(tab.id)));
    for (const [id, element] of existing) {
      if (!nextIds.has(id)) {
        element.remove();
      }
    }

    tabs.forEach((tab, index) => {
      const id = String(tab.id);
      const existingCard = existing.get(id);
      const nextCard = existingCard ?? createCard(tab, index);
      if (!existingCard) {
        list.appendChild(nextCard);
      }
      nextCard.dataset.index = String(index);
      updateCard(nextCard, tab);
    });
  }

  function createCard(tab: TabEntity, index: number) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'power-tab-switcher__item';
    button.dataset.tabId = String(tab.id);
    button.dataset.index = String(index);
    button.innerHTML = '<span class="power-tab-switcher__favicon-shell"></span><span class="power-tab-switcher__meta"><span class="power-tab-switcher__title"></span><span class="power-tab-switcher__subtitle"></span></span>';
    button.addEventListener('click', () => {
      const nextIndex = Number(button.dataset.index);
      void select(Number.isNaN(nextIndex) ? undefined : nextIndex);
    });
    return button;
  }

  function updateCard(button: HTMLButtonElement, tab: TabEntity) {
    const faviconShell = button.querySelector<HTMLElement>('.power-tab-switcher__favicon-shell');
    const title = button.querySelector<HTMLElement>('.power-tab-switcher__title');
    const subtitle = button.querySelector<HTMLElement>('.power-tab-switcher__subtitle');
    if (!faviconShell || !title || !subtitle) return;

    title.textContent = tab.title;
    subtitle.textContent = tab.hostname;
    renderFavicon(faviconShell, tab);
  }

  function renderFavicon(container: HTMLElement, tab: TabEntity) {
    container.innerHTML = '';

    if (!tab.favIconUrl) {
      container.appendChild(createFallbackFavicon(tab.hostname));
      return;
    }

    const image = document.createElement('img');
    image.className = 'power-tab-switcher__favicon';
    image.alt = tab.hostname;
    image.src = tab.favIconUrl;
    image.addEventListener('error', () => {
      container.innerHTML = '';
      container.appendChild(createFallbackFavicon(tab.hostname));
    }, { once: true });
    container.appendChild(image);
  }

  function createFallbackFavicon(hostname: string) {
    const fallback = document.createElement('span');
    fallback.className = 'power-tab-switcher__favicon power-tab-switcher__favicon--fallback';
    fallback.textContent = hostname.slice(0, 1).toUpperCase() || '•';
    return fallback;
  }

  function updateHighlight() {
    if (!list) return;

    const cards = [...list.querySelectorAll<HTMLButtonElement>('.power-tab-switcher__item')];
    cards.forEach((card, index) => {
      card.classList.toggle('power-tab-switcher__item--active', index === highlightedIndex);
    });
  }

  function open(nextTabs: TabEntity[], advance: boolean) {
    const wasOpen = isOpen;
    tabs = nextTabs;
    isOpen = true;

    if (tabs.length === 0) {
      highlightedIndex = 0;
      render();
      return;
    }

    if (wasOpen && advance) {
      move(1);
      return;
    }

    const activeIndex = tabs.findIndex((tab) => tab.active);
    const baseIndex = activeIndex >= 0 ? activeIndex : 0;
    highlightedIndex = advance ? (baseIndex + 1) % tabs.length : baseIndex;
    render();
  }

  function close() {
    isOpen = false;
    render();
  }

  function move(direction: 1 | -1) {
    if (tabs.length === 0) return;
    highlightedIndex = (highlightedIndex + direction + tabs.length) % tabs.length;
    render();
  }

  async function select(index?: number) {
    if (typeof index === 'number') {
      highlightedIndex = index;
    }
    const tab = tabs[highlightedIndex];
    console.log('[QuickTabSwitcher][content] select highlighted', tab);
    if (!tab) return;
    close();
    await chrome.runtime.sendMessage({ type: FOCUS_MESSAGE, tabId: tab.id, windowId: tab.windowId });
  }

  function onKeydown(event: KeyboardEvent) {
    if (!isOpen) return;
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
    if (event.key === 'Enter') {
      event.preventDefault();
      void select();
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  }

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
  chrome.runtime.onMessage.addListener((message: unknown) => {
    if (!message || typeof message !== 'object') return;
    const candidate = message as Partial<QuickTabSwitcherOpenMessage>;
    if (candidate.type !== OPEN_MESSAGE || !Array.isArray(candidate.tabs) || typeof candidate.advance !== 'boolean') return;
    console.log('[QuickTabSwitcher][content] open message received', candidate);
    open(candidate.tabs as TabEntity[], candidate.advance);
  });

}
