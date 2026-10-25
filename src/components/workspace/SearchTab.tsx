import React, { useState, useMemo } from 'react';
import { AnalysisResult } from '../../types';
import { Badge } from '../common/Badge';
import { Search, FileCode, Palette, Heading, Link, Globe, ArrowRight } from 'lucide-react';

interface SearchTabProps {
  analysis: AnalysisResult;
  onSelectTab: (tab: any) => void;
}

interface SearchMatch {
  category: 'Source Code' | 'Color Token' | 'Heading' | 'Resource' | 'Metadata';
  title: string;
  location: string;
  snippet: string;
  tabTarget?: string;
}

export const SearchTab: React.FC<SearchTabProps> = ({ analysis, onSelectTab }) => {
  const [query, setQuery] = useState('');

  const matches: SearchMatch[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return [];

    const results: SearchMatch[] = [];

    // 1. Search in Metadata
    if (analysis.metadata.title.toLowerCase().includes(q)) {
      results.push({
        category: 'Metadata',
        title: 'Page Title',
        location: 'Document Head',
        snippet: analysis.metadata.title,
        tabTarget: 'overview',
      });
    }
    if (analysis.metadata.description.toLowerCase().includes(q)) {
      results.push({
        category: 'Metadata',
        title: 'Meta Description',
        location: 'Document Head',
        snippet: analysis.metadata.description,
        tabTarget: 'overview',
      });
    }

    // 2. Search in Headings
    analysis.content.headings.forEach(h => {
      if (h.text.toLowerCase().includes(q)) {
        results.push({
          category: 'Heading',
          title: `H${h.level} Heading`,
          location: `DOM Structure <h${h.level}>`,
          snippet: h.text,
          tabTarget: 'content',
        });
      }
    });

    // 3. Search in Colors
    analysis.colors.forEach(c => {
      if (
        c.hex.toLowerCase().includes(q) ||
        c.rgb.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q)
      ) {
        results.push({
          category: 'Color Token',
          title: `${c.hex} (${c.role.toUpperCase()})`,
          location: `Palette Frequency: ${c.frequency}x`,
          snippet: `${c.rgb} &bull; ${c.hsl}`,
          tabTarget: 'colors',
        });
      }
    });

    // 4. Search in Resources
    analysis.resources.forEach(r => {
      if (r.name.toLowerCase().includes(q) || r.url.toLowerCase().includes(q)) {
        results.push({
          category: 'Resource',
          title: r.name,
          location: `${r.kind.toUpperCase()} (${r.status})`,
          snippet: r.url,
          tabTarget: 'source',
        });
      }

      // Search inside source content lines
      if (r.content) {
        const lines = r.content.split('\n');
        lines.slice(0, 1000).forEach((line, idx) => {
          if (line.toLowerCase().includes(q)) {
            if (results.length < 150) {
              results.push({
                category: 'Source Code',
                title: `${r.name} : line ${idx + 1}`,
                location: r.kind,
                snippet: line.trim(),
                tabTarget: 'source',
              });
            }
          }
        });
      }
    });

    return results;
  }, [query, analysis]);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[#0A0B0E]">
      {/* Search Bar Header */}
      <div className="p-4 md:p-6 bg-[#101219] border-b border-white/10 shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search across files, DOM tags, CSS selectors, colors, functions, headings..."
              className="w-full bg-[#0A0B0E] border border-white/20 rounded-xl py-3 pl-12 pr-4 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#FEE75C] focus:shadow-[0_0_20px_rgba(254,231,92,0.2)] transition-all"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mt-2 px-1">
            <span>
              {query.trim().length >= 2
                ? `${matches.length} match${matches.length === 1 ? '' : 'es'} discovered`
                : 'Enter 2 or more characters to trigger search across all layers'}
            </span>
            <span className="text-slate-500">Instant Telemetry Filter</span>
          </div>
        </div>
      </div>

      {/* Results Viewport */}
      <div className="flex-1 min-h-0 min-w-0 overflow-y-auto p-4 md:p-6 select-text">
        <div className="max-w-3xl mx-auto space-y-3">
          {query.trim().length < 2 ? (
            <div className="text-center py-16 text-slate-500 font-mono text-xs">
              <Search className="w-10 h-10 mx-auto mb-3 text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">Global Website Search</p>
              <p className="mt-1">Quickly find CSS rules, JavaScript code, color codes (#hex), or headings.</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-16 text-slate-500 font-mono text-xs">
              <p className="text-sm font-semibold text-white">No matches found for "{query}"</p>
              <p className="mt-1">Try another keyword, CSS selector, or color HEX.</p>
            </div>
          ) : (
            matches.map((m, idx) => {
              const categoryColor = {
                'Source Code': 'yellow',
                'Color Token': 'violet',
                Heading: 'cyan',
                Resource: 'green',
                Metadata: 'slate',
              }[m.category] as any;

              return (
                <div
                  key={idx}
                  onClick={() => m.tabTarget && onSelectTab(m.tabTarget)}
                  className="p-4 bg-[#111319] border border-white/10 rounded-xl hover:border-[#FEE75C]/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-2 mb-2 font-mono text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <Badge variant={categoryColor} size="sm">
                        {m.category}
                      </Badge>
                      <span className="font-bold text-white group-hover:text-[#FEE75C] transition-colors truncate">
                        {m.title}
                      </span>
                    </div>
                    <span className="text-slate-500 text-[10px] shrink-0">{m.location}</span>
                  </div>

                  <p className="text-xs font-mono text-slate-300 bg-[#090A0E] p-2.5 rounded border border-white/5 break-all line-clamp-2">
                    {m.snippet}
                  </p>

                  <div className="mt-2 flex justify-end">
                    <span className="text-[10px] font-mono text-[#00F0FF] group-hover:underline inline-flex items-center gap-1">
                      Jump to view <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
