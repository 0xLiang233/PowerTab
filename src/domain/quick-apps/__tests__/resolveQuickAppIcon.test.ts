import { describe, expect, it } from 'vitest';
import { createQuickAppFallbackIcon } from '@/domain/quick-apps/resolveQuickAppIcon';

describe('createQuickAppFallbackIcon', () => {
  it('uses the first hostname letter', () => {
    const icon = createQuickAppFallbackIcon('https://google.com');
    expect(icon).toContain('G');
  });

  it('strips www before picking the letter', () => {
    const icon = createQuickAppFallbackIcon('https://www.youtube.com');
    expect(icon).toContain('Y');
  });
});
