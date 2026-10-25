import React, { useState } from 'react';
import { AnalysisResult } from '../../types';
import { Badge } from '../common/Badge';
import {
  FileText,
  Heading,
  Link2,
  Image as ImageIcon,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
} from 'lucide-react';

interface ContentTabProps {
  analysis: AnalysisResult;
}

export const ContentTab: React.FC<ContentTabProps> = ({ analysis }) => {
  const [subTab, setSubTab] = useState<'headings' | 'text' | 'links' | 'images'>('headings');
  const [linkFilter, setLinkFilter] = useState<'all' | 'internal' | 'external'>('all');
  const [imgFilter, setImgFilter] = useState<'all' | 'hasAlt' | 'missingAlt'>('all');

  const c = analysis.content;

  const filteredLinks = c.links.filter(l => {
    if (linkFilter === 'internal') return !l.isExternal;
    if (linkFilter === 'external') return l.isExternal;
    return true;
  });

  const filteredImages = c.images.filter(img => {
    if (imgFilter === 'hasAlt') return img.hasAlt && !img.isDecorative;
    if (imgFilter === 'missingAlt') return !img.hasAlt;
    return true;
  });

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[#0A0B0E]">
      {/* Sub-navigation Bar */}
      <div className="px-4 py-2.5 bg-[#101219] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('headings')}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              subTab === 'headings'
                ? 'bg-[#FEE75C] text-[#0A0B0E] font-bold'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Heading className="w-3.5 h-3.5" />
            Headings Outline ({c.headings.length})
          </button>

          <button
            onClick={() => setSubTab('text')}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              subTab === 'text'
                ? 'bg-[#00F0FF] text-[#0A0B0E] font-bold'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Corpus Text ({c.wordCount} words)
          </button>

          <button
            onClick={() => setSubTab('links')}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              subTab === 'links'
                ? 'bg-purple-500 text-white font-bold'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            Links Audit ({c.links.length})
          </button>

          <button
            onClick={() => setSubTab('images')}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              subTab === 'images'
                ? 'bg-emerald-500 text-[#0A0B0E] font-bold'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Media & Alt Audit ({c.images.length})
          </button>
        </div>

        {/* Reading Time Stats */}
        <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1 text-slate-300">
            <BookOpen className="w-3.5 h-3.5 text-[#FEE75C]" />
            {c.wordCount.toLocaleString()} words
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-[#00F0FF]" />
            ~{c.readingTimeMinutes} min read
          </span>
        </div>
      </div>

      {/* Main Tab Content Viewport */}
      <div className="flex-1 min-h-0 min-w-0 overflow-y-auto p-4 md:p-6 select-text">
        {/* Headings Outline View */}
        {subTab === 'headings' && (
          <div className="max-w-4xl space-y-3">
            <div className="text-xs font-mono text-slate-400 uppercase mb-3">
              DOCUMENT HEADING HIERARCHY (H1 - H6)
            </div>

            {c.headings.length === 0 ? (
              <p className="text-slate-500 text-xs py-8">No standard heading tags found in document.</p>
            ) : (
              c.headings.map((h, i) => {
                const indent = (h.level - 1) * 16;
                const levelColor = {
                  1: 'text-[#FEE75C] border-[#FEE75C]/40 bg-[#FEE75C]/10',
                  2: 'text-[#00F0FF] border-[#00F0FF]/40 bg-[#00F0FF]/10',
                  3: 'text-purple-400 border-purple-500/40 bg-purple-500/10',
                  4: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
                  5: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
                  6: 'text-slate-400 border-slate-700 bg-slate-800',
                }[h.level] || 'text-white';

                return (
                  <div
                    key={i}
                    style={{ marginLeft: `${indent}px` }}
                    className="p-3 bg-[#111319] border border-white/5 rounded-lg flex items-center gap-3 font-mono text-xs hover:border-white/20 transition-colors"
                  >
                    <span
                      className={`w-7 h-7 rounded border font-bold flex items-center justify-center shrink-0 ${levelColor}`}
                    >
                      H{h.level}
                    </span>
                    <span className="text-white font-medium break-all">{h.text}</span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Text Corpus View */}
        {subTab === 'text' && (
          <div className="max-w-4xl space-y-4">
            <div className="p-4 bg-[#111319] border border-white/10 rounded-xl flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">EXTRACTED READABLE TEXT CONTENT</span>
              <span className="text-[#00F0FF]">
                {c.paragraphs.length} structured paragraphs discovered
              </span>
            </div>

            <div className="space-y-3">
              {c.paragraphs.map((para, i) => (
                <div
                  key={i}
                  className="p-4 bg-[#111319] border border-white/5 rounded-xl text-xs text-slate-300 leading-relaxed font-sans"
                >
                  {para}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Links Audit View */}
        {subTab === 'links' && (
          <div className="max-w-5xl space-y-4">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10 font-mono text-xs">
              <div className="flex gap-2">
                {(['all', 'internal', 'external'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setLinkFilter(f)}
                    className={`px-3 py-1 rounded capitalize transition-colors ${
                      linkFilter === f
                        ? 'bg-[#FEE75C] text-[#0A0B0E] font-bold'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {f} (
                    {f === 'all'
                      ? c.links.length
                      : f === 'internal'
                      ? c.links.filter(l => !l.isExternal).length
                      : c.links.filter(l => l.isExternal).length}
                    )
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#111319]">
              <table className="w-full text-xs font-mono text-left border-collapse">
                <thead>
                  <tr className="bg-[#161922] border-b border-white/10 text-slate-400">
                    <th className="p-3">ANCHOR TEXT</th>
                    <th className="p-3">DESTINATION URL</th>
                    <th className="p-3">TYPE</th>
                    <th className="p-3">TARGET</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {filteredLinks.map((l, i) => (
                    <tr key={i} className="hover:bg-white/5">
                      <td className="p-3 font-semibold text-white truncate max-w-xs">{l.text}</td>
                      <td className="p-3">
                        <a
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#00F0FF] hover:underline flex items-center gap-1 truncate max-w-sm"
                        >
                          {l.href}
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>
                      <td className="p-3">
                        {l.isExternal ? (
                          <Badge variant="violet" size="sm">
                            External
                          </Badge>
                        ) : (
                          <Badge variant="cyan" size="sm">
                            Internal
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 text-slate-500">{l.target || '_self'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Media & Images Audit View */}
        {subTab === 'images' && (
          <div className="max-w-5xl space-y-4">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10 font-mono text-xs">
              <div className="flex gap-2">
                {(['all', 'hasAlt', 'missingAlt'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setImgFilter(f)}
                    className={`px-3 py-1 rounded capitalize transition-colors ${
                      imgFilter === f
                        ? 'bg-[#FEE75C] text-[#0A0B0E] font-bold'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {f === 'hasAlt'
                      ? 'Accessible Alt'
                      : f === 'missingAlt'
                      ? 'Missing Alt (Audit)'
                      : 'All'}{' '}
                    (
                    {f === 'all'
                      ? c.images.length
                      : f === 'hasAlt'
                      ? c.images.filter(img => img.hasAlt && !img.isDecorative).length
                      : c.images.filter(img => !img.hasAlt).length}
                    )
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredImages.map((img, i) => (
                <div
                  key={i}
                  className="bg-[#111319] border border-white/10 rounded-xl overflow-hidden flex flex-col justify-between"
                >
                  <div className="h-32 bg-[#161922] overflow-hidden flex items-center justify-center p-2 relative">
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-contain"
                      onError={e => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="p-3 font-mono text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">ALT ATTRIBUTE</span>
                      {img.hasAlt ? (
                        <span className="text-emerald-400 flex items-center gap-1 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> PASS
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1 text-[10px] font-bold">
                          <AlertTriangle className="w-3 h-3" /> MISSING
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 text-xs italic truncate">
                      {img.alt ? `"${img.alt}"` : 'No alt text provided'}
                    </p>
                    <a
                      href={img.src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-[#00F0FF] hover:underline truncate block"
                    >
                      {img.src}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
