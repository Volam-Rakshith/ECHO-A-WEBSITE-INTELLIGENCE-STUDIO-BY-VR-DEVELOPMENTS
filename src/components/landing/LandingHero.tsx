import React, { useState } from 'react';
import {
  Search,
  Code2,
  Palette,
  Upload,
  ArrowRight,
  Radio,
  FileCode,
  Layers,
  Database,
  ExternalLink,
  Lock,
  KeyRound,
  ChevronDown,
  ChevronUp,
  Cpu,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../common/Button';
import { soundEffects } from '../../services/audioEffects';
import { RetrievalOptions } from '../../types';

interface LandingHeroProps {
  onAnalyze: (url: string, options?: RetrievalOptions) => void;
  onOpenManualInput: () => void;
  onOpenPrivateHelper: () => void;
  isLoading: boolean;
}

const PRESET_TARGETS = [
  {
    name: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Main_Page',
    tag: 'Encyclopedic',
  },
  {
    name: 'W3C Consortium',
    url: 'https://www.w3.org/',
    tag: 'Standards',
  },
  {
    name: 'Example Domain',
    url: 'https://example.com/',
    tag: 'Minimal',
  },
  {
    name: 'Hacker News',
    url: 'https://news.ycombinator.com/',
    tag: 'Tech Forum',
  },
  {
    name: 'Dev.to Community',
    url: 'https://dev.to/',
    tag: 'Articles',
  },
  {
    name: 'ECHO Self-Inspection',
    url: 'http://localhost:5173/',
    tag: 'Localhost (Self)',
  },
];

export const LandingHero: React.FC<LandingHeroProps> = ({
  onAnalyze,
  onOpenManualInput,
  onOpenPrivateHelper,
  isLoading,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [showAuthOptions, setShowAuthOptions] = useState(false);
  const [customBearerToken, setCustomBearerToken] = useState('');
  const [customCookie, setCustomCookie] = useState('');
  const [basicUser, setBasicUser] = useState('');
  const [basicPass, setBasicPass] = useState('');

  const buildOptions = (): RetrievalOptions | undefined => {
    const headers: Record<string, string> = {};
    if (customBearerToken.trim()) {
      headers['Authorization'] = customBearerToken.startsWith('Bearer ')
        ? customBearerToken
        : `Bearer ${customBearerToken.trim()}`;
    }
    if (customCookie.trim()) {
      headers['Cookie'] = customCookie.trim();
    }

    const hasHeaders = Object.keys(headers).length > 0;
    const hasBasic = !!basicUser.trim();

    if (!hasHeaders && !hasBasic) return undefined;

    return {
      headers: hasHeaders ? headers : undefined,
      basicAuth: hasBasic ? { username: basicUser.trim(), password: basicPass } : undefined,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onAnalyze(urlInput.trim(), buildOptions());
    }
  };

  const handleSelectPreset = (url: string) => {
    setUrlInput(url);
    soundEffects.playClick();
    onAnalyze(url);
  };

  return (
    <div className="flex-1 w-full overflow-y-auto overflow-x-hidden min-h-0 bg-[#0A0B0E] flex flex-col justify-between p-4 md:p-8 select-none">
      <div className="max-w-4xl mx-auto w-full my-auto flex flex-col items-center text-center">
        {/* Brand Chip */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-mono uppercase tracking-widest mb-6">
          <span className="w-2 h-2 rounded-full bg-[#FEE75C] shadow-[0_0_8px_#FEE75C] animate-pulse"></span>
          <span>VR DEVELOPMENTS INTELLIGENCE STUDIO</span>
        </div>

        {/* Wordmark & Tagline */}
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none mb-3">
          ECHO
        </h1>
        <p className="text-xl md:text-2xl font-mono font-bold text-[#FEE75C] tracking-wide mb-2 uppercase">
          Every Website. Decoded.
        </p>
        <p className="text-sm md:text-base text-slate-400 font-sans max-w-xl mb-6 leading-relaxed">
          One URL. An entire digital universe. Extract real source code, color tokens, typography scales, DOM hierarchies, framework stacks, security audits, and architectural intelligence without fake simulations.
        </p>

        {/* Central Futuristic URL Terminal */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl bg-[#12151D] p-2 rounded-2xl border border-white/15 focus-within:border-[#FEE75C] focus-within:shadow-[0_0_25px_rgba(254,231,92,0.2)] transition-all duration-300 mb-3"
        >
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="flex-1 w-full flex items-center px-3 gap-2">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="Enter public or private URL (e.g. https://... or localhost:3000)..."
                className="w-full bg-transparent py-2.5 text-sm md:text-base font-mono text-white placeholder-slate-500 focus:outline-none"
                disabled={isLoading}
              />
            </div>
            <div className="w-full sm:w-auto flex items-center gap-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                disabled={!urlInput.trim()}
                icon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto px-6 py-3 font-bold"
              >
                Decode Target
              </Button>
            </div>
          </div>

          {/* Expandable Auth & Private Options */}
          {showAuthOptions && (
            <div className="mt-3 pt-3 border-t border-white/10 px-3 text-left font-mono text-xs space-y-3 animate-in fade-in duration-150">
              <div className="text-[11px] text-[#00F0FF] font-bold flex items-center gap-1.5 uppercase">
                <KeyRound className="w-3.5 h-3.5" />
                AUTHENTICATED & PRIVATE SITE CREDENTIALS
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    BEARER TOKEN / AUTHORIZATION HEADER
                  </label>
                  <input
                    type="text"
                    value={customBearerToken}
                    onChange={e => setCustomBearerToken(e.target.value)}
                    placeholder="e.g. Bearer eyJhbGciOi..."
                    className="w-full bg-[#0A0B0E] border border-white/10 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-[#00F0FF]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    COOKIE HEADER (SESSION TOKEN)
                  </label>
                  <input
                    type="text"
                    value={customCookie}
                    onChange={e => setCustomCookie(e.target.value)}
                    placeholder="e.g. session_id=abc123"
                    className="w-full bg-[#0A0B0E] border border-white/10 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-[#00F0FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">BASIC AUTH USER</label>
                  <input
                    type="text"
                    value={basicUser}
                    onChange={e => setBasicUser(e.target.value)}
                    placeholder="Username"
                    className="w-full bg-[#0A0B0E] border border-white/10 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-[#00F0FF]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">BASIC AUTH PASSWORD</label>
                  <input
                    type="password"
                    value={basicPass}
                    onChange={e => setBasicPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0A0B0E] border border-white/10 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-[#00F0FF]"
                  />
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Private Site & Auth Toggle Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-slate-400 mb-6">
          <button
            type="button"
            onClick={() => setShowAuthOptions(!showAuthOptions)}
            className="text-slate-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 border border-white/10 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#00F0FF]" />
            {showAuthOptions ? 'Hide Auth Options' : 'Custom Headers / Auth'}
            {showAuthOptions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            type="button"
            onClick={onOpenPrivateHelper}
            className="text-[#FEE75C] hover:text-[#ffe600] flex items-center gap-1 px-2.5 py-1 rounded bg-[#FEE75C]/10 border border-[#FEE75C]/30 font-semibold transition-colors"
          >
            <Lock className="w-3.5 h-3.5 text-[#FEE75C]" />
            Private / Behind-Login Helper
          </button>

          <button
            type="button"
            onClick={onOpenManualInput}
            className="text-slate-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 border border-white/10 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            Paste Source / File
          </button>
        </div>

        {/* Verified Target Presets */}
        <div className="w-full max-w-2xl bg-[#111319]/80 border border-white/10 rounded-xl p-4 text-left">
          <div className="flex items-center justify-between mb-3 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300 font-semibold uppercase">
              <Radio className="w-3.5 h-3.5 text-[#FEE75C]" />
              Verified Public & Local Presets (1-Click Test)
            </span>
            <span>Real Live Data</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESET_TARGETS.map(target => (
              <button
                key={target.name}
                type="button"
                onClick={() => handleSelectPreset(target.url)}
                className="flex flex-col p-2.5 rounded-lg bg-[#161922] hover:bg-[#1d212d] border border-white/5 hover:border-[#FEE75C]/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold text-white group-hover:text-[#FEE75C] transition-colors truncate">
                    {target.name}
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-[#FEE75C]" />
                </div>
                <span className="text-[10px] font-mono text-slate-400 mt-1">
                  {target.tag}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Core Capabilities Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 w-full max-w-3xl text-left">
          <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl">
            <Cpu className="w-4 h-4 text-[#FEE75C] mb-2" />
            <h4 className="text-xs font-bold text-white mb-1">Tech Stack Detect</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Detects React, Next.js, Vue, Tailwind, Cloudflare, GTM, analytics, and CDNs.
            </p>
          </div>

          <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-[#00F0FF] mb-2" />
            <h4 className="text-xs font-bold text-white mb-1">Security Audit</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Security grading (A+ to F), CSP, HSTS, forms audit, and clickjacking defense.
            </p>
          </div>

          <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl">
            <Lock className="w-4 h-4 text-purple-400 mb-2" />
            <h4 className="text-xs font-bold text-white mb-1">Private & Intranet</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Decode behind-login sites, localhost endpoints, and intranet dashboards.
            </p>
          </div>

          <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl">
            <Database className="w-4 h-4 text-emerald-400 mb-2" />
            <h4 className="text-xs font-bold text-white mb-1">Full Export Suite</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Complete JSZip bundles, CSS tokens, JSON telemetry, and IndexedDB storage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
