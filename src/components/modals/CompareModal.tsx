import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { VaultProject } from '../../types';
import { ArrowLeftRight, Check, X } from 'lucide-react';
import { formatBytes } from '../../services/urlUtils';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: VaultProject[];
  defaultProjectA?: VaultProject;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  projects,
  defaultProjectA,
}) => {
  const [projAId, setProjAId] = useState<string>(
    defaultProjectA?.id || (projects.length > 0 ? projects[0].id : '')
  );
  const [projBId, setProjBId] = useState<string>(
    projects.length > 1 ? projects[1].id : projects.length > 0 ? projects[0].id : ''
  );

  const projA = projects.find(p => p.id === projAId) || projects[0];
  const projB = projects.find(p => p.id === projBId) || projects[1] || projA;

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="VAULT TELEMETRY COMPARISON"
      subtitle="Side-by-side architectural diff of two analyzed websites"
      maxWidth="xl"
    >
      <div className="flex flex-col gap-6">
        {/* Project Selectors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-[#151822] rounded-lg border border-white/10">
            <label className="block text-[11px] font-mono text-slate-400 mb-1.5 uppercase">
              Target Node A (Primary)
            </label>
            <select
              value={projAId}
              onChange={e => setProjAId(e.target.value)}
              className="w-full bg-[#0A0B0E] border border-white/15 rounded px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#FEE75C]"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.domain} ({p.name})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-[#151822] rounded-lg border border-white/10">
            <label className="block text-[11px] font-mono text-slate-400 mb-1.5 uppercase">
              Target Node B (Comparison)
            </label>
            <select
              value={projBId}
              onChange={e => setProjBId(e.target.value)}
              className="w-full bg-[#0A0B0E] border border-white/15 rounded px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#00F0FF]"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.domain} ({p.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Side by Side Diff Grid */}
        {projA && projB && (
          <div className="border border-white/10 rounded-lg overflow-hidden bg-[#0e1017]">
            <table className="w-full text-xs font-mono text-left border-collapse">
              <thead>
                <tr className="bg-[#161922] border-b border-white/10 text-slate-400">
                  <th className="p-3 w-1/3">METRIC / SPEC</th>
                  <th className="p-3 w-1/3 text-[#FEE75C]">{projA.domain}</th>
                  <th className="p-3 w-1/3 text-[#00F0FF]">{projB.domain}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                <tr>
                  <td className="p-3 text-slate-400">Page Title</td>
                  <td className="p-3 font-semibold truncate max-w-[200px]" title={projA.data.metadata.title}>
                    {projA.data.metadata.title}
                  </td>
                  <td className="p-3 font-semibold truncate max-w-[200px]" title={projB.data.metadata.title}>
                    {projB.data.metadata.title}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-400">Primary Strategy</td>
                  <td className="p-3">{projA.data.stats.primaryStrategy}</td>
                  <td className="p-3">{projB.data.stats.primaryStrategy}</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-400">Total Scanned Size</td>
                  <td className="p-3">{formatBytes(projA.data.stats.totalSize)}</td>
                  <td className="p-3">{formatBytes(projB.data.stats.totalSize)}</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-400">Pipeline Latency</td>
                  <td className="p-3">{(projA.data.stats.analysisDurationMs / 1000).toFixed(2)}s</td>
                  <td className="p-3">{(projB.data.stats.analysisDurationMs / 1000).toFixed(2)}s</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-400">Retrieved Resources</td>
                  <td className="p-3">
                    <span className="text-[#FEE75C] font-bold">
                      {projA.data.stats.totalRetrieved}
                    </span>{' '}
                    / {projA.data.stats.totalDiscovered}
                  </td>
                  <td className="p-3">
                    <span className="text-[#00F0FF] font-bold">
                      {projB.data.stats.totalRetrieved}
                    </span>{' '}
                    / {projB.data.stats.totalDiscovered}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-400">Colors Extracted</td>
                  <td className="p-3 font-bold">{projA.data.colors.length} tokens</td>
                  <td className="p-3 font-bold">{projB.data.colors.length} tokens</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-400">Headings (H1-H6)</td>
                  <td className="p-3">{projA.data.content.headings.length} headings</td>
                  <td className="p-3">{projB.data.content.headings.length} headings</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-400">Word Count</td>
                  <td className="p-3">{projA.data.content.wordCount.toLocaleString()} words</td>
                  <td className="p-3">{projB.data.content.wordCount.toLocaleString()} words</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-400">Total Links</td>
                  <td className="p-3">{projA.data.content.links.length} links</td>
                  <td className="p-3">{projB.data.content.links.length} links</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-400">HTTPS Transport</td>
                  <td className="p-3">
                    {projA.data.metadata.security.isHttps ? (
                      <span className="text-emerald-400 inline-flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Secured
                      </span>
                    ) : (
                      <span className="text-amber-400 inline-flex items-center gap-1">
                        <X className="w-3.5 h-3.5" /> Insecure
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {projB.data.metadata.security.isHttps ? (
                      <span className="text-emerald-400 inline-flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Secured
                      </span>
                    ) : (
                      <span className="text-amber-400 inline-flex items-center gap-1">
                        <X className="w-3.5 h-3.5" /> Insecure
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
};
