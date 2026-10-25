import {
  AnalysisResult,
  DiagnosticEvent,
  ResourceFile,
  RetrievalStatus,
  RetrievalOptions,
} from '../types';
import { isValidHttpUrl, normalizeUrl, extractDomain, isGitHubRepoUrl, isPrivateOrLocalUrl } from './urlUtils';
import { parseHtmlDocument } from './htmlParser';
import { extractColorsFromText } from './colorExtractor';
import { extractBrandIntelligence } from './brandExtractor';

export interface ProgressCallback {
  (stage: string, message: string, percent: number, diagnostics: DiagnosticEvent[]): void;
}

const RELAY_PROVIDERS = [
  {
    name: 'Local Environment Relay',
    getUrl: (url: string, customHeaders?: Record<string, string>) => {
      const param = customHeaders ? `&custom_headers=${encodeURIComponent(JSON.stringify(customHeaders))}` : '';
      return `/api/proxy?url=${encodeURIComponent(url)}${param}`;
    },
    timeout: 6000,
  },
  {
    name: 'AllOrigins CDN Relay',
    getUrl: (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    timeout: 7000,
  },
  {
    name: 'CodeTabs Proxy Relay',
    getUrl: (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    timeout: 7000,
  },
  {
    name: 'CorsProxy Relay',
    getUrl: (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
    timeout: 6000,
  },
];

async function fetchWithTimeout(url: string, timeoutMs: number = 6000, headers?: Record<string, string>): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers,
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export async function executeRetrievalPipeline(
  rawInputUrl: string,
  onProgress: ProgressCallback,
  manualPayload?: { html: string; title?: string },
  options?: RetrievalOptions
): Promise<AnalysisResult> {
  const startTime = Date.now();
  const diagnostics: DiagnosticEvent[] = [];

  const addDiag = (
    stage: string,
    strategy: string,
    status: 'pending' | 'success' | 'warn' | 'failed',
    message: string,
    details?: string,
    durationMs?: number
  ) => {
    const evt: DiagnosticEvent = {
      id: `diag-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      stage,
      strategy,
      targetUrl: rawInputUrl,
      status,
      message,
      details,
      durationMs,
    };
    diagnostics.push(evt);
    return evt;
  };

  // Stage 1: Validate URL
  onProgress('Validating Target', 'Checking protocol, origin, and network scope...', 10, diagnostics);
  const targetUrl = normalizeUrl(rawInputUrl);

  if (!manualPayload && !isValidHttpUrl(targetUrl)) {
    addDiag('Validation', 'Input Check', 'failed', `Invalid HTTP/HTTPS URL: "${rawInputUrl}".`);
    throw new Error(`Invalid URL: "${rawInputUrl}". Please provide a valid http:// or https:// address.`);
  }

  const isPrivateOrLocal = isPrivateOrLocalUrl(targetUrl);
  if (isPrivateOrLocal) {
    addDiag(
      'Network Scope',
      'Private/Local Network',
      'warn',
      `Target "${targetUrl}" resolved to private/localhost network scope.`,
      'Routing via Direct Client & Local Environment Relay with custom credentials support.'
    );
  } else {
    addDiag('Validation', 'Input Check', 'success', `Validated URL: ${targetUrl}`);
  }

  // Build custom headers for authenticated inspection
  const requestHeaders: Record<string, string> = { ...options?.headers };
  if (options?.basicAuth && options.basicAuth.username) {
    const token = btoa(`${options.basicAuth.username}:${options.basicAuth.password}`);
    requestHeaders['Authorization'] = `Basic ${token}`;
    addDiag('Authentication', 'Basic Auth', 'pending', 'Attached Basic Authentication credentials to outgoing request.');
  } else if (requestHeaders['Authorization']) {
    addDiag('Authentication', 'Bearer/Custom Auth', 'pending', 'Attached custom Authorization header to request pipeline.');
  }

  let htmlContent = '';
  let primaryStrategy = 'Direct Browser Retrieval';
  let htmlStatus: RetrievalStatus = 'RETRIEVED';
  let responseHeadersObj: Record<string, string> = {};

  // If user provided manual payload (e.g. from Bookmarklet, DevTools, or File Upload)
  if (manualPayload && manualPayload.html) {
    onProgress('Processing User Input', 'Parsing user-provided source payload...', 35, diagnostics);
    htmlContent = manualPayload.html;
    primaryStrategy = 'User-Pasted / Uploaded Source (Private Site Bypass)';
    htmlStatus = 'USER_PROVIDED';
    addDiag(
      'Source Acquisition',
      'Direct Payload',
      'success',
      'Loaded private/local source payload directly into engine with 100% fidelity.',
      `Payload size: ${htmlContent.length.toLocaleString()} characters`
    );
  } else {
    // Check if target is a GitHub repo
    const ghInfo = isGitHubRepoUrl(targetUrl);
    if (ghInfo.isRepo) {
      addDiag('Discovery', 'GitHub Detector', 'warn', `GitHub repository detected: ${ghInfo.owner}/${ghInfo.repo}. Attempting raw file retrieval.`);
      const rawGhUrl = `https://raw.githubusercontent.com/${ghInfo.owner}/${ghInfo.repo}/main/index.html`;
      try {
        const ghStart = Date.now();
        const ghRes = await fetchWithTimeout(rawGhUrl, 5000, requestHeaders);
        if (ghRes.ok) {
          htmlContent = await ghRes.text();
          primaryStrategy = 'GitHub Raw Repository Endpoint';
          addDiag('Source Acquisition', primaryStrategy, 'success', `Retrieved repository index.html from ${rawGhUrl}`, undefined, Date.now() - ghStart);
        }
      } catch {
        // Fallback to regular pipeline
      }
    }

    // Attempt Direct Browser Fetch (works for localhost, same-origin, and CORS-permissive sites)
    if (!htmlContent) {
      onProgress('Direct Retrieval', 'Attempting direct browser fetch (CORS mode)...', 25, diagnostics);
      const directStart = Date.now();
      try {
        const res = await fetchWithTimeout(targetUrl, 4000, requestHeaders);
        if (res.ok) {
          const text = await res.text();
          if (text.includes('<html') || text.includes('<!DOCTYPE') || text.includes('<head') || text.includes('<body') || text.includes('<div')) {
            htmlContent = text;
            primaryStrategy = isPrivateOrLocal
              ? 'Direct Localhost/Intranet Fetch'
              : 'Direct Browser Fetch (Permissive CORS)';

            res.headers.forEach((v, k) => {
              responseHeadersObj[k] = v;
            });

            addDiag(
              'Source Acquisition',
              primaryStrategy,
              'success',
              `Successfully retrieved HTML directly from host. HTTP ${res.status}`,
              `Content length: ${text.length} bytes`,
              Date.now() - directStart
            );
          }
        } else {
          addDiag(
            'Source Acquisition',
            'Direct Browser Fetch',
            'warn',
            `Direct fetch returned HTTP ${res.status} ${res.statusText}.`,
            undefined,
            Date.now() - directStart
          );
        }
      } catch (err: any) {
        addDiag(
          'Source Acquisition',
          'Direct Browser Fetch',
          'warn',
          'Direct browser fetch restricted by CORS or network boundary.',
          `Error: ${err.message || 'CORS restriction'}. Proceeding to environment relays.`,
          Date.now() - directStart
        );
      }
    }

    // Attempt Relays if direct fetch failed
    if (!htmlContent) {
      onProgress('Relay Fallback', 'Direct fetch restricted by CORS. Querying relay pipeline...', 40, diagnostics);

      for (let i = 0; i < RELAY_PROVIDERS.length; i++) {
        const relay = RELAY_PROVIDERS[i];
        const relayStart = Date.now();
        const relayUrl = relay.getUrl(targetUrl, requestHeaders);

        try {
          addDiag('Source Acquisition', relay.name, 'pending', `Querying relay: ${relay.name}...`);
          const res = await fetchWithTimeout(relayUrl, relay.timeout);
          if (res.ok) {
            const rawBody = await res.text();
            if (rawBody && (rawBody.includes('<html') || rawBody.includes('<!DOCTYPE') || rawBody.includes('<body') || rawBody.includes('<div') || rawBody.includes('<p') || rawBody.includes('<head'))) {
              htmlContent = rawBody;
              primaryStrategy = relay.name;

              res.headers.forEach((v, k) => {
                responseHeadersObj[k] = v;
              });

              addDiag(
                'Source Acquisition',
                relay.name,
                'success',
                `Successfully acquired target HTML via ${relay.name}.`,
                `Retrieved ${rawBody.length} characters cleanly.`,
                Date.now() - relayStart
              );
              break;
            }
          }
          addDiag('Source Acquisition', relay.name, 'warn', `Relay returned non-HTML or error response. Status: ${res.status}`, undefined, Date.now() - relayStart);
        } catch (err: any) {
          addDiag('Source Acquisition', relay.name, 'warn', `Relay attempt failed or timed out: ${err.message}`, undefined, Date.now() - relayStart);
        }
      }
    }
  }

  // If HTML could not be acquired through any network channel
  if (!htmlContent) {
    addDiag(
      'Engine Summary',
      'Exhaustive Retrieval',
      'failed',
      'All automated network relays were blocked by target origin security, Cloudflare/WAF, or intranet boundary.',
      'For private/authenticated sites, click "Private Site Helper" to extract source in 1-click using the ECHO bookmarklet or paste raw source.'
    );
    throw new Error(
      `Unable to automatically retrieve source code for "${targetUrl}". Target server enforces strict Cross-Origin Resource Sharing (CORS), WAF protection, or private intranet boundaries. Use ECHO's "Private Site Helper" or "Paste Raw Source" feature to decode with 100% full fidelity.`
    );
  }

  // Stage 3: Parse HTML Document & Technology Details
  onProgress('Parsing Document', 'Analyzing DOM structure, meta elements, and linked assets...', 60, diagnostics);
  const parseStart = Date.now();
  const parsed = parseHtmlDocument(htmlContent, targetUrl, responseHeadersObj);
  addDiag(
    'DOM Analysis',
    'DOMParser & Tech Detector',
    'success',
    `Extracted document tree with ${parsed.domTree.childCount} root children, ${parsed.content.headings.length} headings, ${parsed.metadata.techStack.length} detected technologies.`,
    undefined,
    Date.now() - parseStart
  );

  // Stage 4: Collect Source Files
  onProgress('Collecting Resources', 'Discovering stylesheets, scripts, and media resources...', 75, diagnostics);
  const resources: ResourceFile[] = [];

  // Main HTML file
  const domain = extractDomain(targetUrl);
  resources.push({
    id: 'res-main-html',
    name: 'index.html',
    url: targetUrl,
    kind: 'html',
    status: htmlStatus,
    content: htmlContent,
    sizeBytes: new Blob([htmlContent]).size,
    mimeType: 'text/html; charset=utf-8',
    strategyUsed: primaryStrategy,
    fetchTimeMs: Date.now() - startTime,
    isInline: false,
  });

  // Extract inline styles and scripts into resource records
  const cssContentsForBrand: string[] = [];

  parsed.discoveredResources.forEach((res, idx) => {
    if (res.isInline && res.content) {
      if (res.kind === 'stylesheet') {
        cssContentsForBrand.push(res.content);
      }
      resources.push({
        id: `res-inline-${res.kind}-${idx}`,
        name: res.name,
        url: res.url,
        kind: res.kind,
        status: 'RETRIEVED',
        content: res.content,
        sizeBytes: new Blob([res.content]).size,
        mimeType: res.kind === 'stylesheet' ? 'text/css' : 'application/javascript',
        strategyUsed: 'Extracted from Document Markup',
        isInline: true,
      });
    }
  });

  // Concurrent retrieval of external linked CSS and JS (limit to first 8)
  const externalToFetch = parsed.discoveredResources.filter(r => !r.isInline && ['stylesheet', 'script'].includes(r.kind)).slice(0, 8);

  if (externalToFetch.length > 0) {
    onProgress('Fetching Linked Assets', `Attempting retrieval for ${externalToFetch.length} external frontend assets...`, 85, diagnostics);

    const assetPromises = externalToFetch.map(async item => {
      const fetchStart = Date.now();
      let assetContent = '';
      let assetStatus: RetrievalStatus = 'DISCOVERED_ONLY';
      let errorMsg: string | undefined;

      try {
        const aRes = await fetchWithTimeout(RELAY_PROVIDERS[0].getUrl(item.url, requestHeaders), 4000);
        if (aRes.ok) {
          assetContent = await aRes.text();
          assetStatus = 'RETRIEVED';
        }
      } catch {
        try {
          const directRes = await fetchWithTimeout(item.url, 3000, requestHeaders);
          if (directRes.ok) {
            assetContent = await directRes.text();
            assetStatus = 'RETRIEVED';
          }
        } catch {
          assetStatus = 'DISCOVERED_ONLY';
          errorMsg = 'Cross-origin restricted or blocked by CDN';
        }
      }

      if (assetStatus === 'RETRIEVED' && item.kind === 'stylesheet') {
        cssContentsForBrand.push(assetContent);
      }

      return {
        id: `res-ext-${item.kind}-${Math.random().toString(36).substring(2, 7)}`,
        name: item.name,
        url: item.url,
        kind: item.kind,
        status: assetStatus,
        content: assetContent || undefined,
        sizeBytes: assetContent ? new Blob([assetContent]).size : undefined,
        mimeType: item.kind === 'stylesheet' ? 'text/css' : 'application/javascript',
        strategyUsed: assetStatus === 'RETRIEVED' ? 'Asset Fetch Relay' : 'Discovered in HTML Source',
        fetchTimeMs: Date.now() - fetchStart,
        errorMessage: errorMsg,
        isInline: false,
      } as ResourceFile;
    });

    const fetchedAssets = await Promise.all(assetPromises);
    resources.push(...fetchedAssets);
  }

  // Discovered images as DISCOVERED_ONLY
  parsed.discoveredResources
    .filter(r => r.kind === 'image')
    .slice(0, 15)
    .forEach((img, i) => {
      resources.push({
        id: `res-img-${i}`,
        name: img.name,
        url: img.url,
        kind: 'image',
        status: 'DISCOVERED_ONLY',
        strategyUsed: 'Referenced in HTML <img>',
        isInline: false,
      });
    });

  // Stage 5: Color Extraction
  onProgress('Extracting Colors', 'Scanning stylesheets and declarations for color tokens...', 90, diagnostics);
  const colorScanPayload = [htmlContent, ...cssContentsForBrand].join('\n');
  const colors = extractColorsFromText(colorScanPayload);
  addDiag(
    'Color Intelligence',
    'Hex/RGB/HSL Scanner',
    'success',
    `Extracted ${colors.length} verified color tokens categorized by roles (background, text, accent, border).`
  );

  // Stage 6: Brand Intelligence
  onProgress('Brand Intelligence', 'Auditing typography, button designs, and design tokens...', 95, diagnostics);
  const brand = extractBrandIntelligence(htmlContent, cssContentsForBrand, targetUrl, domain);

  // Stage 7: Assemble Final Intelligence Result
  onProgress('Finalizing Intelligence', 'Generating report manifest and preparing workspace...', 100, diagnostics);
  const totalDuration = Date.now() - startTime;

  const totalRetrieved = resources.filter(r => r.status === 'RETRIEVED' || r.status === 'USER_PROVIDED').length;
  const totalDiscovered = resources.length;
  const totalFailed = resources.filter(r => r.status === 'FAILED' || r.status === 'UNAVAILABLE').length;
  const totalSize = resources.reduce((acc, r) => acc + (r.sizeBytes || 0), 0);

  addDiag(
    'Intelligence Complete',
    'Engine Finalizer',
    'success',
    `ECHO Decoded ${domain} in ${(totalDuration / 1000).toFixed(2)}s. ${totalRetrieved}/${totalDiscovered} resources retrieved.`,
    `Strategy: ${primaryStrategy}`
  );

  return {
    id: `scan-${Date.now()}`,
    timestamp: Date.now(),
    targetUrl,
    metadata: parsed.metadata,
    resources,
    colors,
    brand,
    content: parsed.content,
    domTree: parsed.domTree,
    relationships: parsed.relationships,
    diagnostics,
    stats: {
      htmlStatus,
      totalDiscovered,
      totalRetrieved,
      totalFailed,
      totalSize,
      analysisDurationMs: totalDuration,
      primaryStrategy,
      isPrivateOrLocal,
    },
    isUserProvided: manualPayload !== undefined,
  };
}
