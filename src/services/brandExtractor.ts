import { BrandIntelligence, FontToken, HeadingSample, ButtonStyleToken } from '../types';

export function extractBrandIntelligence(
  html: string,
  cssContents: string[],
  baseUrl: string,
  domain: string
): BrandIntelligence {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // 1. Brand Name
  const ogSiteName = doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content');
  const title = doc.querySelector('title')?.textContent || '';
  const firstH1 = doc.querySelector('h1')?.textContent?.trim() || '';

  let brandName = ogSiteName || '';
  if (!brandName) {
    if (title.includes('|')) {
      brandName = title.split('|').pop()?.trim() || '';
    } else if (title.includes('—')) {
      brandName = title.split('—').pop()?.trim() || '';
    } else if (title.includes('-')) {
      brandName = title.split('-').pop()?.trim() || '';
    }
  }
  if (!brandName || brandName.length > 30) {
    brandName = domain.replace(/^www\./, '').split('.')[0];
    brandName = brandName.charAt(0).toUpperCase() + brandName.slice(1);
  }

  // 2. Logo / Favicon
  let logoUrl: string | null = null;
  const logoImg =
    doc.querySelector('img[class*="logo" i]') ||
    doc.querySelector('img[id*="logo" i]') ||
    doc.querySelector('img[alt*="logo" i]') ||
    doc.querySelector('header img') ||
    doc.querySelector('nav img');

  if (logoImg) {
    const src = logoImg.getAttribute('src');
    if (src) {
      try {
        logoUrl = new URL(src, baseUrl).href;
      } catch {
        logoUrl = src;
      }
    }
  }

  let faviconUrl: string | null = null;
  const favEl = doc.querySelector('link[rel~="icon"]') || doc.querySelector('link[rel="apple-touch-icon"]');
  if (favEl) {
    const href = favEl.getAttribute('href');
    if (href) {
      try {
        faviconUrl = new URL(href, baseUrl).href;
      } catch {
        faviconUrl = href;
      }
    }
  }
  if (!faviconUrl) {
    try {
      faviconUrl = new URL('/favicon.ico', baseUrl).href;
    } catch {
      faviconUrl = null;
    }
  }

  // 3. Fonts Detection
  const fonts: FontToken[] = [];
  const detectedFamilies = new Set<string>();

  // Check Google Fonts links
  doc.querySelectorAll('link[href*="fonts.googleapis.com"]').forEach(link => {
    const href = link.getAttribute('href') || '';
    const match = href.match(/family=([^&:]+)/);
    if (match) {
      const familyName = decodeURIComponent(match[1]).replace(/\+/g, ' ');
      if (!detectedFamilies.has(familyName)) {
        detectedFamilies.add(familyName);
        fonts.push({ family: familyName, source: 'google' });
      }
    }
  });

  // Check CSS contents for font-family and @font-face
  const allCss = cssContents.join('\n');

  // Font-face rules
  const fontFaceMatches = allCss.match(/@font-face\s*\{[^}]+\}/gi);
  if (fontFaceMatches) {
    fontFaceMatches.forEach(rule => {
      const nameMatch = rule.match(/font-family\s*:\s*['"]?([^'";}]+)['"]?/i);
      if (nameMatch) {
        const familyName = nameMatch[1].trim();
        if (!detectedFamilies.has(familyName)) {
          detectedFamilies.add(familyName);
          fonts.push({ family: familyName, source: 'face' });
        }
      }
    });
  }

  // Generic font-family declarations
  const fontFamilyMatches = allCss.match(/font-family\s*:\s*([^;}]+)/gi);
  if (fontFamilyMatches) {
    fontFamilyMatches.slice(0, 15).forEach(decl => {
      const raw = decl.replace(/font-family\s*:/i, '').trim();
      const firstPart = raw.split(',')[0].replace(/['"]/g, '').trim();
      if (firstPart && !['inherit', 'initial', 'unset'].includes(firstPart) && !detectedFamilies.has(firstPart)) {
        detectedFamilies.add(firstPart);
        fonts.push({ family: firstPart, source: 'inline' });
      }
    });
  }

  // If none found, provide standard fallback
  if (fonts.length === 0) {
    fonts.push({ family: 'Inter / System Sans-Serif', source: 'system' });
  }

  // 4. Heading Samples Scale
  const headingSamples: HeadingSample[] = [
    { level: 'H1', fontSize: '36px (2.25rem)', fontWeight: '700 (Bold)', lineHeight: '1.2', sample: firstH1 || 'Decoding Digital Horizons' },
    { level: 'H2', fontSize: '28px (1.75rem)', fontWeight: '600 (Semibold)', lineHeight: '1.3', sample: 'Architectural Intelligence & Core Nodes' },
    { level: 'H3', fontSize: '22px (1.375rem)', fontWeight: '600 (Semibold)', lineHeight: '1.4', sample: 'Extracted Frontend Design Tokens' },
    { level: 'H4', fontSize: '18px (1.125rem)', fontWeight: '500 (Medium)', lineHeight: '1.4', sample: 'Modular Resource Specifications' },
    { level: 'H5', fontSize: '15px (0.938rem)', fontWeight: '500 (Medium)', lineHeight: '1.5', sample: 'Telemetry and Document Metadata' },
    { level: 'H6', fontSize: '13px (0.813rem)', fontWeight: '600 (Semibold uppercase)', lineHeight: '1.5', sample: 'SUBSYSTEM VERIFICATION AUDIT' },
  ];

  // 5. Button Styles
  const buttonStyles: ButtonStyleToken[] = [];
  const btnRuleMatches = allCss.match(/(?:button|\.btn|\.button)[^{]*\{([^}]+)\}/gi);

  if (btnRuleMatches && btnRuleMatches.length > 0) {
    btnRuleMatches.slice(0, 3).forEach((rule, idx) => {
      const bgMatch = rule.match(/background(?:-color)?\s*:\s*([^;}]+)/i);
      const colorMatch = rule.match(/(?:^|[^a-z-])color\s*:\s*([^;}]+)/i);
      const radiusMatch = rule.match(/border-radius\s*:\s*([^;}]+)/i);
      const borderMatch = rule.match(/border\s*:\s*([^;}]+)/i);
      const padMatch = rule.match(/padding\s*:\s*([^;}]+)/i);

      buttonStyles.push({
        selector: `Button Style ${idx + 1}`,
        background: bgMatch ? bgMatch[1].trim() : '#FEE75C',
        color: colorMatch ? colorMatch[1].trim() : '#0A0B0E',
        borderRadius: radiusMatch ? radiusMatch[1].trim() : '6px',
        border: borderMatch ? borderMatch[1].trim() : '1px solid transparent',
        padding: padMatch ? padMatch[1].trim() : '10px 20px',
      });
    });
  }

  // Fallback button presets if none found
  if (buttonStyles.length === 0) {
    buttonStyles.push(
      {
        selector: 'Primary CTA (Detected / Synthesized)',
        background: '#FEE75C',
        color: '#0A0B0E',
        borderRadius: '8px',
        border: '1px solid #FEE75C',
        padding: '10px 22px',
      },
      {
        selector: 'Secondary Action',
        background: 'rgba(255,255,255,0.06)',
        color: '#F8FAFC',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.15)',
        padding: '10px 20px',
      }
    );
  }

  // 6. Shadow & Border Radius Tokens
  const shadowTokens: string[] = [];
  const shadowMatches = allCss.match(/box-shadow\s*:\s*([^;}]+)/gi);
  if (shadowMatches) {
    const uniqueShadows = new Set<string>();
    shadowMatches.forEach(m => {
      const val = m.replace(/box-shadow\s*:/i, '').trim();
      if (!val.includes('none') && val.length < 80) uniqueShadows.add(val);
    });
    shadowTokens.push(...Array.from(uniqueShadows).slice(0, 6));
  }
  if (shadowTokens.length === 0) {
    shadowTokens.push('0 4px 6px -1px rgba(0, 0, 0, 0.1)', '0 10px 15px -3px rgba(0, 0, 0, 0.1)');
  }

  const borderRadiusTokens: string[] = [];
  const radiusMatches = allCss.match(/border-radius\s*:\s*([^;}]+)/gi);
  if (radiusMatches) {
    const uniqueRadius = new Set<string>();
    radiusMatches.forEach(m => {
      const val = m.replace(/border-radius\s*:/i, '').trim();
      if (val.length < 30) uniqueRadius.add(val);
    });
    borderRadiusTokens.push(...Array.from(uniqueRadius).slice(0, 6));
  }
  if (borderRadiusTokens.length === 0) {
    borderRadiusTokens.push('4px', '8px', '12px', '9999px');
  }

  // 7. CSS Custom Properties
  const cssVariables: Array<{ name: string; value: string }> = [];
  const varMatches = allCss.match(/--[a-zA-Z0-9_-]+\s*:\s*[^;]+/g);
  if (varMatches) {
    const varSet = new Set<string>();
    varMatches.slice(0, 25).forEach(v => {
      const [name, ...valParts] = v.split(':');
      const varName = name.trim();
      const varVal = valParts.join(':').trim();
      if (!varSet.has(varName) && varVal.length < 60) {
        varSet.add(varName);
        cssVariables.push({ name: varName, value: varVal });
      }
    });
  }

  return {
    brandName,
    logoUrl,
    faviconUrl,
    fonts,
    headingSamples,
    buttonStyles,
    shadowTokens,
    borderRadiusTokens,
    cssVariables,
  };
}
