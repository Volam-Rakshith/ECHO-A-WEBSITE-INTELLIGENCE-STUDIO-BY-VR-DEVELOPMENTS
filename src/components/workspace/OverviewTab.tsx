import React from 'react';
import { AnalysisResult } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { formatBytes } from '../../services/urlUtils';
import {
  Globe,
  ShieldCheck,
  ShieldAlert,
  Clock,
  FileCode,
  Palette,
  ExternalLink,
  Share2,
  Bookmark,
  Sparkles,
  Info,
  Cpu,
  Shield,
  Layers,
  FileSpreadsheet,
  Braces,
  Smartphone,
  Lock,
} from 'lucide-react';

interface OverviewTabProps {
  analysis: AnalysisResult;
  onSaveToVault: () => void;
  isSavedInVault: boolean;
  onSelectTab: (tab: any) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  analysis,
  onSaveToVault,
  isSavedInVault,
  onSelectTab,
}) => {
  const m = analysis.metadata;
  const s = analysis.stats;
  const sec = m.security;

  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden p-4 md:p-6 space-y-6 select-text bg-[#0A0B0E]">
      {/* Top Banner: Identity & Quick Actions */}
      <div className="bg-[#111319] border border-white/10 rounded-xl p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#161922] border border-white/10 p-2 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            {m.favicon ? (
              <img
                src={m.favicon}
                alt=""
                className="w-8 h-8 rounded object-contain"
                onError={e => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <Globe className="w-8 h-8 text-[#00F0FF]" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-white tracking-tight">{m.title}</h2>
              <Badge status={s.htmlStatus} />
              <Badge variant="cyan">{m.language}</Badge>
              {s.isPrivateOrLocal && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> PRIVATE / INTRANET
                </span>
              )}
            </div>
            <a
              href={m.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-[#00F0FF] hover:underline flex items-center gap-1 max-w-lg truncate"
            >
              {m.url}
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
            {m.description && (
              <p className="text-xs text-slate-300 mt-2 max-w-3xl leading-relaxed">
                {m.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
          <Button
            size="sm"
            variant={isSavedInVault ? 'outline' : 'primary'}
            onClick={onSaveToVault}
            icon={<Bookmark className="w-3.5 h-3.5" />}
          >
            {isSavedInVault ? 'Saved to Vault' : 'Save to Vault'}
          </Button>
          <Button
            size="sm"
            variant="cyan"
            onClick={() => onSelectTab('export')}
            icon={<Share2 className="w-3.5 h-3.5" />}
          >
            Export Package
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111319] border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>PIPELINE LATENCY</span>
            <Clock className="w-4 h-4 text-[#FEE75C]" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {(s.analysisDurationMs / 1000).toFixed(2)}
            <span className="text-sm font-normal text-slate-400 ml-1">sec</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            Strategy: <span className="text-[#00F0FF]">{s.primaryStrategy}</span>
          </p>
        </div>

        <div className="bg-[#111319] border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>RESOURCES RETRIEVED</span>
            <FileCode className="w-4 h-4 text-[#00F0FF]" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {s.totalRetrieved}
            <span className="text-sm font-normal text-slate-400 ml-1">/ {s.totalDiscovered}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            Payload: {formatBytes(s.totalSize)}
          </p>
        </div>

        <div className="bg-[#111319] border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>COLOR PALETTE</span>
            <Palette className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {analysis.colors.length}
            <span className="text-sm font-normal text-slate-400 ml-1">tokens</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            Brand: {analysis.brand.brandName}
          </p>
        </div>

        <div className="bg-[#111319] border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>SECURITY GRADE</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-lg font-black ${
                sec.grade === 'A+' || sec.grade === 'A'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : sec.grade === 'B'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              {sec.grade}
            </span>
            <span className="text-xs text-slate-400 font-normal">Score: {sec.score}/100</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            {sec.isHttps ? 'HTTPS Transport' : 'Unencrypted HTTP'}
          </p>
        </div>
      </div>

      {/* Technology Stack & Framework Detection */}
      <div className="bg-[#111319] border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-bold font-mono uppercase text-white flex items-center gap-2 mb-3">
          <Cpu className="w-4 h-4 text-[#FEE75C]" />
          Detected Technology Stack & Architecture ({m.techStack.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {m.techStack.map((tech, i) => (
            <div
              key={i}
              className="p-3 bg-[#161922] border border-white/5 rounded-lg flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-bold text-white text-xs">{tech.name}</span>
                <Badge variant="cyan" size="sm">
                  {tech.category}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">{tech.description}</p>
              {tech.version && (
                <span className="text-[10px] font-mono text-[#FEE75C] mt-2 block">
                  Version: {tech.version}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Specifications & Security Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Metadata Specifications Table */}
        <div className="bg-[#111319] border border-white/10 rounded-xl p-5 flex flex-col">
          <h3 className="text-sm font-bold font-mono uppercase text-white flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-[#00F0FF]" />
            Document Metadata Specifications
          </h3>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">Canonical Target</span>
              <span className="text-white truncate max-w-xs">{m.canonicalUrl || 'Not declared'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">Character Encoding</span>
              <span className="text-white">{m.charset}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">Declared Language</span>
              <span className="text-white">{m.language}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">Viewport Config</span>
              <span className="text-white truncate max-w-xs">{m.viewport || 'None'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">Author / Organization</span>
              <span className="text-white truncate max-w-xs">{m.author || 'Unspecified'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">CMS / Generator</span>
              <span className="text-white">{m.generator || 'Custom / Handcrafted'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">Primary Font Detected</span>
              <span className="text-white">{analysis.brand.fonts[0]?.family || 'System Sans-Serif'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">Keyword Tags ({m.keywords.length})</span>
              <span className="text-white truncate max-w-xs">
                {m.keywords.length > 0 ? m.keywords.join(', ') : 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Security & Cryptographic Audit */}
        <div className="bg-[#111319] border border-white/10 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold font-mono uppercase text-white flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Security & Header Defense Telemetry
            </h3>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="p-2.5 bg-[#161922] rounded border border-white/5 flex items-center justify-between">
                <span className="text-slate-300">HTTPS Transport</span>
                <span className={sec.isHttps ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {sec.isHttps ? 'ENCRYPTED (PASS)' : 'INSECURE HTTP'}
                </span>
              </div>
              <div className="p-2.5 bg-[#161922] rounded border border-white/5 flex items-center justify-between">
                <span className="text-slate-300">Content Security Policy (CSP)</span>
                <span className={sec.hasCsp ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {sec.hasCsp ? 'DECLARED' : 'NOT DETECTED'}
                </span>
              </div>
              <div className="p-2.5 bg-[#161922] rounded border border-white/5 flex items-center justify-between">
                <span className="text-slate-300">Strict-Transport-Security (HSTS)</span>
                <span className={sec.hasHsts ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {sec.hasHsts ? 'ACTIVE' : 'UNAVAILABLE'}
                </span>
              </div>
              <div className="p-2.5 bg-[#161922] rounded border border-white/5 flex items-center justify-between">
                <span className="text-slate-300">Clickjacking Defense (X-Frame)</span>
                <span className={sec.hasXFrameOptions ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {sec.hasXFrameOptions ? 'PROTECTED' : 'STANDARD IFRAME ALLOWED'}
                </span>
              </div>
            </div>

            {/* Risk Warnings */}
            {sec.riskPoints.length > 0 && (
              <div className="mt-3 p-3 bg-amber-950/20 border border-amber-500/30 rounded-lg text-xs text-amber-300 space-y-1 font-mono">
                <span className="font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> SECURITY ADVISORIES:
                </span>
                {sec.riskPoints.map((r, idx) => (
                  <p key={idx} className="text-[11px] text-amber-200 pl-4">
                    &bull; {r}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Forms & Interactive Inputs Audit */}
      {m.forms.length > 0 && (
        <div className="bg-[#111319] border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-bold font-mono uppercase text-white flex items-center gap-2 mb-3">
            <FileSpreadsheet className="w-4 h-4 text-[#FEE75C]" />
            Forms & Interactive Input Endpoints ({m.forms.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {m.forms.map((f, i) => (
              <div key={i} className="p-3 bg-[#161922] border border-white/5 rounded-lg font-mono text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{f.name || f.id || `Form #${i + 1}`}</span>
                  <Badge variant={f.method === 'POST' ? 'yellow' : 'cyan'} size="sm">
                    {f.method}
                  </Badge>
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Action: <span className="text-slate-200">{f.action}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
                  <span className="text-slate-400">{f.inputCount} input field(s)</span>
                  {f.hasCsrf ? (
                    <span className="text-emerald-400 font-bold">CSRF Protected</span>
                  ) : (
                    <span className="text-slate-500">No explicit CSRF</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media Queries & Responsive Breakpoints */}
      {m.mediaQueries.length > 0 && (
        <div className="bg-[#111319] border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-bold font-mono uppercase text-white flex items-center gap-2 mb-3">
            <Smartphone className="w-4 h-4 text-purple-400" />
            Responsive Breakpoints & Media Queries ({m.mediaQueries.length})
          </h3>

          <div className="flex flex-wrap gap-2 font-mono text-xs">
            {m.mediaQueries.map((mq, i) => (
              <div
                key={i}
                className="px-3 py-1.5 bg-[#161922] border border-white/5 rounded-lg flex items-center gap-2"
              >
                <span className="text-slate-300">{mq.query}</span>
                <Badge variant={mq.type === 'mobile' ? 'yellow' : mq.type === 'tablet' ? 'cyan' : 'violet'} size="sm">
                  {mq.type}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schema.org Structured Data (JSON-LD) */}
      {m.schemas.length > 0 && (
        <div className="bg-[#111319] border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-bold font-mono uppercase text-white flex items-center gap-2 mb-3">
            <Braces className="w-4 h-4 text-[#00F0FF]" />
            Schema.org Structured Data ({m.schemas.length} JSON-LD definitions)
          </h3>

          <div className="space-y-3">
            {m.schemas.map((sc, i) => (
              <div key={i} className="p-3 bg-[#0A0B0E] rounded-lg border border-white/10 font-mono text-xs">
                <div className="text-purple-400 font-bold mb-1">
                  @type: {sc.type || 'Schema Object'}
                </div>
                <pre className="text-slate-300 max-h-36 overflow-auto text-[11px] leading-relaxed select-text">
                  <code>{sc.raw}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Open Graph Social Preview */}
      {Object.keys(m.openGraph).length > 0 && (
        <div className="bg-[#111319] border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-bold font-mono uppercase text-white flex items-center gap-2 mb-4">
            <Share2 className="w-4 h-4 text-purple-400" />
            Social Graph & OpenGraph Preview
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0A0B0E] border border-white/15 rounded-xl overflow-hidden max-w-md">
              {m.openGraph['og:image'] && (
                <div className="h-44 bg-[#141722] overflow-hidden flex items-center justify-center">
                  <img
                    src={m.openGraph['og:image']}
                    alt="OG Social Card Preview"
                    className="w-full h-full object-cover"
                    onError={e => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="p-4">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">
                  {m.openGraph['og:site_name'] || m.domain}
                </span>
                <h4 className="text-sm font-bold text-white line-clamp-1 mb-1">
                  {m.openGraph['og:title'] || m.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {m.openGraph['og:description'] || m.description}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono max-h-56 overflow-y-auto pr-2">
              {Object.entries(m.openGraph).map(([key, val]) => (
                <div key={key} className="p-2 bg-[#161922] rounded border border-white/5 break-all">
                  <span className="text-purple-400 font-semibold">{key}: </span>
                  <span className="text-slate-300">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
