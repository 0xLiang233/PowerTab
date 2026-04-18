import { describe, expect, it } from 'vitest';
import { classifyInput, resolveAddressBarUrl } from '@/domain/search/classifyInput';

describe('classifyInput', () => {
  it('detects hostname-like input', () => {
    expect(classifyInput('github.com').isLikelyUrl).toBe(true);
  });

  it('resolves hostnames to full URLs', () => {
    expect(resolveAddressBarUrl('github.com')).toBe('https://github.com/');
  });
});
