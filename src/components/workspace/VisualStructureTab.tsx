import React, { useState } from 'react';
import { AnalysisResult, DOMTreeNode, RelationshipNode } from '../../types';
import { Badge } from '../common/Badge';
import {
  Network,
  ChevronRight,
  ChevronDown,
  Layers,
  Code2,
  FileCode,
  Globe,
  Search,
  Eye,
  Info,
} from 'lucide-react';

interface VisualStructureTabProps {
  analysis: AnalysisResult;
}

export const VisualStructureTab: React.FC<VisualStructureTabProps> = ({ analysis }) => {
  const [viewMode, setViewMode] = useState<'dom' | 'components' | 'graph'>('dom');
  const [selectedDomNode, setSelectedDomNode] = useState<DOMTreeNode | null>(null);
  const [treeSearch, setTreeSearch] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<{ [id: string]: boolean }>({
    'dom-root': true,
    'dom-1': true,
    'dom-2': true,
  });

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Recursive DOM Tree Node Component
  const renderDomTree = (node: DOMTreeNode, depth: number = 0) => {
    const isExpanded = !!expandedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedDomNode?.id === node.id;

    const matchesSearch =
      treeSearch &&
      (node.tag.toLowerCase().includes(treeSearch.toLowerCase()) ||
        node.classes.some(c => c.toLowerCase().includes(treeSearch.toLowerCase())) ||
        (node.idAttr && node.idAttr.toLowerCase().includes(treeSearch.toLowerCase())));

    return (
      <div key={node.id} className="font-mono text-xs select-none">
        <div
          onClick={() => setSelectedDomNode(node)}
          style={{ paddingLeft: `${depth * 14 + 6}px` }}
          className={`flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer transition-colors ${
            isSelected
              ? 'bg-[#FEE75C]/20 border border-[#FEE75C]/40 text-[#FEE75C]'
              : matchesSearch
              ? 'bg-[#00F0FF]/15 text-[#00F0FF]'
              : 'hover:bg-white/5 text-slate-300'
          }`}
        >
          {hasChildren ? (
            <button
              onClick={e => toggleExpand(node.id, e)}
              className="p-0.5 text-slate-500 hover:text-white"
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <span className="w-3.5 h-3.5 inline-block" />
          )}

          <span className="text-purple-400 font-bold">&lt;{node.tag}</span>

          {node.idAttr && <span className="text-[#FEE75C]">#{node.idAttr}</span>}

          {node.classes.length > 0 && (
            <span className="text-cyan-300 truncate max-w-[200px]">
              .{node.classes.slice(0, 3).join('.')}
            </span>
          )}

          <span className="text-purple-400 font-bold">&gt;</span>

          {node.childCount > 0 && (
            <span className="text-[10px] text-slate-500 ml-1">
              ({node.childCount} children)
            </span>
          )}

          {node.textPreview && (
            <span className="text-[10px] text-slate-400 truncate max-w-[150px] italic ml-1">
              "{node.textPreview}"
            </span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l border-white/5 ml-3">
            {node.children!.map(child => renderDomTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[#0A0B0E]">
      {/* Top Controls Bar */}
      <div className="px-4 py-2.5 bg-[#101219] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('dom')}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              viewMode === 'dom'
                ? 'bg-[#FEE75C] text-[#0A0B0E] font-bold shadow-[0_0_10px_rgba(254,231,92,0.3)]'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            DOM Tree Inspector
          </button>

          <button
            onClick={() => setViewMode('graph')}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              viewMode === 'graph'
                ? 'bg-[#00F0FF] text-[#0A0B0E] font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            Resource Relationship Graph
          </button>

          <button
            onClick={() => setViewMode('components')}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              viewMode === 'components'
                ? 'bg-purple-500 text-white font-bold'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Component Architecture
          </button>
        </div>

        {viewMode === 'dom' && (
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={treeSearch}
              onChange={e => setTreeSearch(e.target.value)}
              placeholder="Filter tag, class, or id..."
              className="bg-[#0A0B0E] border border-white/10 rounded px-2 pl-8 py-1 text-xs font-mono text-white placeholder-slate-500 w-48 sm:w-64 focus:outline-none focus:border-[#FEE75C]"
            />
          </div>
        )}
      </div>

      {/* Main Visualization Viewport */}
      <div className="flex-1 min-h-0 min-w-0 overflow-hidden relative">
        {viewMode === 'dom' && (
          <div className="h-full w-full flex flex-col md:flex-row overflow-hidden">
            {/* Tree View Column */}
            <div className="flex-1 h-full overflow-y-auto p-4 bg-[#090A0E] border-r border-white/10">
              <div className="mb-2 text-xs font-mono text-slate-500 uppercase flex items-center justify-between">
                <span>DOCUMENT OBJECT MODEL HIERARCHY</span>
                <span>Click node for attribute breakdown</span>
              </div>
              <div className="space-y-0.5">{renderDomTree(analysis.domTree)}</div>
            </div>

            {/* Node Inspector Panel */}
            <div className="w-full md:w-80 h-64 md:h-full bg-[#111319] p-4 overflow-y-auto shrink-0 border-t md:border-t-0 border-white/10 font-mono text-xs">
              <div className="text-xs font-bold text-white uppercase flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                <Eye className="w-4 h-4 text-[#FEE75C]" />
                Selected Node Inspector
              </div>

              {selectedDomNode ? (
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">TAG NAME</span>
                    <span className="text-sm font-bold text-purple-400">
                      &lt;{selectedDomNode.tag}&gt;
                    </span>
                  </div>

                  {selectedDomNode.idAttr && (
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">ID SELECTOR</span>
                      <span className="text-[#FEE75C] font-semibold">#{selectedDomNode.idAttr}</span>
                    </div>
                  )}

                  {selectedDomNode.classes.length > 0 && (
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block mb-1">
                        CLASS LIST ({selectedDomNode.classes.length})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedDomNode.classes.map(c => (
                          <span
                            key={c}
                            className="text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-cyan-300"
                          >
                            .{c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {Object.keys(selectedDomNode.attributes).length > 0 && (
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block mb-1">
                        ATTRIBUTES
                      </span>
                      <div className="space-y-1">
                        {Object.entries(selectedDomNode.attributes).map(([k, v]) => (
                          <div key={k} className="p-1.5 bg-[#0A0B0E] rounded border border-white/5 text-[11px] break-all">
                            <span className="text-[#00F0FF]">{k}: </span>
                            <span className="text-slate-300">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDomNode.textPreview && (
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block mb-1">
                        INNER TEXT EXCERPT
                      </span>
                      <p className="p-2 bg-[#0A0B0E] rounded border border-white/5 text-slate-300 text-[11px] leading-relaxed">
                        {selectedDomNode.textPreview}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Info className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p>Click any node in the DOM tree to view its attributes, class tokens, and text content.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'graph' && (
          <div className="h-full w-full overflow-y-auto p-6 bg-[#090A0E] flex flex-col items-center">
            <div className="max-w-4xl w-full">
              <div className="mb-4 text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>INTERACTIVE RESOURCE DEPENDENCY GRAPH</span>
                <span>{analysis.relationships.nodes.length} nodes connected</span>
              </div>

              {/* Central Graph Visual Grid */}
              <div className="bg-[#10121A] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                {/* Center Root Document */}
                <div className="flex flex-col items-center mb-8">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#FEE75C]/20 to-[#00F0FF]/20 border-2 border-[#FEE75C] shadow-[0_0_20px_rgba(254,231,92,0.3)] text-center max-w-sm">
                    <Globe className="w-6 h-6 text-[#FEE75C] mx-auto mb-1 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-white block">
                      {analysis.metadata.domain}
                    </span>
                    <span className="text-[10px] font-mono text-slate-300">
                      Root Document (index.html)
                    </span>
                  </div>
                  <div className="w-[2px] h-6 bg-gradient-to-b from-[#FEE75C] to-transparent"></div>
                </div>

                {/* Satellite Connected Resource Nodes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {analysis.relationships.nodes
                    .filter(n => n.id !== 'doc-root')
                    .map(node => {
                      const borderColor = {
                        stylesheet: 'border-cyan-500/30 hover:border-cyan-400',
                        script: 'border-amber-400/30 hover:border-amber-400',
                        image: 'border-purple-500/30 hover:border-purple-400',
                        font: 'border-emerald-500/30 hover:border-emerald-400',
                        manifest: 'border-green-500/30 hover:border-green-400',
                        document: 'border-white/20',
                        external: 'border-slate-700',
                      }[node.type];

                      return (
                        <div
                          key={node.id}
                          className={`p-3 rounded-lg bg-[#141722] border ${borderColor} transition-all hover:scale-[1.02] flex items-center justify-between gap-2`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileCode className="w-4 h-4 text-slate-400 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-xs font-mono font-semibold text-white block truncate">
                                {node.label}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 uppercase">
                                {node.type}
                              </span>
                            </div>
                          </div>
                          <Badge status={node.status} size="sm" />
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'components' && (
          <div className="h-full w-full overflow-y-auto p-6 bg-[#090A0E] space-y-4">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="text-xs font-mono text-slate-400 uppercase mb-2">
                STRUCTURAL COMPONENT DECOMPOSITION
              </div>

              {/* Header Component */}
              <div className="p-4 bg-[#111319] border border-white/10 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-white font-mono uppercase text-[#FEE75C]">
                    &lt;header&gt; Navigation & Branding Zone
                  </h4>
                  <Badge variant="yellow">Declared</Badge>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Houses the primary brand identity, navigation anchor links, and top-level call to actions.
                </p>
              </div>

              {/* Main Content Component */}
              <div className="p-4 bg-[#111319] border border-white/10 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-white font-mono uppercase text-[#00F0FF]">
                    &lt;main&gt; Primary Document Corpus
                  </h4>
                  <Badge variant="cyan">Extracted</Badge>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  Encapsulates the core article text, section partitions, hero banners, and media graphics.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="p-2 bg-[#161922] rounded border border-white/5">
                    <span className="text-slate-500 block text-[10px]">HEADINGS</span>
                    <span className="text-white font-bold">{analysis.content.headings.length}</span>
                  </div>
                  <div className="p-2 bg-[#161922] rounded border border-white/5">
                    <span className="text-slate-500 block text-[10px]">WORD CORPUS</span>
                    <span className="text-white font-bold">{analysis.content.wordCount}</span>
                  </div>
                  <div className="p-2 bg-[#161922] rounded border border-white/5">
                    <span className="text-slate-500 block text-[10px]">MEDIA ITEMS</span>
                    <span className="text-white font-bold">{analysis.content.images.length}</span>
                  </div>
                  <div className="p-2 bg-[#161922] rounded border border-white/5">
                    <span className="text-slate-500 block text-[10px]">HYPERLINKS</span>
                    <span className="text-white font-bold">{analysis.content.links.length}</span>
                  </div>
                </div>
              </div>

              {/* Footer Component */}
              <div className="p-4 bg-[#111319] border border-white/10 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-white font-mono uppercase text-purple-400">
                    &lt;footer&gt; Base Telemetry & Colophon
                  </h4>
                  <Badge variant="violet">Inferred</Badge>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Terminal component containing legal disclosures, copyright stamps, sitemap links, and secondary navigation.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
