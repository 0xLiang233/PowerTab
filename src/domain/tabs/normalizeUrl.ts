export function normalizeUrl(input: string): string {
  try {
    const url = new URL(input);
    url.hash = '';

    const removableParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    for (const key of removableParams) {
      url.searchParams.delete(key);
    }

    const pathname = url.pathname.replace(/\/$/, '') || '/';
    const port = url.port ? `:${url.port}` : '';
    const query = url.searchParams.toString();

    return `${url.protocol}//${url.hostname}${port}${pathname}${query ? `?${query}` : ''}`;
  } catch {
    return input.trim();
  }
}
