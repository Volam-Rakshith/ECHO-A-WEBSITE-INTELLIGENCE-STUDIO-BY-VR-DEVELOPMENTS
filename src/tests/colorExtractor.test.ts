import { describe, it, expect } from 'vitest';
import { extractColorsFromText, getContrastRatio, generateCssVariablesExport } from '../services/colorExtractor';

describe('colorExtractor', () => {
  it('extracts hex, rgb, and hsl colors from raw text', () => {
    const sampleCss = `
      body { background-color: #0A0B0E; color: rgb(240, 240, 240); }
      .accent { color: #FEE75C; border: 1px solid rgba(0, 240, 255, 0.8); }
      .badge { background: hsl(270, 70%, 50%); }
    `;
    const colors = extractColorsFromText(sampleCss);
    expect(colors.length).toBeGreaterThan(0);

    const hexList = colors.map(c => c.hex);
    expect(hexList).toContain('#0A0B0E');
    expect(hexList).toContain('#FEE75C');
  });

  it('calculates WCAG contrast ratio accurately', () => {
    // Pure black (lum 0) against pure white (lum 1)
    const ratio = getContrastRatio(1, 0);
    expect(ratio).toBe(21);

    // Identical luminance
    const sameRatio = getContrastRatio(0.5, 0.5);
    expect(sameRatio).toBe(1);
  });

  it('generates valid CSS custom properties export', () => {
    const dummyColors = [
      {
        hex: '#0A0B0E',
        rgb: 'rgb(10, 11, 14)',
        hsl: 'hsl(225, 17%, 5%)',
        frequency: 5,
        role: 'background' as const,
        contrastBlack: 1.1,
        contrastWhite: 18.2,
        wcagRating: 'AAA' as const,
      },
    ];
    const css = generateCssVariablesExport(dummyColors);
    expect(css).toContain(':root {');
    expect(css).toContain('--echo-color-background-1: #0A0B0E;');
  });
});
