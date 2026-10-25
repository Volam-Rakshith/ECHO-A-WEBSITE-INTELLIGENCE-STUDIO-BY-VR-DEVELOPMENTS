import {
  WebsiteMetadata,
  ContentAnalysis,
  DOMTreeNode,
  RelationshipNode,
  RelationshipLink,
  HeadingItem,
  LinkItem,
  ImageItem,
  FormAuditItem,
  SchemaJsonLd,
  MediaQueryToken,
  SecurityAudit,
} from '../types';
import { resolveUrl, extractDomain } from './urlUtils';
import { detectTechStack } from './techStackDetector';

export interface ParsedHtmlResult {
  metadata: WebsiteMetadata;
  content: ContentAnalysis;
  domTree: DOMTreeNode;
  relationships: {
    nodes: RelationshipNode[];
    links: RelationshipLink[];
  };
  discoveredResources: Array<{
    url: string;
    kind: 'stylesheet' | 'script' | 'image' | 'font' | 'manifest';
    name: string;
    isInline?: boolean;
    content?: string;
  }>;
}

export function parseHtmlDocument(
  html: string,
  baseUrl: string,
  responseHeaders?: Record<string, string>
): ParsedHtmlResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const domain = extractDomain(baseUrl);
  const protocol = baseUrl.startsWith('https:') ? 'https:' : 'http:';

  // 1. Extract Metadata
  const title =
    doc.querySelector('title')?.textContent?.trim() ||
    doc.querySelector('meta[property="og:title"]')?.getAttribute('content')?.trim() ||
    doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content')?.trim() ||
    doc.querySelector('h1')?.textContent?.trim() ||
    'Untitled Target Page';

  const description =
    doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() ||
    doc.querySelector('meta[property="og:description"]')?.getAttribute('content')?.trim() ||
    doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content')?.trim() ||
    '';

  let favicon: string | null = null;
  const iconLink =
    doc.querySelector('link[rel~="icon"]') ||
    doc.querySelector('link[rel="shortcut icon"]') ||
    doc.querySelector('link[rel="apple-touch-icon"]');

  if (iconLink) {
    const href = iconLink.getAttribute('href');
    if (href) favicon = resolveUrl(href, baseUrl);
  }
  if (!favicon) {
    favicon = resolveUrl('/favicon.ico', baseUrl);
  }

  const canonicalLink = doc.querySelector('link[rel="canonical"]')?.getAttribute('href');
  const canonicalUrl = canonicalLink ? resolveUrl(canonicalLink, baseUrl) : null;

  const language = doc.documentElement.getAttribute('lang') || 'en (default)';
  const charset =
    doc.querySelector('meta[charset]')?.getAttribute('charset') ||
    doc.querySelector('meta[http-equiv="Content-Type" i]')?.getAttribute('content')?.match(/charset=([^;]+)/i)?.[1] ||
    'UTF-8';

  const author = doc.querySelector('meta[name="author"]')?.getAttribute('content') || null;
  const keywordsStr = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
  const keywords = keywordsStr
    ? keywordsStr.split(',').map(k => k.trim()).filter(Boolean)
    : [];

  const viewport = doc.querySelector('meta[name="viewport"]')?.getAttribute('content') || null;
  const generator = doc.querySelector('meta[name="generator"]')?.getAttribute('content') || null;

  // Open Graph
  const openGraph: Record<string, string> = {};
  doc.querySelectorAll('meta[property^="og:"]').forEach(el => {
    const prop = el.getAttribute('property');
    const content = el.getAttribute('content');
    if (prop && content) openGraph[prop] = content;
  });

  // Twitter Cards
  const twitterCard: Record<string, string> = {};
  doc.querySelectorAll('meta[name^="twitter:"]').forEach(el => {
    const name = el.getAttribute('name');
    const content = el.getAttribute('content');
    if (name && content) twitterCard[name] = content;
  });

  // 2. Discover Linked Resources
  const discoveredResources: Array<{
    url: string;
    kind: 'stylesheet' | 'script' | 'image' | 'font' | 'manifest';
    name: string;
    isInline?: boolean;
    content?: string;
  }> = [];

  const scriptUrls: string[] = [];
  const styleUrls: string[] = [];
  const inlineStyles: string[] = [];

  // Stylesheets
  doc.querySelectorAll('link[rel="stylesheet"]').forEach((link, idx) => {
    const href = link.getAttribute('href');
    if (href) {
      const fullUrl = resolveUrl(href, baseUrl);
      const name = fullUrl.split('/').pop()?.split('?')[0] || `style-${idx + 1}.css`;
      discoveredResources.push({ url: fullUrl, kind: 'stylesheet', name });
      styleUrls.push(fullUrl);
    }
  });

  // Inline <style> blocks
  doc.querySelectorAll('style').forEach((styleEl, idx) => {
    const styleContent = styleEl.textContent || '';
    if (styleContent.trim().length > 0) {
      discoveredResources.push({
        url: `${baseUrl}#inline-style-${idx + 1}`,
        kind: 'stylesheet',
        name: `inline-style-${idx + 1}.css`,
        isInline: true,
        content: styleContent,
      });
      inlineStyles.push(styleContent);
    }
  });

  // Scripts: <script src="...">
  doc.querySelectorAll('script[src]').forEach((script, idx) => {
    const src = script.getAttribute('src');
    if (src) {
      const fullUrl = resolveUrl(src, baseUrl);
      const name = fullUrl.split('/').pop()?.split('?')[0] || `script-${idx + 1}.js`;
      discoveredResources.push({ url: fullUrl, kind: 'script', name });
      scriptUrls.push(fullUrl);
    }
  });

  // Inline <script> blocks
  doc.querySelectorAll('script:not([src])').forEach((scriptEl, idx) => {
    const scriptType = scriptEl.getAttribute('type') || 'text/javascript';
    if (!['application/ld+json', 'text/template'].includes(scriptType)) {
      const scriptContent = scriptEl.textContent || '';
      if (scriptContent.trim().length > 0) {
        discoveredResources.push({
          url: `${baseUrl}#inline-script-${idx + 1}`,
          kind: 'script',
          name: `inline-script-${idx + 1}.js`,
          isInline: true,
          content: scriptContent,
        });
      }
    }
  });

  // Web App Manifest
  const manifestLink = doc.querySelector('link[rel="manifest"]')?.getAttribute('href');
  if (manifestLink) {
    const fullUrl = resolveUrl(manifestLink, baseUrl);
    discoveredResources.push({ url: fullUrl, kind: 'manifest', name: 'manifest.json' });
  }

  // Images
  const imageItems: ImageItem[] = [];
  doc.querySelectorAll('img').forEach((img, idx) => {
    const src = img.getAttribute('src') || img.getAttribute('data-src');
    const alt = img.getAttribute('alt') ?? '';
    const hasAlt = img.hasAttribute('alt');
    const isDecorative = hasAlt && alt.trim() === '';

    if (src) {
      const fullUrl = resolveUrl(src, baseUrl);
      const name = fullUrl.split('/').pop()?.split('?')[0] || `image-${idx + 1}`;
      discoveredResources.push({ url: fullUrl, kind: 'image', name });
      imageItems.push({
        src: fullUrl,
        alt,
        hasAlt,
        isDecorative,
      });
    }
  });

  // 3. Extract JSON-LD Schemas
  const schemas: SchemaJsonLd[] = [];
  doc.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
    const raw = s.textContent?.trim();
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        schemas.push({
          type: parsed['@type'] || (Array.isArray(parsed) ? 'Array Schema' : 'Schema Object'),
          raw,
          parsed,
        });
      } catch {
        schemas.push({ type: 'Malformed JSON-LD', raw });
      }
    }
  });

  // 4. Extract Form Audits
  const forms: FormAuditItem[] = [];
  doc.querySelectorAll('form').forEach(f => {
    const inputs: Array<{ name: string; type: string; required: boolean }> = [];
    let hasCsrf = false;

    f.querySelectorAll('input, select, textarea').forEach(inp => {
      const name = inp.getAttribute('name') || '';
      const type = inp.getAttribute('type') || inp.tagName.toLowerCase();
      const required = inp.hasAttribute('required');

      if (/csrf|xsrf|token|_token|authenticity/i.test(name)) {
        hasCsrf = true;
      }

      if (name) {
        inputs.push({ name, type, required });
      }
    });

    forms.push({
      id: f.id || undefined,
      name: f.getAttribute('name') || undefined,
      action: f.getAttribute('action') ? resolveUrl(f.getAttribute('action')!, baseUrl) : baseUrl,
      method: (f.getAttribute('method') || 'GET').toUpperCase(),
      inputCount: inputs.length,
      inputs: inputs.slice(0, 15),
      hasCsrf,
    });
  });

  // 5. Extract Media Queries & Breakpoints
  const mediaQueries: MediaQueryToken[] = [];
  const allCssText = [html, ...inlineStyles].join('\n');
  const mqMatches = allCssText.match(/@media\s*\(([^)]+)\)/gi);
  if (mqMatches) {
    const mqSet = new Set<string>();
    mqMatches.slice(0, 20).forEach(m => {
      const query = m.replace(/@media\s*/i, '').trim();
      if (!mqSet.has(query)) {
        mqSet.add(query);
        let type: MediaQueryToken['type'] = 'other';
        if (query.includes('max-width: 6') || query.includes('max-width: 7') || query.includes('max-width: 4')) {
          type = 'mobile';
        } else if (query.includes('max-width: 10') || query.includes('min-width: 7')) {
          type = 'tablet';
        } else if (query.includes('min-width: 1')) {
          type = 'desktop';
        } else if (query.includes('prefers-color-scheme')) {
          type = 'dark-mode';
        } else if (query.includes('print')) {
          type = 'print';
        }
        mediaQueries.push({ query, type });
      }
    });
  }

  // 6. Security & Header Audit
  const isHttps = protocol === 'https:';
  const cspMeta = doc.querySelector('meta[http-equiv="Content-Security-Policy" i]');
  const referrerMeta = doc.querySelector('meta[name="referrer" i]')?.getAttribute('content') || undefined;

  let score = 40;
  const notes: string[] = [];
  const riskPoints: string[] = [];

  if (isHttps) {
    score += 30;
    notes.push('Transport Layer Security: Encrypted HTTPS connection active.');
  } else {
    riskPoints.push('Insecure Protocol: Plaintext HTTP transmission exposes traffic to MITM eavesdropping.');
  }

  const hasCsp = !!cspMeta || !!responseHeaders?.['content-security-policy'];
  if (hasCsp) {
    score += 15;
    notes.push('Content Security Policy (CSP): Enforces script execution and asset origin boundaries.');
  } else {
    riskPoints.push('Missing CSP: No Content-Security-Policy header or meta tag detected.');
  }

  const hasHsts = isHttps;
  if (hasHsts) score += 10;

  let grade: SecurityAudit['grade'] = 'C';
  if (score >= 90) grade = 'A+';
  else if (score >= 80) grade = 'A';
  else if (score >= 65) grade = 'B';
  else if (score >= 50) grade = 'C';
  else grade = 'F';

  const security: SecurityAudit = {
    grade,
    score,
    isHttps,
    hasHsts,
    hasCsp,
    hasXFrameOptions: !!responseHeaders?.['x-frame-options'],
    hasXContentTypeOptions: !!responseHeaders?.['x-content-type-options'],
    referrerPolicy: referrerMeta,
    notes,
    riskPoints,
  };

  // 7. Tech Stack Detection
  const techStack = detectTechStack(html, doc, scriptUrls, styleUrls);

  const metadata: WebsiteMetadata = {
    url: baseUrl,
    domain,
    protocol,
    title,
    description,
    favicon,
    language,
    charset,
    canonicalUrl,
    author,
    keywords,
    viewport,
    generator,
    openGraph,
    twitterCard,
    headers: responseHeaders,
    security,
    techStack,
    forms,
    schemas,
    mediaQueries,
  };

  // 8. Content Extraction
  const headings: HeadingItem[] = [];
  doc.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
    const level = parseInt(h.tagName.substring(1), 10);
    const text = h.textContent?.replace(/\s+/g, ' ').trim() || '';
    if (text) {
      headings.push({ level, text, id: h.id || undefined });
    }
  });

  const bodyClone = doc.body ? (doc.body.cloneNode(true) as HTMLElement) : null;
  let cleanText = '';
  const paragraphs: string[] = [];

  if (bodyClone) {
    const unwanted = bodyClone.querySelectorAll('script, style, noscript, svg, template, iframe');
    unwanted.forEach(el => el.remove());

    bodyClone.querySelectorAll('p, blockquote, article, section, li').forEach(el => {
      const pText = el.textContent?.replace(/\s+/g, ' ').trim();
      if (pText && pText.length > 25 && !paragraphs.includes(pText)) {
        paragraphs.push(pText);
      }
    });

    cleanText = bodyClone.textContent?.replace(/\s+/g, ' ').trim() || '';
  }

  const words = cleanText ? cleanText.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const linkItems: LinkItem[] = [];
  doc.querySelectorAll('a[href]').forEach(a => {
    const rawHref = a.getAttribute('href') || '';
    if (rawHref.startsWith('#') || rawHref.startsWith('javascript:')) return;
    const fullHref = resolveUrl(rawHref, baseUrl);
    const text = a.textContent?.replace(/\s+/g, ' ').trim() || fullHref;
    const isExternal = extractDomain(fullHref) !== domain && !fullHref.startsWith('/');
    linkItems.push({
      text: text.slice(0, 100),
      href: fullHref,
      isExternal,
      rel: a.getAttribute('rel') || undefined,
      target: a.getAttribute('target') || undefined,
    });
  });

  const content: ContentAnalysis = {
    headings,
    wordCount,
    readingTimeMinutes,
    paragraphs: paragraphs.slice(0, 30),
    links: linkItems.slice(0, 100),
    images: imageItems.slice(0, 100),
  };

  // 9. DOM Tree Representation
  let nodeCounter = 0;
  const maxNodes = 400;

  function buildDomNode(el: Element, depth: number): DOMTreeNode {
    nodeCounter++;
    const tag = el.tagName.toLowerCase();
    const idAttr = el.id || undefined;
    const classes = Array.from(el.classList);
    const attributes: Record<string, string> = {};

    Array.from(el.attributes).forEach(attr => {
      if (!['class', 'id'].includes(attr.name)) {
        attributes[attr.name] = attr.value.length > 80 ? attr.value.substring(0, 77) + '...' : attr.value;
      }
    });

    const directText = Array.from(el.childNodes)
      .filter(n => n.nodeType === Node.TEXT_NODE)
      .map(n => n.textContent?.trim())
      .filter(Boolean)
      .join(' ');

    const children: DOMTreeNode[] = [];
    if (depth < 6 && nodeCounter < maxNodes) {
      Array.from(el.children).forEach(child => {
        if (!['script', 'style', 'svg', 'noscript'].includes(child.tagName.toLowerCase())) {
          children.push(buildDomNode(child, depth + 1));
        }
      });
    }

    return {
      id: `dom-${nodeCounter}`,
      tag,
      idAttr,
      classes,
      attributes,
      childCount: el.children.length,
      textPreview: directText ? (directText.length > 50 ? directText.substring(0, 47) + '...' : directText) : undefined,
      children: children.length > 0 ? children : undefined,
    };
  }

  const rootElement = doc.documentElement || doc.body;
  const domTree = rootElement
    ? buildDomNode(rootElement, 0)
    : { id: 'dom-root', tag: 'html', classes: [], attributes: {}, childCount: 0 };

  // 10. Relationships
  const relNodes: RelationshipNode[] = [
    {
      id: 'doc-root',
      label: domain || 'index.html',
      type: 'document',
      status: 'RETRIEVED',
      url: baseUrl,
    },
  ];

  const relLinks: RelationshipLink[] = [];

  discoveredResources
    .filter(r => r.kind === 'stylesheet')
    .slice(0, 10)
    .forEach((res, i) => {
      const nodeId = `css-${i}`;
      relNodes.push({
        id: nodeId,
        label: res.name,
        type: 'stylesheet',
        status: res.isInline ? 'RETRIEVED' : 'DISCOVERED_ONLY',
        url: res.url,
      });
      relLinks.push({
        source: 'doc-root',
        target: nodeId,
        relationship: 'styles',
      });
    });

  discoveredResources
    .filter(r => r.kind === 'script')
    .slice(0, 10)
    .forEach((res, i) => {
      const nodeId = `js-${i}`;
      relNodes.push({
        id: nodeId,
        label: res.name,
        type: 'script',
        status: res.isInline ? 'RETRIEVED' : 'DISCOVERED_ONLY',
        url: res.url,
      });
      relLinks.push({
        source: 'doc-root',
        target: nodeId,
        relationship: 'loads',
      });
    });

  discoveredResources
    .filter(r => r.kind === 'image')
    .slice(0, 8)
    .forEach((res, i) => {
      const nodeId = `img-${i}`;
      relNodes.push({
        id: nodeId,
        label: res.name,
        type: 'image',
        status: 'DISCOVERED_ONLY',
        url: res.url,
      });
      relLinks.push({
        source: 'doc-root',
        target: nodeId,
        relationship: 'references',
      });
    });

  return {
    metadata,
    content,
    domTree,
    relationships: {
      nodes: relNodes,
      links: relLinks,
    },
    discoveredResources,
  };
}
