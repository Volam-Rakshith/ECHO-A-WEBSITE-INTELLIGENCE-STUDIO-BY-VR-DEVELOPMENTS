import React, { useState, useEffect, useCallback } from 'react';
import {
  AnalysisResult,
  WorkspaceTab,
  DiagnosticEvent,
  VaultProject,
  RetrievalOptions,
} from './types';
import { executeRetrievalPipeline } from './services/retrievalEngine';
import {
  getAllVaultProjects,
  saveAnalysisToVault,
  deleteVaultProject,
  renameVaultProject,
  toggleStarProject,
  getStorageEstimate,
  exportVaultBackupJSON,
  importVaultBackupJSON,
} from './services/vaultDB';
import { soundEffects } from './services/audioEffects';

import { WorkspaceContainer } from './components/layout/WorkspaceContainer';
import { LandingHero } from './components/landing/LandingHero';
import { AnalysisProgressModal } from './components/modals/AnalysisProgressModal';
import { ManualInputModal } from './components/modals/ManualInputModal';
import { PrivateSiteHelperModal } from './components/modals/PrivateSiteHelperModal';
import { DiagnosticLogModal } from './components/modals/DiagnosticLogModal';
import { CompareModal } from './components/modals/CompareModal';
import { ToastContainer, ToastMessage } from './components/common/Toast';

import { OverviewTab } from './components/workspace/OverviewTab';
import { SourceCodeTab } from './components/workspace/SourceCodeTab';
import { VisualStructureTab } from './components/workspace/VisualStructureTab';
import { BrandTab } from './components/workspace/BrandTab';
import { ColorsTab } from './components/workspace/ColorsTab';
import { ContentTab } from './components/workspace/ContentTab';
import { SearchTab } from './components/workspace/SearchTab';
import { ExportTab } from './components/workspace/ExportTab';
import { VaultTab } from './components/workspace/VaultTab';

export function App() {
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');

  // Loading & Progress Pipeline
  const [isLoading, setIsLoading] = useState(false);
  const [progressStage, setProgressStage] = useState('');
  const [progressMessage, setProgressMessage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [targetUrlInput, setTargetUrlInput] = useState('');
  const [liveDiagnostics, setLiveDiagnostics] = useState<DiagnosticEvent[]>([]);

  // Local Vault
  const [vaultProjects, setVaultProjects] = useState<VaultProject[]>([]);
  const [storageEstimate, setStorageEstimate] = useState<{
    usedBytes: number;
    quotaBytes: number;
    percent: number;
  } | null>(null);

  // Audio State
  const [isMuted, setIsMuted] = useState(soundEffects.getMuted());

  // Modals
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isPrivateHelperOpen, setIsPrivateHelperOpen] = useState(false);
  const [isDiagnosticsModalOpen, setIsDiagnosticsModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareDefaultProj, setCompareDefaultProj] = useState<VaultProject | undefined>(undefined);

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (type: 'success' | 'warn' | 'error' | 'info', title: string, message?: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      setToasts(prev => [...prev, { id, type, title, message }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const refreshVault = useCallback(async () => {
    try {
      const projs = await getAllVaultProjects();
      setVaultProjects(projs);
      const estimate = await getStorageEstimate();
      setStorageEstimate(estimate);
    } catch {
      // IndexedDB fallback
    }
  }, []);

  useEffect(() => {
    refreshVault();
  }, [refreshVault]);

  const handleToggleMute = () => {
    const muted = soundEffects.toggleMute();
    setIsMuted(muted);
    addToast('info', muted ? 'Audio Muted' : 'Audio Unmuted', 'Synthesized Web Audio.');
  };

  // Start analysis pipeline with support for custom auth options & private sites
  const runAnalysis = async (
    url: string,
    manualPayload?: { html: string; title?: string },
    options?: RetrievalOptions
  ) => {
    setTargetUrlInput(url);
    setIsLoading(true);
    setProgressStage('Initializing');
    setProgressMessage('Starting retrieval engine...');
    setProgressPercent(5);
    setLiveDiagnostics([]);
    soundEffects.playScanBeep();

    try {
      const result = await executeRetrievalPipeline(
        url,
        (stage, msg, pct, diags) => {
          setProgressStage(stage);
          setProgressMessage(msg);
          setProgressPercent(pct);
          setLiveDiagnostics([...diags]);
        },
        manualPayload,
        options
      );

      soundEffects.playSuccessChime();
      setCurrentAnalysis(result);
      setActiveTab('overview');
      setIsLoading(false);

      // Auto save to IndexedDB Vault
      try {
        await saveAnalysisToVault(result);
        await refreshVault();
      } catch {
        // Ignore vault quota errors
      }

      addToast(
        'success',
        'Website Decoded',
        `Successfully analyzed ${result.metadata.domain} with ${result.stats.totalRetrieved} resources retrieved.`
      );
    } catch (err: any) {
      setIsLoading(false);
      addToast(
        'error',
        'Retrieval Blocked',
        err.message || 'Target enforces strict CORS or private network protection.'
      );
    }
  };

  const handleSaveToVault = async () => {
    if (!currentAnalysis) return;
    try {
      await saveAnalysisToVault(currentAnalysis);
      await refreshVault();
      addToast('success', 'Saved to Vault', `Stored ${currentAnalysis.metadata.domain} in browser IndexedDB.`);
    } catch (err: any) {
      addToast('error', 'Vault Save Failed', err.message);
    }
  };

  const handleLoadProject = (proj: VaultProject) => {
    setCurrentAnalysis(proj.data);
    setActiveTab('overview');
    soundEffects.playSuccessChime();
    addToast('info', 'Project Restored', `Loaded ${proj.domain} from local vault.`);
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteVaultProject(id);
      await refreshVault();
      addToast('info', 'Project Deleted', 'Removed analysis from local vault.');
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.message);
    }
  };

  const handleRenameProject = async (id: string, newName: string) => {
    try {
      await renameVaultProject(id, newName);
      await refreshVault();
    } catch (err: any) {
      addToast('error', 'Rename Failed', err.message);
    }
  };

  const handleToggleStar = async (id: string) => {
    try {
      await toggleStarProject(id);
      await refreshVault();
    } catch {
      // Ignore
    }
  };

  const handleExportBackup = async () => {
    try {
      const jsonStr = await exportVaultBackupJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `echo-vault-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      addToast('success', 'Vault Backup Exported', `Downloaded all ${vaultProjects.length} saved scans.`);
    } catch (err: any) {
      addToast('error', 'Backup Failed', err.message);
    }
  };

  const handleImportBackup = async (jsonStr: string) => {
    try {
      const count = await importVaultBackupJSON(jsonStr);
      await refreshVault();
      addToast('success', 'Backup Restored', `Imported ${count} project(s) into vault.`);
    } catch (err: any) {
      addToast('error', 'Import Failed', err.message);
    }
  };

  const handleOpenCompare = (defaultProj?: VaultProject) => {
    setCompareDefaultProj(defaultProj);
    setIsCompareModalOpen(true);
  };

  const isCurrentSavedInVault = currentAnalysis
    ? vaultProjects.some(p => p.id === currentAnalysis.id)
    : false;

  return (
    <WorkspaceContainer
      currentAnalysis={currentAnalysis}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      vaultCount={vaultProjects.length}
      isMuted={isMuted}
      onToggleMute={handleToggleMute}
      onOpenNewAnalysis={() => setCurrentAnalysis(null)}
      onOpenDiagnostics={() => setIsDiagnosticsModalOpen(true)}
      onOpenVault={() => {
        if (!currentAnalysis) {
          // If on landing, show vault tab if needed
        } else {
          setActiveTab('vault');
        }
      }}
      storageEstimate={storageEstimate}
    >
      {/* Viewport content */}
      {!currentAnalysis ? (
        <LandingHero
          onAnalyze={(url, opts) => runAnalysis(url, undefined, opts)}
          onOpenManualInput={() => setIsManualModalOpen(true)}
          onOpenPrivateHelper={() => setIsPrivateHelperOpen(true)}
          isLoading={isLoading}
        />
      ) : (
        <>
          {activeTab === 'overview' && (
            <OverviewTab
              analysis={currentAnalysis}
              onSaveToVault={handleSaveToVault}
              isSavedInVault={isCurrentSavedInVault}
              onSelectTab={setActiveTab}
            />
          )}

          {activeTab === 'source' && (
            <SourceCodeTab
              resources={currentAnalysis.resources}
              onTriggerToast={addToast}
            />
          )}

          {activeTab === 'visual' && (
            <VisualStructureTab analysis={currentAnalysis} />
          )}

          {activeTab === 'brand' && (
            <BrandTab analysis={currentAnalysis} />
          )}

          {activeTab === 'colors' && (
            <ColorsTab
              colors={currentAnalysis.colors}
              onTriggerToast={addToast}
            />
          )}

          {activeTab === 'content' && (
            <ContentTab analysis={currentAnalysis} />
          )}

          {activeTab === 'search' && (
            <SearchTab
              analysis={currentAnalysis}
              onSelectTab={setActiveTab}
            />
          )}

          {activeTab === 'export' && (
            <ExportTab
              analysis={currentAnalysis}
              onTriggerToast={addToast}
            />
          )}

          {activeTab === 'vault' && (
            <VaultTab
              projects={vaultProjects}
              currentAnalysisId={currentAnalysis?.id}
              onLoadProject={handleLoadProject}
              onDeleteProject={handleDeleteProject}
              onRenameProject={handleRenameProject}
              onToggleStar={handleToggleStar}
              onOpenCompare={handleOpenCompare}
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
              storageEstimate={storageEstimate}
              onTriggerToast={addToast}
            />
          )}
        </>
      )}

      {/* Global Modals */}
      <AnalysisProgressModal
        isOpen={isLoading}
        stage={progressStage}
        message={progressMessage}
        percent={progressPercent}
        diagnostics={liveDiagnostics}
        targetUrl={targetUrlInput}
      />

      <ManualInputModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSubmit={(html, url) => runAnalysis(url, { html })}
      />

      <PrivateSiteHelperModal
        isOpen={isPrivateHelperOpen}
        onClose={() => setIsPrivateHelperOpen(false)}
        onSubmitPayload={(html, url) => runAnalysis(url, { html })}
      />

      {currentAnalysis && (
        <DiagnosticLogModal
          isOpen={isDiagnosticsModalOpen}
          onClose={() => setIsDiagnosticsModalOpen(false)}
          diagnostics={currentAnalysis.diagnostics}
        />
      )}

      <CompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        projects={vaultProjects}
        defaultProjectA={compareDefaultProj}
      />

      {/* Floating Toast Notification Stack */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </WorkspaceContainer>
  );
}

export default App;
