import React, { useState } from 'react';
import { ExtractedColor } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  generateCssVariablesExport,
  generateTailwindExport,
  generateScssExport,
} from '../../services/colorExtractor';
import { downloadTextFile } from '../../services/exportService';
import {
  Palette,
  Copy,
  Check,
  Download,
  Filter,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface ColorsTabProps {
  colors: ExtractedColor[];
  onTriggerToast: (type: 'success' | 'warn' | 'error' | 'info', title: string, message?: string) => void;
}

export const ColorsTab: React.FC<ColorsTabProps> = ({ colors, onTriggerToast }) => {
  const [roleFilter, setRoleFilter] = useState<'all' | 'background' | 'text' | 'accent' | 'border'>('all');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const filteredColors = colors.filter(c => {
    if (roleFilter === 'all') return true;
    return c.role === roleFilter;
  });

  const handleCopyValue = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    setCopiedHex(val);
    onTriggerToast('success', 'Color Copied', `Copied ${val} (${label}) to clipboard.`);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  const exportAs = (format: 'css' | 'tailwind' | 'json' | 'scss') => {
    if (format === 'css') {
      downloadTextFile(generateCssVariablesExport(colors), 'echo-palette.css', 'text/css');
    } else if (format === 'tailwind') {
      downloadTextFile(generateTailwindExport(colors), 'tailwind-colors.js', 'application/javascript');
    } else if (format === 'json') {
      downloadTextFile(JSON.stringify(colors, null, 2), 'echo-palette.json', 'application/json');
    } else if (format === 'scss') {
      downloadTextFile(generateScssExport(colors), '_tokens.scss', 'text/x-scss');
    }
    onTriggerToast('success', 'Palette Exported', `Downloaded ${format.toUpperCase()} palette file.`);
  };

  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden p-4 md:p-6 space-y-6 bg-[#0A0B0E] select-text">
      {/* Top Banner: Palette Stats & Quick Exports */}
      <div className="bg-[#111319] border border-white/10 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#FEE75C]" />
            Color Palette Explorer
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            {colors.length} verified color tokens extracted from accessible CSS declarations and markup.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportAs('css')}
            icon={<Download className="w-3.5 h-3.5 text-[#FEE75C]" />}
          >
            CSS Variables
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportAs('tailwind')}
            icon={<Download className="w-3.5 h-3.5 text-[#00F0FF]" />}
          >
            Tailwind
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportAs('json')}
            icon={<Download className="w-3.5 h-3.5 text-purple-400" />}
          >
            JSON
          </Button>
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 font-mono text-xs">
        <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
        {(['all', 'background', 'text', 'accent', 'border'] as const).map(role => (
          <button
            key={role}
            onClick={() => setRoleFilter(role)}
            className={`px-3 py-1.5 rounded capitalize transition-colors ${
              roleFilter === role
                ? 'bg-[#FEE75C] text-[#0A0B0E] font-bold'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {role} ({role === 'all' ? colors.length : colors.filter(c => c.role === role).length})
          </button>
        ))}
      </div>

      {/* Swatches Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredColors.map((color, idx) => {
          const isCopied = copiedHex === color.hex;

          return (
            <div
              key={idx}
              className="bg-[#111319] border border-white/10 rounded-xl overflow-hidden hover:border-[#FEE75C]/50 transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)] group flex flex-col justify-between"
            >
              {/* Color Box */}
              <div
                style={{ backgroundColor: color.hex }}
                className="h-24 w-full relative flex items-end p-2 transition-transform group-hover:scale-[1.02]"
              >
                <div className="bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                  {color.role}
                </div>
              </div>

              {/* Swatch Details */}
              <div className="p-3 space-y-2 font-mono text-xs">
                {/* Hex with Copy */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{color.hex}</span>
                  <button
                    onClick={() => handleCopyValue(color.hex, 'HEX')}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                    title="Copy HEX"
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* RGB & HSL */}
                <div className="space-y-1 text-[11px] text-slate-400">
                  <div
                    onClick={() => handleCopyValue(color.rgb, 'RGB')}
                    className="truncate hover:text-white cursor-pointer"
                    title="Click to copy RGB"
                  >
                    {color.rgb}
                  </div>
                  <div
                    onClick={() => handleCopyValue(color.hsl, 'HSL')}
                    className="truncate hover:text-white cursor-pointer"
                    title="Click to copy HSL"
                  >
                    {color.hsl}
                  </div>
                </div>

                {/* WCAG Accessibility Rating & Frequency */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">Freq: {color.frequency}x</span>

                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">WCAG:</span>
                    <span
                      className={`px-1.5 py-0.2 rounded font-bold ${
                        color.wcagRating === 'AAA'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          : color.wcagRating === 'AA'
                          ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {color.wcagRating}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
