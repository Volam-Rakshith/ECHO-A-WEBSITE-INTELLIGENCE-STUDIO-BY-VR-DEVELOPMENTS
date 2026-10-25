import { describe, it, expect } from 'vitest';
import {
  normalizeUrl,
  isValidHttpUrl,
  extractDomain,
  resolveUrl,
  isGitHubRepoUrl,
  formatBytes,
  isPrivateOrLocalUrl,
} from '../services/urlUtils';

describe('urlUtils', () => {
  it('normalizes URLs without protocol to https:// (or http:// for localhost)', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com/');
    expect(normalizeUrl('https://example.com/test')).toBe('https://example.com/test');
    expect(normalizeUrl('localhost:3000')).toBe('http://localhost:3000/');
  });

  it('validates http and https URLs correctly', () => {
    expect(isValidHttpUrl('https://example.com')).toBe(true);
    expect(isValidHttpUrl('http://localhost:8080')).toBe(true);
    expect(isValidHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isValidHttpUrl('data:text/html,<h1>test</h1>')).toBe(false);
  });

  it('identifies private, local, and intranet network URLs', () => {
    expect(isPrivateOrLocalUrl('http://localhost:3000')).toBe(true);
    expect(isPrivateOrLocalUrl('http://127.0.0.1:8000')).toBe(true);
    expect(isPrivateOrLocalUrl('http://192.168.1.10')).toBe(true);
    expect(isPrivateOrLocalUrl('http://internal-dashboard.local')).toBe(true);
    expect(isPrivateOrLocalUrl('https://example.com')).toBe(false);
  });

  it('extracts domain cleanly', () => {
    expect(extractDomain('https://sub.example.com/path?query=1')).toBe('sub.example.com');
    expect(extractDomain('example.org/about')).toBe('example.org');
  });

  it('resolves relative URLs against base URL safely', () => {
    expect(resolveUrl('/assets/style.css', 'https://example.com/blog/')).toBe('https://example.com/assets/style.css');
    expect(resolveUrl('image.png', 'https://example.com/blog/')).toBe('https://example.com/blog/image.png');
    expect(resolveUrl('//cdn.example.com/lib.js', 'https://example.com')).toBe('https://cdn.example.com/lib.js');
    expect(resolveUrl('data:image/png;base64,123', 'https://example.com')).toBe('data:image/png;base64,123');
  });

  it('identifies GitHub repository URLs', () => {
    expect(isGitHubRepoUrl('https://github.com/torvalds/linux')).toEqual({
      isRepo: true,
      owner: 'torvalds',
      repo: 'linux',
    });
    expect(isGitHubRepoUrl('https://github.com/explore')).toEqual({
      isRepo: false,
    });
  });

  it('formats bytes into clean human readable strings', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(2500000)).toBe('2.4 MB');
  });
});
