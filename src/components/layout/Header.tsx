import React from 'react';
import {
  Terminal,
  Activity,
  Volume2,
  VolumeX,
  Database,
  PlusCircle,
  FileCode2,
  Globe,
  Radio,
} from 'lucide-react';
import { AnalysisResult } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { soundEffects } from '../../services/audioEffects';

interface HeaderProps {
  currentAnalysis: AnalysisResult | null;
  vaultCount: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenNewAnalysis: () => void;
  onOpenDiagnostics: () => void;
  onOpenVault: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentAnalysis,
  vaultCount,
  isMuted,
  onToggleMute,
  onOpenNewAnalysis,
  onOpenDiagnostics,
  onOpenVault,
}) => {
  return (
    <header className="h-14 w-full bg-[#0d0f15] border-b border-white/10 px-4 flex items-center justify-between shrink-0 select-none z-30">
      {/* Brand & Wordmark */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenNewAnalysis}
          className="flex items-center gap-2.5 group text-left transition-opacity hover:opacity-90"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FEE75C] to-[#00F0FF] p-[1px] shadow-[0_0_12px_rgba(254,231,92,0.3)]">
            <div className="w-full h-full bg-[#0A0B0E] rounded-[7px] flex items-center justify-center">
              <Radio className="w-4 h-4 text-[#FEE75C] animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black tracking-wider text-white group-hover:text-[#FEE75C] transition-colors">
                ECHO
              </span>
              <span className="text-[10px] font-mono tracking-widest px-1 py-0.2 rounded bg-white/10 text-slate-300 font-semibold uppercase">
                VR DEVELOPMENTS
              </span>
            </div>
            <span className="text-[9px] font-mono text-[#00F0FF] tracking-wider block -mt-0.5">
              EVERY WEBSITE. DECODED.
            </span>
          </div>
        </button>

        {/* Active Analysis URL Pill (Desktop) */}
        {currentAnalysis && (
          <div className="hidden lg:flex items-center gap-2 ml-4 pl-4 border-l border-white/10 max-w-md">
            {currentAnalysis.metadata.favicon ? (
              <img
                src={currentAnalysis.metadata.favicon}
                alt=""
                className="w-4 h-4 rounded shrink-0 object-contain"
                onError={e => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <Globe className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
            )}
            <span
              className="text-xs font-mono text-slate-200 truncate max-w-[200px]"
              title={currentAnalysis.targetUrl}
            >
              {currentAnalysis.metadata.domain}
            </span>
            <Badge status={currentAnalysis.stats.htmlStatus} size="sm" />
            <span className="text-[11px] font-mono text-slate-400">
              {(currentAnalysis.stats.analysisDurationMs / 1000).toFixed(2)}s
            </span>
          </div>
        )}
      </div>

      {/* Global Action HUD */}
      <div className="flex items-center gap-2">
        {currentAnalysis && (
          <Button
            size="sm"
            variant="primary"
            onClick={onOpenNewAnalysis}
            icon={<PlusCircle className="w-3.5 h-3.5" />}
          >
            New Target
          </Button>
        )}

        {currentAnalysis && (
          <Button
            size="sm"
            variant="secondary"
            onClick={onOpenDiagnostics}
            icon={<Activity className="w-3.5 h-3.5 text-[#00F0FF]" />}
            title="Open Diagnostic Relay Log"
          >
            Diagnostics
          </Button>
        )}

        <Button
          size="sm"
          variant="secondary"
          onClick={onOpenVault}
          icon={<Database className="w-3.5 h-3.5 text-[#FEE75C]" />}
          title="Open Local Project Vault"
        >
          Vault ({vaultCount})
        </Button>

        {/* Audio Effects Toggle */}
        <button
          onClick={onToggleMute}
          className={`p-2 rounded-md border transition-colors ${
            isMuted
              ? 'bg-transparent text-slate-500 border-white/5 hover:text-slate-300'
              : 'bg-[#141720] text-[#00F0FF] border-[#00F0FF]/30 shadow-[0_0_8px_rgba(0,240,255,0.2)]'
          }`}
          title={isMuted ? 'Unmute Futuristic UI SFX' : 'Mute Futuristic UI SFX'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
