export type ReadLaterAgeTone = 'fresh' | 'attention' | 'stale' | 'urgent';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function getReadLaterAgeTone(createdAt: string, now = Date.now()): ReadLaterAgeTone {
  const age = Math.max(0, now - Date.parse(createdAt));
  if (age >= 7 * DAY) return 'urgent';
  if (age >= 3 * DAY) return 'stale';
  if (age >= DAY) return 'attention';
  return 'fresh';
}

export function formatReadLaterAge(createdAt: string, now = Date.now()): string {
  const age = Math.max(0, now - Date.parse(createdAt));
  if (age < HOUR) {
    const minutes = Math.max(1, Math.floor(age / MINUTE));
    return `Added ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }
  if (age < DAY) {
    const hours = Math.floor(age / HOUR);
    return `Added ${hours} hour${hours === 1 ? '' : 's'} ago`;
  }
  const days = Math.floor(age / DAY);
  return `Added ${days} day${days === 1 ? '' : 's'} ago`;
}
