import React, { useState, useMemo } from 'react';
import { ResourceFile } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { downloadResourceFile } from '../../services/exportService';
import { formatBytes } from '../../services/urlUtils';
import {
  FileCode,
  Folder,
  FolderOpen,
  Copy,
  Check,
  Download,
  Search,
  WrapText,
  AlignLeft,
  Info,
  ExternalLink,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

interface SourceCodeTabProps {
  resources: ResourceFile[];
  onTriggerToast: (type: 'success' | 'warn' | 'error' | 'info', title: string, message?: string) => void;
}

export const SourceCodeTab: React.FC<SourceCodeTabProps> = ({ resources, onTriggerToast }) => {
  // Categorize files
  const htmlFiles = resources.filter(r => r.kind === 'html');
  const cssFiles = resources.filter(r => r.kind === 'stylesheet');
  const jsFiles = resources.filter(r => r.kind === 'script');
  const otherFiles = resources.filter(r => !['html', 'stylesheet', 'script'].includes(r.kind));

  const [selectedFileId, setSelectedFileId] = useState<string>(
    resources.find(r => r.content)?.id || resources[0]?.id || ''
  );

  const [folderOpen, setFolderOpen] = useState<{ [key: string]: boolean }>({
    html: true,
    css: true,
    js: true,
    other: false,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [wordWrap, setWordWrap] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedFile = resources.find(r => r.id === selectedFileId) || resources[0];

  const toggleFolder = (key: string) => {
    setFolderOpen(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopy = () => {
    if (!selectedFile?.content) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    onTriggerToast('success', 'Code Copied', `Copied ${selectedFile.name} to clipboard.`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!selectedFile) return;
    try {
      downloadResourceFile(selectedFile);
      onTriggerToast('success', 'Download Started', `Saved ${selectedFile.name}`);
    } catch (err: any) {
      onTriggerToast('warn', 'Download Unavailable', err.message);
    }
  };

  // Split lines for line numbers
  const lines = useMemo(() => {
    if (!selectedFile?.content) return [];
    return selectedFile.content.split('\n');
  }, [selectedFile?.content]);

  // Search match statistics
  const matchCount = useMemo(() => {
    if (!searchQuery.trim() || !selectedFile?.content) return 0;
    const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    return (selectedFile.content.match(regex) || []).length;
  }, [searchQuery, selectedFile?.content]);

  return (
    <div className="h-full w-full flex flex-col md:flex-row overflow-hidden bg-[#0A0B0E]">
      {/* Left Sidebar: File Tree Explorer */}
      <div className="w-full md:w-64 h-48 md:h-full bg-[#0E1016] border-b md:border-b-0 md:border-r border-white/10 flex flex-col shrink-0 overflow-hidden">
        <div className="px-3 py-2.5 bg-[#12151D] border-b border-white/10 flex items-center justify-between text-xs font-mono font-bold text-slate-300">
          <span className="flex items-center gap-1.5 uppercase">
            <Folder className="w-3.5 h-3.5 text-[#FEE75C]" />
            WORKSPACE EXPLORER
          </span>
          <span className="text-[10px] text-slate-500">{resources.length} files</span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-xs select-none">
          {/* HTML Folder */}
          {htmlFiles.length > 0 && (
            <div>
              <button
                onClick={() => toggleFolder('html')}
                className="w-full flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-white rounded hover:bg-white/5 transition-colors"
              >
                {folderOpen.html ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <FolderOpen className="w-3.5 h-3.5 text-[#FEE75C]" />
                <span className="font-semibold text-slate-300">Markup ({htmlFiles.length})</span>
              </button>
              {folderOpen.html && (
                <div className="pl-4 space-y-0.5 mt-0.5">
                  {htmlFiles.map(file => (
                    <button
                      key={file.id}
                      onClick={() => setSelectedFileId(file.id)}
                      className={`w-full flex items-center justify-between px-2 py-1 rounded text-left transition-colors ${
                        selectedFileId === file.id
                          ? 'bg-[#FEE75C]/15 text-[#FEE75C] border border-[#FEE75C]/30 font-semibold'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <span className="truncate mr-1">{file.name}</span>
                      <Badge status={file.status} size="sm" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CSS Folder */}
          {cssFiles.length > 0 && (
            <div>
              <button
                onClick={() => toggleFolder('css')}
                className="w-full flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-white rounded hover:bg-white/5 transition-colors"
              >
                {folderOpen.css ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <FolderOpen className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span className="font-semibold text-slate-300">Stylesheets ({cssFiles.length})</span>
              </button>
              {folderOpen.css && (
                <div className="pl-4 space-y-0.5 mt-0.5">
                  {cssFiles.map(file => (
                    <button
                      key={file.id}
                      onClick={() => setSelectedFileId(file.id)}
                      className={`w-full flex items-center justify-between px-2 py-1 rounded text-left transition-colors ${
                        selectedFileId === file.id
                          ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 font-semibold'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <span className="truncate mr-1">{file.name}</span>
                      <Badge status={file.status} size="sm" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* JS Folder */}
          {jsFiles.length > 0 && (
            <div>
              <button
                onClick={() => toggleFolder('js')}
                className="w-full flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-white rounded hover:bg-white/5 transition-colors"
              >
                {folderOpen.js ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold text-slate-300">Scripts ({jsFiles.length})</span>
              </button>
              {folderOpen.js && (
                <div className="pl-4 space-y-0.5 mt-0.5">
                  {jsFiles.map(file => (
                    <button
                      key={file.id}
                      onClick={() => setSelectedFileId(file.id)}
                      className={`w-full flex items-center justify-between px-2 py-1 rounded text-left transition-colors ${
                        selectedFileId === file.id
                          ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30 font-semibold'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <span className="truncate mr-1">{file.name}</span>
                      <Badge status={file.status} size="sm" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Other / Assets Folder */}
          {otherFiles.length > 0 && (
            <div>
              <button
                onClick={() => toggleFolder('other')}
                className="w-full flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-white rounded hover:bg-white/5 transition-colors"
              >
                {folderOpen.other ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <Folder className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-semibold text-slate-300">Assets ({otherFiles.length})</span>
              </button>
              {folderOpen.other && (
                <div className="pl-4 space-y-0.5 mt-0.5">
                  {otherFiles.map(file => (
                    <button
                      key={file.id}
                      onClick={() => setSelectedFileId(file.id)}
                      className={`w-full flex items-center justify-between px-2 py-1 rounded text-left transition-colors ${
                        selectedFileId === file.id
                          ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <span className="truncate mr-1">{file.name}</span>
                      <Badge status={file.status} size="sm" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Code Viewer & Actions */}
      <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden bg-[#0A0B0E]">
        {/* Editor Toolbar */}
        <div className="px-4 py-2 bg-[#101219] border-b border-white/10 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileCode className="w-4 h-4 text-[#FEE75C] shrink-0" />
            <span className="font-mono text-xs font-bold text-white truncate max-w-xs">
              {selectedFile?.name || 'No file selected'}
            </span>
            {selectedFile && <Badge status={selectedFile.status} size="sm" />}
            {selectedFile?.sizeBytes && (
              <span className="font-mono text-[10px] text-slate-400">
                ({formatBytes(selectedFile.sizeBytes)})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Search in File Input */}
            {selectedFile?.content && (
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Find in file..."
                  className="bg-[#0A0B0E] border border-white/10 rounded px-2 pl-7 py-1 text-xs font-mono text-white placeholder-slate-500 w-36 sm:w-44 focus:outline-none focus:border-[#FEE75C]"
                />
                {searchQuery && (
                  <span className="ml-1 text-[10px] font-mono text-[#00F0FF]">
                    {matchCount} match{matchCount === 1 ? '' : 'es'}
                  </span>
                )}
              </div>
            )}

            {/* Word wrap toggle */}
            <button
              onClick={() => setWordWrap(!wordWrap)}
              className={`p-1.5 rounded border transition-colors ${
                wordWrap
                  ? 'bg-[#FEE75C]/15 border-[#FEE75C]/30 text-[#FEE75C]'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
              title="Toggle Word Wrap"
            >
              <WrapText className="w-3.5 h-3.5" />
            </button>

            {/* Copy Button */}
            {selectedFile?.content && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            )}

            {/* Download Button */}
            {selectedFile?.content && (
              <Button
                size="sm"
                variant="primary"
                onClick={handleDownload}
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Download
              </Button>
            )}
          </div>
        </div>

        {/* Code Content Area */}
        <div className="flex-1 min-h-0 overflow-auto relative select-text bg-[#090A0E] text-slate-200">
          {selectedFile?.content ? (
            <div className="flex text-xs font-mono">
              {/* Line Numbers Column */}
              <div className="w-12 shrink-0 py-3 text-right pr-3 select-none text-slate-600 bg-[#0B0D12] border-r border-white/5 font-mono text-[11px] leading-relaxed">
                {lines.map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Code Pre block */}
              <pre
                className={`flex-1 p-3 m-0 font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto ${
                  wordWrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'
                }`}
              >
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3 font-mono">
              <Info className="w-10 h-10 text-slate-600 mb-1" />
              <p className="text-sm font-bold text-white">Source Content Not Downloaded</p>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                {selectedFile?.errorMessage ||
                  'This asset URL was discovered in the document markup, but its full body was blocked by target CORS policies or anti-bot protections.'}
              </p>
              {selectedFile?.url && (
                <a
                  href={selectedFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#00F0FF] hover:underline flex items-center gap-1 mt-2"
                >
                  Inspect in External Tab
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Editor Bottom Info Bar */}
        <div className="h-6 px-4 bg-[#0B0D12] border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400 shrink-0">
          <span className="truncate">
            ORIGIN: <span className="text-slate-300">{selectedFile?.strategyUsed || 'N/A'}</span>
          </span>
          <span className="text-slate-400">
            {lines.length} lines &bull; {selectedFile?.sizeBytes ? formatBytes(selectedFile.sizeBytes) : 'Discovered Only'}
          </span>
        </div>
      </div>
    </div>
  );
};
