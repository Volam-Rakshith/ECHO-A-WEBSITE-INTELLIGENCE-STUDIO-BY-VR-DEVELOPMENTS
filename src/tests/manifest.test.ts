import { describe, it, expect } from 'vitest';
import { generateManifest, generatePlainTextSummary } from '../services/exportService';
import { AnalysisResult } from '../types';

describe('exportService', () => {
  const dummyAnalysis: AnalysisResult = {
    id: 'test-123',
    timestamp: 1729838400000,
    targetUrl: 'https://example.com',
    metadata: {
      url: 'https://example.com',
      domain: 'example.com',
      protocol: 'https:',
      title: 'Example Domain',
      description: 'An illustrative web page.',
      favicon: 'https://example.com/favicon.ico',
      language: 'en',
      charset: 'UTF-8',
      canonicalUrl: 'https://example.com',
      author: null,
      keywords: ['test', 'example'],
      viewport: 'width=device-width',
      generator: null,
      openGraph: {},
      twitterCard: {},
      security: {
        grade: 'A',
        score: 85,
        isHttps: true,
        hasCsp: true,
        hasXFrameOptions: true,
        hasXContentTypeOptions: true,
        hasHsts: true,
        notes: ['Secure Transport: SSL/TLS encryption active (HTTPS).'],
        riskPoints: [],
      },
      techStack: [
        {
          name: 'React',
          category: 'framework',
          confidence: 'HIGH',
          description: 'UI Library',
        },
      ],
      forms: [],
      schemas: [],
      mediaQueries: [],
    },
    resources: [
      {
        id: 'res-1',
        name: 'index.html',
        url: 'https://example.com',
        kind: 'html',
        status: 'RETRIEVED',
        content: '<html><body>Hello</body></html>',
        sizeBytes: 32,
      },
      {
        id: 'res-2',
        name: 'styles.css',
        url: 'https://example.com/styles.css',
        kind: 'stylesheet',
        status: 'DISCOVERED_ONLY',
      },
    ],
    colors: [
      {
        hex: '#0A0B0E',
        rgb: 'rgb(10, 11, 14)',
        hsl: 'hsl(225, 17%, 5%)',
        frequency: 1,
        role: 'background',
        contrastBlack: 1.1,
        contrastWhite: 18.2,
        wcagRating: 'AAA',
      },
    ],
    brand: {
      brandName: 'Example',
      logoUrl: null,
      faviconUrl: 'https://example.com/favicon.ico',
      fonts: [{ family: 'Inter', source: 'system' }],
      headingSamples: [],
      buttonStyles: [],
      shadowTokens: [],
      borderRadiusTokens: [],
      cssVariables: [],
    },
    content: {
      headings: [{ level: 1, text: 'Example Header' }],
      wordCount: 150,
      readingTimeMinutes: 1,
      paragraphs: ['Sample paragraph content.'],
      links: [{ text: 'More info', href: 'https://iana.org', isExternal: true }],
      images: [],
    },
    domTree: { id: 'dom-root', tag: 'html', classes: [], attributes: {}, childCount: 1 },
    relationships: { nodes: [], links: [] },
    diagnostics: [],
    stats: {
      htmlStatus: 'RETRIEVED',
      totalDiscovered: 2,
      totalRetrieved: 1,
      totalFailed: 0,
      totalSize: 32,
      analysisDurationMs: 450,
      primaryStrategy: 'Direct Browser Fetch',
      isPrivateOrLocal: false,
    },
  };

  it('generates compliant retrieval manifest', () => {
    const manifest: any = generateManifest(dummyAnalysis);
    expect(manifest.application).toContain('ECHO');
    expect(manifest.brand).toBe('VR DEVELOPMENTS');
    expect(manifest.target.domain).toBe('example.com');
    expect(manifest.retrievalAudit.totalRetrieved).toBe(1);
    expect(manifest.retrievalAudit.totalDiscovered).toBe(2);
    expect(manifest.resources[0].status).toBe('RETRIEVED');
    expect(manifest.resources[1].status).toBe('DISCOVERED_ONLY');
  });

  it('generates clean plain-text summary', () => {
    const summary = generatePlainTextSummary(dummyAnalysis);
    expect(summary).toContain('ECHO — EVERY WEBSITE. DECODED.');
    expect(summary).toContain('VR DEVELOPMENTS');
    expect(summary).toContain('Example Domain');
    expect(summary).toContain('Direct Browser Fetch');
  });
});
