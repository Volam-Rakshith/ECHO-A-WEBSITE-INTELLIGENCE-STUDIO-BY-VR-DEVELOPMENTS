import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { DiagnosticEvent } from '../../types';
import { CheckCircle2, AlertTriangle, AlertCircle, Copy, Check, Filter } from 'lucide-react';

interface DiagnosticLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagnostics: DiagnosticEvent[];
}

export const DiagnosticLogModal: React.FC<DiagnosticLogModalProps> = ({
  isOpen,
  onClose,
  diagnostics,
}) => {
  const [filter, setFilter] = useState<'all' | 'success' | 'warn' | 'failed'>('all');
  const [copied, setCopied] = useState(false);

  const filteredLogs = diagnostics.filter(log => {
    if (filter === 'all') return true;
    return log.status === filter;
  });

  const handleCopy = () => {
    const text = JSON.stringify(diagnostics, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="DIAGNOSTIC RETRIEVAL LOG"
      subtitle="Complete chronological telemetry of network strategies, relay attempts, and response headers"
      maxWidth="xl"
    >
      <div className="flex flex-col gap-4">
        {/* Filter bar & Actions */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
            {(['all', 'success', 'warn', 'failed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 text-[11px] font-mono rounded capitalize transition-colors ${
                  filter === f
                    ? 'bg-[#FEE75C] text-[#0A0B0E] font-bold'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {f} ({f === 'all' ? diagnostics.length : diagnostics.filter(d => d.status === f).length})
              </button>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copied ? 'Copied Log' : 'Copy JSON'}
          </Button>
        </div>

        {/* Log Entries List */}
        <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-mono text-xs">
              No diagnostic events match current filter.
            </div>
          ) : (
            filteredLogs.map(log => {
              const icon = {
                pending: <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />,
                success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
                warn: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
                failed: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
              }[log.status];

              const borderClass = {
                pending: 'border-cyan-500/30 bg-cyan-950/10',
                success: 'border-emerald-500/20 bg-emerald-950/10',
                warn: 'border-amber-500/30 bg-amber-950/10',
                failed: 'border-rose-500/40 bg-rose-950/20',
              }[log.status];

              return (
                <div
                  key={log.id}
                  className={`p-3 rounded-lg border ${borderClass} font-mono text-xs transition-colors`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      {icon}
                      <span className="font-bold text-white uppercase text-[11px] tracking-wider">
                        {log.stage}
                      </span>
                      <span className="text-slate-400 text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                        {log.strategy}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      {log.durationMs !== undefined && (
                        <span className="text-[#00F0FF] font-semibold">{log.durationMs}ms</span>
                      )}
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <p className="text-slate-200 text-xs mt-1 leading-relaxed pl-6">{log.message}</p>

                  {log.details && (
                    <div className="mt-2 pl-6">
                      <div className="p-2 bg-black/40 rounded border border-white/5 text-[11px] text-slate-400 break-all select-text">
                        {log.details}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
};
