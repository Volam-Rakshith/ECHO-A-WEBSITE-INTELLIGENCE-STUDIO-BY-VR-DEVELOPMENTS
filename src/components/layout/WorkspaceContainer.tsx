import React, { useEffect } from 'react';
import { WorkspaceTab, AnalysisResult, VaultProject } from '../../types';
import { Header } from './Header';
import { StatusBar } from './StatusBar';
import { soundEffects } from '../../services/audioEffects';
import {
  Layers,
  FileCode,
  Network,
  Sparkles,
  Palette,
  FileText,
  Search,
  Share2,
  Database,
} from 'lucide-react';

interface WorkspaceContainerProps {
  currentAnalysis: AnalysisResult | null;
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  vaultCount: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenNewAnalysis: () => void;
  onOpenDiagnostics: () => void;
  onOpenVault: () => void;
  storageEstimate: { usedBytes: number; quotaBytes: number; percent: number } | null;
  children: React.ReactNode;
}

const TAB_CONFIG: Array<{ id: WorkspaceTab; label: string; icon: React.ReactNode; shortcut: string }> = [
  { id: 'overview', label: 'Overview', icon: <Layers className="w-3.5 h-3.5" />, shortcut: '1' },
  { id: 'source', label: 'Source Code', icon: <FileCode className="w-3.5 h-3.5" />, shortcut: '2' },
  { id: 'visual', label: 'Visual Structure', icon: <Network className="w-3.5 h-3.5" />, shortcut: '3' },
  { id: 'brand', label: 'Brand', icon: <Sparkles className="w-3.5 h-3.5" />, shortcut: '4' },
  { id: 'colors', label: 'Colors', icon: <Palette className="w-3.5 h-3.5" />, shortcut: '5' },
  { id: 'content', label: 'Content', icon: <FileText className="w-3.5 h-3.5" />, shortcut: '6' },
  { id: 'search', label: 'Search', icon: <Search className="w-3.5 h-3.5" />, shortcut: '7' },
  { id: 'export', label: 'Export', icon: <Share2 className="w-3.5 h-3.5" />, shortcut: '8' },
  { id: 'vault', label: 'Vault', icon: <Database className="w-3.5 h-3.5" />, shortcut: '9' },
];

export const WorkspaceContainer: React.FC<WorkspaceContainerProps> = ({
  currentAnalysis,
  activeTab,
  onSelectTab,
  vaultCount,
  isMuted,
  onToggleMute,
  onOpenNewAnalysis,
  onOpenDiagnostics,
  onOpenVault,
  storageEstimate,
  children,
}) => {
  // Global Keyboard Shortcuts (Ctrl+K for search, 1-9 for tabs)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName)) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          onSelectTab('search');
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        soundEffects.playClick();
        onSelectTab('search');
        return;
      }

      if (e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const index = parseInt(e.key, 10) - 1;
        if (index < TAB_CONFIG.length) {
          soundEffects.playClick();
          onSelectTab(TAB_CONFIG[index].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectTab]);

  return (
    <div className="h-screen w-screen max-h-screen max-w-screen overflow-hidden flex flex-col bg-[#0A0B0E] text-slate-200 select-none">
      {/* 1. Header (Fixed Height) */}
      <Header
        currentAnalysis={currentAnalysis}
        vaultCount={vaultCount}
        isMuted={isMuted}
        onToggleMute={onToggleMute}
        onOpenNewAnalysis={onOpenNewAnalysis}
        onOpenDiagnostics={onOpenDiagnostics}
        onOpenVault={onOpenVault}
      />

      {/* 2. Workspace Navigation Bar (Fixed Height) - Only shown if an analysis is active or in vault view */}
      {currentAnalysis && (
        <div className="h-11 w-full bg-[#0d0f15] border-b border-white/10 px-4 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 z-20">
          {TAB_CONFIG.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundEffects.playClick();
                  onSelectTab(tab.id);
                }}
                className={`relative px-3 py-1.5 rounded-md font-mono text-xs font-medium flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#181B26] text-[#FEE75C] border border-[#FEE75C]/40 shadow-[0_0_12px_rgba(254,231,92,0.15)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                    isActive ? 'bg-[#FEE75C]/20 text-[#FEE75C]' : 'bg-white/5 text-slate-500'
                  }`}
                >
                  {tab.shortcut}
                </span>
                {isActive && (
                  <span className="absolute bottom-[-1px] left-2 right-2 h-[2px] bg-[#FEE75C] shadow-[0_0_8px_#FEE75C]"></span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Main Workspace Viewport (Flex-1 with strict overflow containment: NEVER OVERFLOW) */}
      <main className="flex-1 min-h-0 min-w-0 overflow-hidden relative flex flex-col">
        {children}
      </main>

      {/* 4. Bottom Telemetry Status Bar (Fixed Height) */}
      <StatusBar
        currentAnalysis={currentAnalysis}
        storageEstimate={storageEstimate}
      />
    </div>
  );
};
