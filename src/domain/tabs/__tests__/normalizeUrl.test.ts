import { describe, expect, it } from 'vitest';
import { normalizeUrl } from '@/domain/tabs/normalizeUrl';

describe('normalizeUrl', () => {
  it('removes hash and trailing slash', () => {
    expect(normalizeUrl('https://example.com/path/#section')).toBe('https://example.com/path');
  });

  it('removes utm params', () => {
    expect(normalizeUrl('https://example.com/?utm_source=x&foo=1')).toBe('https://example.com/?foo=1');
  });
});
