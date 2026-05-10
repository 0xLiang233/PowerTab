import { translate } from '@/shared/i18n';
import type { Language } from '@/shared/types/models';

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

export function formatReadLaterAge(createdAt: string, now = Date.now(), language?: Language): string {
  const age = Math.max(0, now - Date.parse(createdAt));
  if (age < HOUR) {
    const minutes = Math.max(1, Math.floor(age / MINUTE));
    return translate('readLater.age.minutes', { count: minutes, plural: minutes === 1 ? '' : 's' }, language);
  }
  if (age < DAY) {
    const hours = Math.floor(age / HOUR);
    return translate('readLater.age.hours', { count: hours, plural: hours === 1 ? '' : 's' }, language);
  }
  const days = Math.floor(age / DAY);
  return translate('readLater.age.days', { count: days, plural: days === 1 ? '' : 's' }, language);
}
