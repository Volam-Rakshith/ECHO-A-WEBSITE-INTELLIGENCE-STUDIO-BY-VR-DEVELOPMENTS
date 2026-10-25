import { describe, it, expect } from 'vitest';
import { parseHtmlDocument } from '../services/htmlParser';

describe('htmlParser', () => {
  const sampleHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>Cyber Space Intelligence</title>
        <meta name="description" content="Next generation website analysis platform.">
        <link rel="icon" href="/favicon.png">
        <link rel="canonical" href="https://example.com/">
        <link rel="stylesheet" href="/assets/main.css">
        <meta property="og:title" content="OpenGraph Title">
        <style>
          body { background: #000; }
          @media (max-width: 768px) { body { font-size: 14px; } }
          @media (min-width: 1200px) { .container { width: 1140px; } }
        </style>
        <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Cyber Space Org",
            "url": "https://example.com"
          }
        </script>
      </head>
      <body>
        <div id="__next">
          <header>
            <h1>Welcome to Cyber Space</h1>
            <nav>
              <a href="/about">About Us</a>
              <a href="https://external.org">External Node</a>
            </nav>
          </header>
          <main>
            <h2>Core Features</h2>
            <p>Decentralized intelligence networks provide continuous telemetry on digital infrastructure.</p>
            <img src="/hero.jpg" alt="Hero Banner graphic" />
            <img src="/icon.svg" />
            
            <form action="/api/login" method="POST">
              <input type="text" name="username" required />
              <input type="password" name="password" required />
              <input type="hidden" name="csrf_token" value="abc123xyz" />
              <button type="submit">Log In</button>
            </form>
          </main>
        </div>
        <script src="/_next/static/chunks/main.js"></script>
        <script>console.log("inline script running");</script>
      </body>
    </html>
  `;

  it('extracts metadata accurately', () => {
    const result = parseHtmlDocument(sampleHtml, 'https://example.com');
    expect(result.metadata.title).toBe('Cyber Space Intelligence');
    expect(result.metadata.description).toBe('Next generation website analysis platform.');
    expect(result.metadata.language).toBe('en');
    expect(result.metadata.charset).toBe('utf-8');
    expect(result.metadata.canonicalUrl).toBe('https://example.com/');
    expect(result.metadata.openGraph['og:title']).toBe('OpenGraph Title');
  });

  it('extracts technology stack, forms, schemas, and media queries', () => {
    const result = parseHtmlDocument(sampleHtml, 'https://example.com');
    
    // Tech stack detection (should detect Next.js and React from __next and _next/static)
    const techNames = result.metadata.techStack.map(t => t.name);
    expect(techNames).toContain('Next.js');
    expect(techNames).toContain('React');

    // Form audit
    expect(result.metadata.forms.length).toBe(1);
    expect(result.metadata.forms[0].method).toBe('POST');
    expect(result.metadata.forms[0].hasCsrf).toBe(true);
    expect(result.metadata.forms[0].inputCount).toBe(3);

    // Schemas
    expect(result.metadata.schemas.length).toBe(1);
    expect(result.metadata.schemas[0].type).toBe('Organization');

    // Media Queries
    expect(result.metadata.mediaQueries.length).toBeGreaterThanOrEqual(1);
  });

  it('extracts content headings, links, and images', () => {
    const result = parseHtmlDocument(sampleHtml, 'https://example.com');
    expect(result.content.headings.length).toBe(2);
    expect(result.content.headings[0].text).toBe('Welcome to Cyber Space');
    expect(result.content.headings[1].text).toBe('Core Features');

    expect(result.content.links.length).toBe(2);
    expect(result.content.links[0].isExternal).toBe(false);
    expect(result.content.links[1].isExternal).toBe(true);

    expect(result.content.images.length).toBe(2);
    expect(result.content.images[0].hasAlt).toBe(true);
    expect(result.content.images[1].hasAlt).toBe(false);
  });

  it('discovers linked and inline resources', () => {
    const result = parseHtmlDocument(sampleHtml, 'https://example.com');
    const kinds = result.discoveredResources.map(r => r.kind);
    expect(kinds).toContain('stylesheet');
    expect(kinds).toContain('script');
    expect(kinds).toContain('image');

    const inlines = result.discoveredResources.filter(r => r.isInline);
    expect(inlines.length).toBeGreaterThan(0);
  });
});
