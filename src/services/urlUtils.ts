export function normalizeUrl(input: string): string {
  let trimmed = input.trim();
  if (!trimmed) return '';

  // If no protocol is specified, check if it's localhost or an IP, default to http://, else https://
  if (!/^https?:\/\//i.test(trimmed)) {
    if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.|10\.)/i.test(trimmed)) {
      trimmed = 'http://' + trimmed;
    } else {
      trimmed = 'https://' + trimmed;
    }
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.href;
  } catch {
    return trimmed;
  }
}

export function isValidHttpUrl(input: string): boolean {
  try {
    const url = new URL(normalizeUrl(input));
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isPrivateOrLocalUrl(url: string): boolean {
  try {
    const parsed = new URL(normalizeUrl(url));
    const host = parsed.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      host.endsWith('.lan') ||
      host.endsWith('.test') ||
      host.endsWith('.localhost')
    ) {
      return true;
    }
    // Private IPv4 ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
    if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
  } catch {
    // ignore
  }
  return false;
}

export function extractDomain(url: string): string {
  try {
    const parsed = new URL(normalizeUrl(url));
    return parsed.hostname;
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0] || url;
  }
}

export function resolveUrl(relativeOrAbsolute: string, baseUrl: string): string {
  try {
    if (!relativeOrAbsolute) return '';
    // If it's a data URL or blob, return as is
    if (relativeOrAbsolute.startsWith('data:') || relativeOrAbsolute.startsWith('blob:')) {
      return relativeOrAbsolute;
    }
    // Protocol-relative URL //cdn.example.com
    if (relativeOrAbsolute.startsWith('//')) {
      const baseProto = baseUrl.startsWith('http:') ? 'http:' : 'https:';
      return `${baseProto}${relativeOrAbsolute}`;
    }
    return new URL(relativeOrAbsolute, baseUrl).href;
  } catch {
    return relativeOrAbsolute;
  }
}

export function isGitHubRepoUrl(url: string): { isRepo: boolean; owner?: string; repo?: string } {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'github.com') {
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts.length >= 2 && !['explore', 'features', 'pricing', 'login', 'signup'].includes(parts[0])) {
        return { isRepo: true, owner: parts[0], repo: parts[1] };
      }
    }
  } catch {
    // ignore
  }
  return { isRepo: false };
}

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const safeI = Math.min(i, sizes.length - 1);
  return parseFloat((bytes / Math.pow(k, safeI)).toFixed(dm)) + ' ' + sizes[safeI];
}
