import React from 'react';
import { ShieldCheck, ShieldAlert, Cpu, HardDrive } from 'lucide-react';
import { AnalysisResult } from '../../types';

interface StatusBarProps {
  currentAnalysis: AnalysisResult | null;
  storageEstimate: { usedBytes: number; quotaBytes: number; percent: number } | null;
}

export const StatusBar: React.FC<StatusBarProps> = ({ currentAnalysis, storageEstimate }) => {
  return (
    <footer className="h-8 w-full bg-[#090a0d] border-t border-white/10 px-4 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0 select-none z-20">
      {/* Left: Engine Telemetry */}
      <div className="flex items-center gap-3 truncate">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300">ENGINE ONLINE</span>
        </div>

        {currentAnalysis ? (
          <>
            <span className="text-white/20">|</span>
            <span className="truncate text-slate-300">
              STRATEGY: <span className="text-[#00F0FF]">{currentAnalysis.stats.primaryStrategy}</span>
            </span>
            <span className="text-white/20 hidden md:inline">|</span>
            <span className="text-slate-400 hidden md:inline">
              LATENCY: {(currentAnalysis.stats.analysisDurationMs / 1000).toFixed(2)}s
            </span>
          </>
        ) : (
          <>
            <span className="text-white/20">|</span>
            <span className="text-slate-500">STANDBY FOR TARGET INPUT</span>
          </>
        )}
      </div>

      {/* Right: Storage & Verification */}
      <div className="flex items-center gap-3 shrink-0">
        {currentAnalysis && (
          <div className="flex items-center gap-1.5 text-slate-300">
            {currentAnalysis.metadata.security.isHttps ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="hidden sm:inline">
              {currentAnalysis.metadata.security.isHttps ? 'HTTPS SECURED' : 'UNENCRYPTED'}
            </span>
          </div>
        )}

        {storageEstimate && (
          <div className="hidden lg:flex items-center gap-1 text-slate-400" title="Local IndexedDB Vault">
            <HardDrive className="w-3 h-3 text-[#FEE75C]" />
            <span>VAULT: {(storageEstimate.usedBytes / 1024).toFixed(0)} KB</span>
          </div>
        )}

        <div className="text-slate-500 text-[10px]">
          VR DEVELOPMENTS &copy; {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
};
