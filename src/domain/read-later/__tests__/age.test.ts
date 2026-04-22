import { describe, expect, it } from 'vitest';
import { formatReadLaterAge, getReadLaterAgeTone } from '@/domain/read-later/age';

describe('getReadLaterAgeTone', () => {
  const now = Date.parse('2026-04-22T12:00:00.000Z');

  it('marks recent items as fresh', () => {
    expect(getReadLaterAgeTone('2026-04-22T10:30:00.000Z', now)).toBe('fresh');
  });

  it('escalates item tone as age increases', () => {
    expect(getReadLaterAgeTone('2026-04-21T10:30:00.000Z', now)).toBe('attention');
    expect(getReadLaterAgeTone('2026-04-18T10:30:00.000Z', now)).toBe('stale');
    expect(getReadLaterAgeTone('2026-04-14T10:30:00.000Z', now)).toBe('urgent');
  });
});

describe('formatReadLaterAge', () => {
  const now = Date.parse('2026-04-22T12:00:00.000Z');

  it('formats minute and hour labels', () => {
    expect(formatReadLaterAge('2026-04-22T11:45:00.000Z', now)).toBe('Added 15 minutes ago');
    expect(formatReadLaterAge('2026-04-22T09:00:00.000Z', now)).toBe('Added 3 hours ago');
  });

  it('formats day labels', () => {
    expect(formatReadLaterAge('2026-04-20T12:00:00.000Z', now)).toBe('Added 2 days ago');
  });
});
