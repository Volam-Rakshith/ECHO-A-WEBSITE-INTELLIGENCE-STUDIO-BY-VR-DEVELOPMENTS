import React from 'react';
import { DiagnosticEvent } from '../../types';
import { Activity, CheckCircle2, AlertTriangle, AlertCircle, Loader2 } from 'lucide-react';

interface AnalysisProgressModalProps {
  isOpen: boolean;
  stage: string;
  message: string;
  percent: number;
  diagnostics: DiagnosticEvent[];
  targetUrl: string;
}

export const AnalysisProgressModal: React.FC<AnalysisProgressModalProps> = ({
  isOpen,
  stage,
  message,
  percent,
  diagnostics,
  targetUrl,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#0f1117] border border-[#FEE75C]/40 rounded-xl shadow-[0_0_50px_rgba(254,231,92,0.15)] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#141722] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FEE75C]/10 border border-[#FEE75C]/40 flex items-center justify-center">
              <Activity className="w-4 h-4 text-[#FEE75C] animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wider uppercase font-mono">
                ECHO RETRIEVAL PIPELINE
              </h3>
              <p className="text-xs font-mono text-[#00F0FF] truncate max-w-sm mt-0.5">
                TARGET: {targetUrl}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#FEE75C] bg-[#FEE75C]/10 border border-[#FEE75C]/30 px-2 py-1 rounded">
            {percent}%
          </span>
        </div>

        {/* Progress HUD */}
        <div className="p-6 flex flex-col gap-5">
          <div>
            <div className="flex justify-between items-center text-xs font-mono text-slate-300 mb-2">
              <span className="text-[#FEE75C] font-semibold uppercase">{stage}</span>
              <span className="text-slate-400">{message}</span>
            </div>

            {/* Glowing Scan Bar */}
            <div className="w-full h-2.5 bg-black/60 rounded-full border border-white/10 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-[#FEE75C] via-[#00F0FF] to-[#a855f7] transition-all duration-300 relative shadow-[0_0_12px_#FEE75C]"
                style={{ width: `${percent}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Diagnostic Event Stream */}
          <div>
            <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center justify-between">
              <span>ACTIVE TELEMETRY STREAM</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                LIVE
              </span>
            </div>

            <div className="h-44 bg-[#090A0E] border border-white/10 rounded-lg p-3 overflow-y-auto font-mono text-xs space-y-2 select-text">
              {diagnostics.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#FEE75C]" />
                  <span>Initializing retrieval engine...</span>
                </div>
              ) : (
                diagnostics.map((evt, idx) => {
                  const icon = {
                    pending: <Loader2 className="w-3 h-3 text-[#00F0FF] animate-spin shrink-0" />,
                    success: <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />,
                    warn: <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />,
                    failed: <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />,
                  }[evt.status];

                  return (
                    <div
                      key={evt.id || idx}
                      className="flex items-start gap-2 text-[11px] text-slate-300 leading-tight"
                    >
                      <span className="mt-0.5">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[#FEE75C] font-semibold mr-1.5">[{evt.stage}]</span>
                        <span className="text-white">{evt.message}</span>
                        {evt.details && (
                          <div className="text-slate-500 text-[10px] mt-0.5 pl-2 border-l border-white/10 truncate">
                            {evt.details}
                          </div>
                        )}
                      </div>
                      {evt.durationMs !== undefined && (
                        <span className="text-slate-500 text-[10px] shrink-0 font-mono">
                          {evt.durationMs}ms
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Note */}
        <div className="px-6 py-3 bg-[#0c0d12] border-t border-white/10 text-[11px] font-mono text-slate-500 text-center">
          Querying legitimate public browser relays &bull; Respecting CORS &bull; Zero fabricated code
        </div>
      </div>
    </div>
  );
};
