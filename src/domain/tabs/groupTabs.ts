import { findDuplicateUrls } from '@/domain/tabs/findDuplicates';
import type { TabEntity, TabGroup } from '@/shared/types/models';

interface LandingPageRule {
  hostname: string;
  pathExact?: string[];
  test?: (pathname: string, href: string) => boolean;
}

const LANDING_PAGE_RULES: LandingPageRule[] = [
  {
    hostname: 'mail.google.com',
    test: (_pathname, href) =>
      !href.includes('#inbox/') && !href.includes('#sent/') && !href.includes('#search/'),
  },
  { hostname: 'x.com', pathExact: ['/home'] },
  { hostname: 'www.linkedin.com', pathExact: ['/'] },
  { hostname: 'github.com', pathExact: ['/'] },
  { hostname: 'www.youtube.com', pathExact: ['/'] },
];

export function isLandingPageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return LANDING_PAGE_RULES.some((rule) => {
      if (rule.hostname !== url.hostname) return false;
      if (rule.test) return rule.test(url.pathname, value);
      if (rule.pathExact) return rule.pathExact.includes(url.pathname);
      return url.pathname === '/';
    });
  } catch {
    return false;
  }
}

export function groupTabs(tabs: TabEntity[]): TabGroup[] {
  const map = new Map<string, TabGroup>();

  for (const tab of tabs) {
    const key = tab.isLandingPage ? '__landing-pages__' : tab.hostname || 'unknown';
    const label = tab.isLandingPage ? 'Homepages' : friendlyDomain(tab.hostname);

    if (!map.has(key)) {
      map.set(key, {
        id: key,
        domain: key,
        label,
        tabs: [],
        duplicateUrls: [],
      });
    }

    map.get(key)?.tabs.push(tab);
  }

  const groups = [...map.values()].map((group) => ({
    ...group,
    duplicateUrls: findDuplicateUrls(group.tabs),
    tabs: group.tabs.slice().sort((a, b) => Number(b.active) - Number(a.active)),
  }));

  return groups.sort((a, b) => {
    if (a.id === '__landing-pages__') return -1;
    if (b.id === '__landing-pages__') return 1;
    if (b.tabs.length !== a.tabs.length) return b.tabs.length - a.tabs.length;
    return a.label.localeCompare(b.label);
  });
}

function friendlyDomain(hostname: string): string {
  const special: Record<string, string> = {
    'github.com': 'GitHub',
    'mail.google.com': 'Gmail',
    'claude.ai': 'Claude',
    'www.youtube.com': 'YouTube',
    'localhost': 'Localhost',
  };

  if (special[hostname]) return special[hostname];
  return hostname.replace(/^www\./, '');
}
