import React, { useState } from 'react';
import { AnalysisResult } from '../../types';
import { Button } from '../common/Button';
import {
  exportFullZipPackage,
  downloadTextFile,
  generatePlainTextSummary,
  generateManifest,
} from '../../services/exportService';
import {
  generateCssVariablesExport,
  generateTailwindExport,
  generateScssExport,
} from '../../services/colorExtractor';
import {
  Download,
  Archive,
  FileJson,
  FileText,
  Palette,
  ShieldCheck,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';

interface ExportTabProps {
  analysis: AnalysisResult;
  onTriggerToast: (type: 'success' | 'warn' | 'error' | 'info', title: string, message?: string) => void;
}

export const ExportTab: React.FC<ExportTabProps> = ({ analysis, onTriggerToast }) => {
  const [isZipping, setIsZipping] = useState(false);
  const [copiedManifest, setCopiedManifest] = useState(false);

  const manifest = generateManifest(analysis);
  const manifestString = JSON.stringify(manifest, null, 2);

  const handleZipDownload = async () => {
    setIsZipping(true);
    try {
      await exportFullZipPackage(analysis);
      onTriggerToast('success', 'Bundle Generated', 'Downloaded structured intelligence ZIP package.');
    } catch (err: any) {
      onTriggerToast('error', 'Export Failed', err.message);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadReport = (type: 'json' | 'txt') => {
    const domain = analysis.metadata.domain.replace(/[^a-zA-Z0-9_-]/g, '_');
    if (type === 'json') {
      downloadTextFile(
        JSON.stringify(analysis, null, 2),
        `echo-${domain}-intelligence.json`,
        'application/json'
      );
      onTriggerToast('success', 'JSON Exported', 'Downloaded full intelligence telemetry object.');
    } else {
      downloadTextFile(
        generatePlainTextSummary(analysis),
        `echo-${domain}-summary.txt`,
        'text/plain'
      );
      onTriggerToast('success', 'Summary Exported', 'Downloaded plain-text analysis report.');
    }
  };

  const handleCopyManifest = () => {
    navigator.clipboard.writeText(manifestString);
    setCopiedManifest(true);
    onTriggerToast('success', 'Manifest Copied', 'Copied retrieval manifest to clipboard.');
    setTimeout(() => setCopiedManifest(false), 2000);
  };

  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden p-4 md:p-6 space-y-6 bg-[#0A0B0E] select-text">
      {/* Hero ZIP Export Station */}
      <div className="bg-gradient-to-r from-[#141722] via-[#161a26] to-[#12141c] border border-[#FEE75C]/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(254,231,92,0.1)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FEE75C]/10 border border-[#FEE75C]/30 text-[#FEE75C] font-mono text-[10px] uppercase font-bold mb-2">
            <Sparkles className="w-3 h-3" />
            STANDALONE OFFLINE ARCHIVE
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Export Complete Intelligence ZIP Package
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Packages all retrieved HTML, CSS, JavaScript files, color palettes (CSS/Tailwind/JSON), metadata reports, and honest audit manifests into a clean, structured ZIP archive.
          </p>
        </div>

        <Button
          size="lg"
          variant="primary"
          onClick={handleZipDownload}
          loading={isZipping}
          icon={<Archive className="w-5 h-5" />}
          className="px-6 py-3 font-bold"
        >
          {isZipping ? 'Assembling ZIP...' : 'Download Full ZIP Bundle'}
        </Button>
      </div>

      {/* Individual Export Formats Grid */}
      <div>
        <h3 className="text-xs font-mono font-bold uppercase text-slate-400 mb-3">
          INDIVIDUAL EXPORT FORMATS
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* JSON Full Telemetry */}
          <div className="p-4 bg-[#111319] border border-white/10 rounded-xl flex flex-col justify-between gap-4">
            <div>
              <FileJson className="w-6 h-6 text-[#00F0FF] mb-2" />
              <h4 className="text-sm font-bold text-white mb-1">Full JSON Report</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Complete raw intelligence object with metadata, DOM tree, colors, and diagnostic events.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDownloadReport('json')}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Export JSON
            </Button>
          </div>

          {/* Plain Text Summary */}
          <div className="p-4 bg-[#111319] border border-white/10 rounded-xl flex flex-col justify-between gap-4">
            <div>
              <FileText className="w-6 h-6 text-[#FEE75C] mb-2" />
              <h4 className="text-sm font-bold text-white mb-1">Plain-Text Summary</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Markdown / TXT formatted executive breakdown, perfect for team sharing or documentation.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDownloadReport('txt')}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Export TXT
            </Button>
          </div>

          {/* CSS Custom Properties */}
          <div className="p-4 bg-[#111319] border border-white/10 rounded-xl flex flex-col justify-between gap-4">
            <div>
              <Palette className="w-6 h-6 text-purple-400 mb-2" />
              <h4 className="text-sm font-bold text-white mb-1">CSS Design Tokens</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ready-to-use CSS custom properties (:root) with WCAG rating comments.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                downloadTextFile(
                  generateCssVariablesExport(analysis.colors),
                  'tokens.css',
                  'text/css'
                );
                onTriggerToast('success', 'CSS Exported', 'Saved tokens.css');
              }}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Export CSS
            </Button>
          </div>

          {/* Tailwind Config */}
          <div className="p-4 bg-[#111319] border border-white/10 rounded-xl flex flex-col justify-between gap-4">
            <div>
              <Palette className="w-6 h-6 text-emerald-400 mb-2" />
              <h4 className="text-sm font-bold text-white mb-1">Tailwind Config</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tailwind theme extension config containing the site's extracted color palette.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                downloadTextFile(
                  generateTailwindExport(analysis.colors),
                  'tailwind.config.js',
                  'application/javascript'
                );
                onTriggerToast('success', 'Tailwind Exported', 'Saved tailwind.config.js');
              }}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Export Tailwind
            </Button>
          </div>
        </div>
      </div>

      {/* Retrieval Manifest Preview Panel */}
      <div className="bg-[#111319] border border-white/10 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-mono font-bold uppercase text-white">
              VERIFIED RETRIEVAL MANIFEST (retrieval-manifest.json)
            </h3>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopyManifest}
            icon={copiedManifest ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copiedManifest ? 'Copied' : 'Copy Manifest'}
          </Button>
        </div>

        <p className="text-xs text-slate-400 mb-3 font-mono">
          Honest audit distinguishing retrieved, user-provided, discovered-only, and blocked files.
        </p>

        <pre className="p-4 bg-[#090A0E] rounded-lg border border-white/10 text-xs font-mono text-slate-300 max-h-72 overflow-auto select-text leading-relaxed">
          <code>{manifestString}</code>
        </pre>
      </div>
    </div>
  );
};
