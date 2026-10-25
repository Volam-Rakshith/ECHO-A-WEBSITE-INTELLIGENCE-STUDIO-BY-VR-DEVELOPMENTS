import React, { useState } from 'react';
import { VaultProject, AnalysisResult } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatBytes } from '../../services/urlUtils';
import {
  Database,
  Star,
  Trash2,
  Edit2,
  ExternalLink,
  ArrowRight,
  HardDrive,
  Download,
  Upload,
  ArrowLeftRight,
  Search,
  Globe,
  Clock,
  Check,
} from 'lucide-react';

interface VaultTabProps {
  projects: VaultProject[];
  currentAnalysisId?: string;
  onLoadProject: (project: VaultProject) => void;
  onDeleteProject: (id: string) => void;
  onRenameProject: (id: string, newName: string) => void;
  onToggleStar: (id: string) => void;
  onOpenCompare: (defaultProj?: VaultProject) => void;
  onExportBackup: () => void;
  onImportBackup: (jsonStr: string) => void;
  storageEstimate: { usedBytes: number; quotaBytes: number; percent: number } | null;
  onTriggerToast: (type: 'success' | 'warn' | 'error' | 'info', title: string, message?: string) => void;
}

export const VaultTab: React.FC<VaultTabProps> = ({
  projects,
  currentAnalysisId,
  onLoadProject,
  onDeleteProject,
  onRenameProject,
  onToggleStar,
  onOpenCompare,
  onExportBackup,
  onImportBackup,
  storageEstimate,
  onTriggerToast,
}) => {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const filtered = projects.filter(p => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.domain.toLowerCase().includes(q) ||
      p.url.toLowerCase().includes(q)
    );
  });

  const startRename = (p: VaultProject) => {
    setEditingId(p.id);
    setEditName(p.name);
  };

  const saveRename = (id: string) => {
    if (editName.trim()) {
      onRenameProject(id, editName.trim());
      setEditingId(null);
      onTriggerToast('success', 'Project Renamed', `Updated to "${editName.trim()}"`);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const json = ev.target?.result as string;
          onImportBackup(json);
        } catch (err: any) {
          onTriggerToast('error', 'Import Failed', err.message);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden p-4 md:p-6 space-y-6 bg-[#0A0B0E] select-text">
      {/* Top Banner: Vault Status & Actions */}
      <div className="bg-[#111319] border border-white/10 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-[#FEE75C]" />
            Local Project Vault (IndexedDB)
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Persisted 100% locally in your browser storage. Zero cloud dependence &bull; Complete privacy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {projects.length >= 2 && (
            <Button
              size="sm"
              variant="cyan"
              onClick={() => onOpenCompare()}
              icon={<ArrowLeftRight className="w-3.5 h-3.5" />}
            >
              Compare Analyses
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={onExportBackup}
            icon={<Download className="w-3.5 h-3.5" />}
            title="Download Vault Backup JSON"
          >
            Backup Vault
          </Button>

          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
            <span className="inline-flex items-center justify-center font-medium rounded-md text-xs px-2.5 py-1.5 gap-1.5 bg-white/5 text-slate-300 hover:text-white border border-white/10 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              Restore Backup
            </span>
          </label>
        </div>
      </div>

      {/* Storage Indicator & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search saved scans by domain or title..."
            className="w-full bg-[#111319] border border-white/10 rounded-lg py-2 pl-9 pr-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#FEE75C]"
          />
        </div>

        {storageEstimate && (
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-[#111319] px-3 py-2 rounded-lg border border-white/10">
            <HardDrive className="w-3.5 h-3.5 text-[#FEE75C]" />
            <span>
              IndexedDB Used: <strong className="text-white">{formatBytes(storageEstimate.usedBytes)}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Saved Projects Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#111319]/50 border border-white/5 rounded-xl font-mono text-xs text-slate-500 space-y-2">
          <Database className="w-10 h-10 mx-auto text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-slate-300">
            {projects.length === 0 ? 'No analyses saved yet' : 'No projects match your search'}
          </p>
          <p className="text-xs text-slate-400">
            {projects.length === 0
              ? 'Click "Save to Vault" in the Overview tab to store analyses locally in IndexedDB.'
              : 'Try clearing the search query to show all projects.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(proj => {
            const isCurrent = proj.id === currentAnalysisId;
            const isEditing = editingId === proj.id;

            return (
              <div
                key={proj.id}
                className={`bg-[#111319] border rounded-xl p-4 flex flex-col justify-between gap-4 transition-all hover:border-[#FEE75C]/40 ${
                  isCurrent ? 'border-[#FEE75C] shadow-[0_0_15px_rgba(254,231,92,0.15)]' : 'border-white/10'
                }`}
              >
                <div>
                  {/* Card Header: Favicon & Title */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded bg-[#161922] border border-white/10 p-1 flex items-center justify-center shrink-0">
                        {proj.favicon ? (
                          <img
                            src={proj.favicon}
                            alt=""
                            className="w-5 h-5 object-contain rounded"
                            onError={e => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Globe className="w-4 h-4 text-[#00F0FF]" />
                        )}
                      </div>

                      <div className="min-w-0">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              className="bg-[#0A0B0E] border border-[#FEE75C] rounded px-1.5 py-0.5 text-xs font-mono text-white w-36"
                              autoFocus
                            />
                            <button
                              onClick={() => saveRename(proj.id)}
                              className="p-1 text-emerald-400 hover:text-white"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-xs font-bold text-white truncate max-w-[160px]" title={proj.name}>
                              {proj.name}
                            </h3>
                            <button
                              onClick={() => startRename(proj)}
                              className="p-0.5 text-slate-500 hover:text-slate-300"
                              title="Rename project"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <span className="text-[10px] font-mono text-[#00F0FF] truncate block">
                          {proj.domain}
                        </span>
                      </div>
                    </div>

                    {/* Star button */}
                    <button
                      onClick={() => onToggleStar(proj.id)}
                      className={`p-1 rounded transition-colors ${
                        proj.starred ? 'text-[#FEE75C]' : 'text-slate-600 hover:text-slate-400'
                      }`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {/* Telemetry Snapshot */}
                  <div className="grid grid-cols-3 gap-1.5 p-2 bg-[#0A0B0E] rounded border border-white/5 font-mono text-[10px] text-center my-2">
                    <div>
                      <span className="text-slate-500 block">ASSETS</span>
                      <span className="text-white font-bold">{proj.summary.resourceCount}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">COLORS</span>
                      <span className="text-white font-bold">{proj.summary.colorCount}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">WORDS</span>
                      <span className="text-white font-bold">{proj.summary.wordCount}</span>
                    </div>
                  </div>

                  {/* Timestamp & Strategy */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {new Date(proj.createdAt).toLocaleDateString()}
                    </span>
                    <Badge variant="yellow" size="sm">
                      {proj.summary.primaryStrategy.split(' ')[0]}
                    </Badge>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <button
                    onClick={() => onDeleteProject(proj.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete project from vault"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenCompare(proj)}
                      className="px-2 py-1 text-[11px] font-mono text-slate-400 hover:text-white rounded bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      Compare
                    </button>

                    <Button
                      size="sm"
                      variant={isCurrent ? 'secondary' : 'primary'}
                      onClick={() => onLoadProject(proj)}
                      icon={<ArrowRight className="w-3 h-3" />}
                    >
                      {isCurrent ? 'Active Now' : 'Load Project'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
