import { ExtractedColor } from '../types';

interface ColorCandidate {
  raw: string;
  roleHint?: 'background' | 'text' | 'accent' | 'border' | 'gradient';
}

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  let cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map(c => c + c).join('');
  }
  if (cleaned.length === 8) {
    cleaned = cleaned.substring(0, 6);
  }
  if (cleaned.length !== 6) return null;
  const num = parseInt(cleaned, 16);
  if (isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function parseRgb(rgbStr: string): { r: number; g: number; b: number } | null {
  const match = rgbStr.match(/rgba?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i);
  if (!match) return null;
  return {
    r: Math.min(255, parseInt(match[1], 10)),
    g: Math.min(255, parseInt(match[2], 10)),
    b: Math.min(255, parseInt(match[3], 10)),
  };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return {
    r: Math.round(f(0) * 255),
    g: Math.round(f(8) * 255),
    b: Math.round(f(4) * 255),
  };
}

function parseHsl(hslStr: string): { r: number; g: number; b: number } | null {
  const match = hslStr.match(/hsla?\s*\(\s*([\d.]+)(?:deg)?\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%/i);
  if (!match) return null;
  return hslToRgb(parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3]));
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function rgbToHsl(r: number, g: number, b: number): string {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

export function extractColorsFromText(cssOrHtml: string): ExtractedColor[] {
  if (!cssOrHtml) return [];

  const candidates: ColorCandidate[] = [];

  // Match hex colors
  const hexMatches = cssOrHtml.match(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g);
  if (hexMatches) {
    hexMatches.forEach(h => candidates.push({ raw: h }));
  }

  // Match rgb / rgba colors
  const rgbMatches = cssOrHtml.match(/rgba?\([^)]+\)/gi);
  if (rgbMatches) {
    rgbMatches.forEach(rgb => candidates.push({ raw: rgb }));
  }

  // Match hsl / hsla colors
  const hslMatches = cssOrHtml.match(/hsla?\([^)]+\)/gi);
  if (hslMatches) {
    hslMatches.forEach(hsl => candidates.push({ raw: hsl }));
  }

  // Map to normalized hex and count frequencies
  const colorMap = new Map<string, { r: number; g: number; b: number; count: number }>();

  for (const cand of candidates) {
    let rgb: { r: number; g: number; b: number } | null = null;
    if (cand.raw.startsWith('#')) {
      rgb = parseHex(cand.raw);
    } else if (/^rgba?/i.test(cand.raw)) {
      rgb = parseRgb(cand.raw);
    } else if (/^hsla?/i.test(cand.raw)) {
      rgb = parseHsl(cand.raw);
    }

    if (rgb) {
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      // Skip transparent or pure default black/white unless frequent
      const existing = colorMap.get(hex);
      if (existing) {
        existing.count += 1;
      } else {
        colorMap.set(hex, { ...rgb, count: 1 });
      }
    }
  }

  const results: ExtractedColor[] = [];
  const lumWhite = getRelativeLuminance(255, 255, 255);
  const lumBlack = getRelativeLuminance(0, 0, 0);

  colorMap.forEach((val, hex) => {
    const lum = getRelativeLuminance(val.r, val.g, val.b);
    const contrastWhite = getContrastRatio(lum, lumWhite);
    const contrastBlack = getContrastRatio(lum, lumBlack);

    let wcagRating: 'AAA' | 'AA' | 'FAIL' = 'FAIL';
    const maxContrast = Math.max(contrastWhite, contrastBlack);
    if (maxContrast >= 7.0) {
      wcagRating = 'AAA';
    } else if (maxContrast >= 4.5) {
      wcagRating = 'AA';
    }

    // Determine role heuristics
    let role: 'background' | 'text' | 'accent' | 'border' | 'gradient' = 'accent';
    const isVeryDark = lum < 0.08;
    const isVeryLight = lum > 0.85;

    // Check saturation
    const maxVal = Math.max(val.r, val.g, val.b);
    const minVal = Math.min(val.r, val.g, val.b);
    const saturation = maxVal === 0 ? 0 : (maxVal - minVal) / maxVal;

    if (isVeryDark || (isVeryLight && saturation < 0.15)) {
      role = isVeryDark ? 'background' : 'text';
    } else if (saturation > 0.4) {
      role = 'accent';
    } else if (lum > 0.2 && lum < 0.8 && saturation < 0.2) {
      role = 'border';
    }

    results.push({
      hex,
      rgb: `rgb(${val.r}, ${val.g}, ${val.b})`,
      hsl: rgbToHsl(val.r, val.g, val.b),
      frequency: val.count,
      role,
      contrastBlack,
      contrastWhite,
      wcagRating,
    });
  });

  // Sort by frequency descending
  results.sort((a, b) => b.frequency - a.frequency);
  return results.slice(0, 50); // Top 50 colors
}

export function generateCssVariablesExport(colors: ExtractedColor[]): string {
  const lines = [':root {'];
  colors.slice(0, 24).forEach((c, i) => {
    lines.push(`  --echo-color-${c.role}-${i + 1}: ${c.hex}; /* ${c.rgb} - WCAG: ${c.wcagRating} */`);
  });
  lines.push('}');
  return lines.join('\n');
}

export function generateTailwindExport(colors: ExtractedColor[]): string {
  const colorObj: Record<string, string> = {};
  colors.slice(0, 20).forEach((c, i) => {
    colorObj[`echo-${c.role}-${i + 1}`] = c.hex;
  });
  return `module.exports = {
  theme: {
    extend: {
      colors: ${JSON.stringify(colorObj, null, 2)}
    }
  }
};`;
}

export function generateScssExport(colors: ExtractedColor[]): string {
  return colors
    .slice(0, 24)
    .map((c, i) => `$echo-${c.role}-${i + 1}: ${c.hex}; // ${c.rgb}`)
    .join('\n');
}
