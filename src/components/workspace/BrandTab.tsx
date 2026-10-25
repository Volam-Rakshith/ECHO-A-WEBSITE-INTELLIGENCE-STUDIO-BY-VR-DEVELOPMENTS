import React from 'react';
import { AnalysisResult } from '../../types';
import { Badge } from '../common/Badge';
import {
  Sparkles,
  Type,
  MousePointerClick,
  Layers,
  Box,
  Code,
  Globe,
  Sliders,
} from 'lucide-react';

interface BrandTabProps {
  analysis: AnalysisResult;
}

export const BrandTab: React.FC<BrandTabProps> = ({ analysis }) => {
  const b = analysis.brand;

  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden p-4 md:p-6 space-y-6 bg-[#0A0B0E] select-text">
      {/* Brand Identity Header */}
      <div className="bg-[#111319] border border-white/10 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-[#161922] border border-white/10 p-2 flex items-center justify-center shrink-0">
            {b.logoUrl || b.faviconUrl ? (
              <img
                src={b.logoUrl || b.faviconUrl || ''}
                alt="Brand mark"
                className="w-10 h-10 object-contain rounded"
                onError={e => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <Globe className="w-8 h-8 text-[#FEE75C]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-white">{b.brandName}</h2>
              <Badge variant="yellow">Decoded Brand</Badge>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Identity derived from page headers, metadata, and CSS declarations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="p-2 bg-[#161922] rounded border border-white/5">
            Fonts: <strong className="text-white">{b.fonts.length}</strong>
          </span>
          <span className="p-2 bg-[#161922] rounded border border-white/5">
            Tokens: <strong className="text-[#FEE75C]">{b.cssVariables.length}</strong>
          </span>
        </div>
      </div>

      {/* Typography Audit */}
      <div className="bg-[#111319] border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-bold font-mono uppercase text-white flex items-center gap-2 mb-4">
          <Type className="w-4 h-4 text-[#00F0FF]" />
          Typography Scale & Detected Font Families
        </h3>

        {/* Font Family Badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {b.fonts.map((f, i) => (
            <div
              key={i}
              className="px-3 py-1.5 rounded-lg bg-[#161922] border border-white/10 flex items-center gap-2 font-mono text-xs"
            >
              <span className="text-white font-semibold">{f.family}</span>
              <Badge variant="cyan" size="sm">
                {f.source}
              </Badge>
            </div>
          ))}
        </div>

        {/* Heading Scale Live Preview Cards */}
        <div className="space-y-3">
          {b.headingSamples.map(h => (
            <div
              key={h.level}
              className="p-4 bg-[#0E1016] border border-white/5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-2 hover:border-white/20 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-8 h-8 rounded bg-[#161922] border border-white/10 flex items-center justify-center font-mono font-bold text-xs text-[#FEE75C] shrink-0">
                  {h.level}
                </span>
                <span
                  className="text-white truncate"
                  style={{
                    fontSize: h.level === 'H1' ? '1.25rem' : h.level === 'H2' ? '1.1rem' : '0.95rem',
                    fontWeight: h.fontWeight.includes('Bold') ? 700 : 600,
                  }}
                >
                  {h.sample}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 shrink-0 self-end md:self-center">
                <span>Size: <strong className="text-slate-200">{h.fontSize}</strong></span>
                <span>&bull;</span>
                <span>Weight: <strong className="text-slate-200">{h.fontWeight}</strong></span>
                <span>&bull;</span>
                <span>Line Height: <strong className="text-slate-200">{h.lineHeight}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Button & Interactive Element Showcase */}
      <div className="bg-[#111319] border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-bold font-mono uppercase text-white flex items-center gap-2 mb-4">
          <MousePointerClick className="w-4 h-4 text-[#FEE75C]" />
          Button Styles & Call-to-Action Design Tokens
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {b.buttonStyles.map((btn, idx) => (
            <div
              key={idx}
              className="p-5 bg-[#0E1016] border border-white/10 rounded-xl flex flex-col justify-between gap-4"
            >
              <div>
                <span className="text-xs font-mono font-bold text-slate-400 uppercase block mb-3">
                  {btn.selector}
                </span>

                {/* Live Rendered Interactive Button */}
                <div className="py-2">
                  <button
                    style={{
                      background: btn.background,
                      color: btn.color,
                      borderRadius: btn.borderRadius,
                      border: btn.border,
                      padding: btn.padding,
                    }}
                    className="font-medium text-xs shadow-md transition-transform active:scale-95 cursor-pointer"
                  >
                    Interactive CTA Preview
                  </button>
                </div>
              </div>

              {/* CSS Rule Breakdown */}
              <div className="p-2.5 bg-[#0A0B0E] rounded border border-white/5 font-mono text-[11px] text-slate-400 space-y-1">
                <div><span className="text-[#00F0FF]">background:</span> {btn.background}</div>
                <div><span className="text-[#00F0FF]">color:</span> {btn.color}</div>
                <div><span className="text-[#00F0FF]">border-radius:</span> {btn.borderRadius}</div>
                <div><span className="text-[#00F0FF]">padding:</span> {btn.padding}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shadows, Radii, and CSS Variables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Border Radius & Shadows */}
        <div className="bg-[#111319] border border-white/10 rounded-xl p-5 space-y-5">
          <div>
            <h4 className="text-xs font-bold font-mono uppercase text-white flex items-center gap-2 mb-3">
              <Box className="w-4 h-4 text-purple-400" />
              Border Radius Tokens
            </h4>
            <div className="flex flex-wrap gap-2">
              {b.borderRadiusTokens.map((radius, i) => (
                <div
                  key={i}
                  className="px-3 py-1.5 bg-[#161922] border border-white/10 rounded font-mono text-xs text-white"
                >
                  {radius}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold font-mono uppercase text-white flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-cyan-400" />
              Box Shadow Tokens
            </h4>
            <div className="space-y-1.5">
              {b.shadowTokens.map((shadow, i) => (
                <div
                  key={i}
                  className="p-2 bg-[#161922] border border-white/5 rounded font-mono text-[11px] text-slate-300 truncate"
                  title={shadow}
                >
                  {shadow}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CSS Custom Properties (:root variables) */}
        <div className="bg-[#111319] border border-white/10 rounded-xl p-5 flex flex-col">
          <h4 className="text-xs font-bold font-mono uppercase text-white flex items-center gap-2 mb-3">
            <Code className="w-4 h-4 text-[#FEE75C]" />
            CSS Custom Properties ({b.cssVariables.length})
          </h4>

          <div className="flex-1 max-h-64 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
            {b.cssVariables.length === 0 ? (
              <p className="text-slate-500 text-xs py-8 text-center">
                No custom CSS variables (--*) declared in accessible stylesheets.
              </p>
            ) : (
              b.cssVariables.map((v, i) => (
                <div
                  key={i}
                  className="p-2 bg-[#161922] border border-white/5 rounded flex items-center justify-between gap-2"
                >
                  <span className="text-[#FEE75C] font-semibold truncate">{v.name}</span>
                  <span className="text-slate-300 text-[11px] truncate">{v.value}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
