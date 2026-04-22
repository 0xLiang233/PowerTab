import { describe, expect, it } from 'vitest';
import { isLocalNetworkUrl, sanitizeFaviconUrl } from '@/shared/utils/url';

describe('isLocalNetworkUrl', () => {
  it('matches localhost and private ipv4 ranges', () => {
    expect(isLocalNetworkUrl('http://localhost/favicon.ico')).toBe(true);
    expect(isLocalNetworkUrl('http://127.0.0.1/favicon.ico')).toBe(true);
    expect(isLocalNetworkUrl('http://10.0.0.5/favicon.ico')).toBe(true);
    expect(isLocalNetworkUrl('http://172.16.1.5/favicon.ico')).toBe(true);
    expect(isLocalNetworkUrl('http://172.31.255.255/favicon.ico')).toBe(true);
    expect(isLocalNetworkUrl('http://192.168.1.8/favicon.ico')).toBe(true);
    expect(isLocalNetworkUrl('http://169.254.10.20/favicon.ico')).toBe(true);
  });

  it('matches private and link-local ipv6 ranges', () => {
    expect(isLocalNetworkUrl('http://[::1]/favicon.ico')).toBe(true);
    expect(isLocalNetworkUrl('http://[fc00::1]/favicon.ico')).toBe(true);
    expect(isLocalNetworkUrl('http://[fd12:3456::1]/favicon.ico')).toBe(true);
    expect(isLocalNetworkUrl('http://[fe80::1]/favicon.ico')).toBe(true);
  });

  it('does not match public or invalid urls', () => {
    expect(isLocalNetworkUrl('https://github.com/favicon.ico')).toBe(false);
    expect(isLocalNetworkUrl('http://172.15.1.1/favicon.ico')).toBe(false);
    expect(isLocalNetworkUrl('http://172.32.0.1/favicon.ico')).toBe(false);
    expect(isLocalNetworkUrl('not-a-url')).toBe(false);
    expect(isLocalNetworkUrl('data:image/png;base64,aaaa')).toBe(false);
  });
});

describe('sanitizeFaviconUrl', () => {
  it('removes local network favicon urls', () => {
    expect(sanitizeFaviconUrl('http://192.168.1.8/favicon.ico')).toBeUndefined();
    expect(sanitizeFaviconUrl('http://localhost/favicon.ico')).toBeUndefined();
    expect(sanitizeFaviconUrl('http://[::1]/favicon.ico')).toBeUndefined();
  });

  it('keeps public favicon urls', () => {
    expect(sanitizeFaviconUrl('https://github.com/favicon.ico')).toBe('https://github.com/favicon.ico');
    expect(sanitizeFaviconUrl(undefined)).toBeUndefined();
  });
});
