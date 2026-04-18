import { listOpenTabs } from '@/infrastructure/chrome/tabGateway';

export async function updateBadge(): Promise<void> {
  try {
    const tabs = await listOpenTabs();
    const count = tabs.length;

    await chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' });
    if (count === 0) return;

    let color = '#3d7a4a';
    if (count > 20) {
      color = '#b35a5a';
    } else if (count > 10) {
      color = '#b8892e';
    }

    await chrome.action.setBadgeBackgroundColor({ color });
  } catch {
    await chrome.action.setBadgeText({ text: '' });
  }
}
