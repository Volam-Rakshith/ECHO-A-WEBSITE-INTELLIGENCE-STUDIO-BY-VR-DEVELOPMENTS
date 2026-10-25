import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  Lock,
  Terminal,
  Copy,
  Check,
  Bookmark,
  Upload,
  KeyRound,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  ClipboardCheck,
} from 'lucide-react';

interface PrivateSiteHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPayload: (html: string, url: string) => void;
}

export const PrivateSiteHelperModal: React.FC<PrivateSiteHelperModalProps> = ({
  isOpen,
  onClose,
  onSubmitPayload,
}) => {
  const [activeTab, setActiveTab] = useState<'snippet' | 'paste' | 'upload'>('snippet');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [pastedJsonOrHtml, setPastedJsonOrHtml] = useState('');
  const [customOrigin, setCustomOrigin] = useState('https://private-dashboard.internal');

  // The 1-click DevTools extraction snippet
  const snippetCode = `(function(){
  const payload = {
    url: window.location.href,
    title: document.title,
    html: document.documentElement.outerHTML
  };
  navigator.clipboard.writeText(JSON.stringify(payload)).then(() => {
    alert('✓ ECHO: Private page source and dynamic DOM copied to clipboard! Return to ECHO and click "Paste from Clipboard".');
  }).catch(() => {
    prompt('Copy this page payload for ECHO:', JSON.stringify(payload));
  });
})();`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(snippetCode);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleProcessPasted = () => {
    if (!pastedJsonOrHtml.trim()) return;

    try {
      // Check if it's the JSON payload from the snippet
      const parsed = JSON.parse(pastedJsonOrHtml);
      if (parsed.html) {
        onSubmitPayload(parsed.html, parsed.url || customOrigin);
        onClose();
        return;
      }
    } catch {
      // Not JSON, assume raw HTML
    }

    onSubmitPayload(pastedJsonOrHtml, customOrigin);
    onClose();
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setPastedJsonOrHtml(text);
      try {
        const parsed = JSON.parse(text);
        if (parsed.html) {
          onSubmitPayload(parsed.html, parsed.url || customOrigin);
          onClose();
        }
      } catch {
        // Raw HTML
      }
    } catch {
      alert('Clipboard permission denied. Please paste directly into the textarea.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        const text = ev.target?.result as string;
        onSubmitPayload(text, `https://${file.name.replace(/\.[^/.]+$/, '')}.local`);
        onClose();
      };
      reader.readAsText(file);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="DECODE PRIVATE & AUTHENTICATED SITES"
      subtitle="Inspect any behind-login dashboard, local intranet, or Cloudflare-protected site with zero restrictions"
      maxWidth="xl"
    >
      <div className="flex flex-col gap-5 select-text">
        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('snippet')}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              activeTab === 'snippet'
                ? 'bg-[#FEE75C] text-[#0A0B0E] font-bold'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            1-Click Console Snippet (Fastest)
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              activeTab === 'paste'
                ? 'bg-[#00F0FF] text-[#0A0B0E] font-bold'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            Paste Source / Payload
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              activeTab === 'upload'
                ? 'bg-purple-500 text-white font-bold'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File (.html / .zip)
          </button>
        </div>

        {/* Tab 1: Snippet Method */}
        {activeTab === 'snippet' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 bg-[#161922] border border-[#00F0FF]/30 rounded-lg text-slate-300 space-y-2">
              <span className="text-[#00F0FF] font-bold block flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                HOW TO DECODE ANY PRIVATE SITE IN 3 SECONDS:
              </span>
              <ol className="list-decimal pl-5 space-y-1 text-slate-300 text-[11px] leading-relaxed">
                <li>Open your private website, intranet, or behind-login dashboard in your browser.</li>
                <li>Press <kbd className="px-1 py-0.5 bg-black/60 rounded border border-white/10 text-white">F12</kbd> (or right click &rarr; Inspect &rarr; Console).</li>
                <li>Copy the snippet below, paste it into the Console, and press <kbd className="px-1 py-0.5 bg-black/60 rounded border border-white/10 text-white">Enter</kbd>.</li>
                <li>It instantly captures the live rendered DOM, computed tokens, and scripts to your clipboard.</li>
              </ol>
            </div>

            {/* Snippet Code Pre block */}
            <div className="relative">
              <div className="flex items-center justify-between pb-1.5 text-slate-400 text-[11px]">
                <span>DEVTOOLS CONSOLE EXTRACTION SNIPPET</span>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleCopySnippet}
                  icon={copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copiedSnippet ? 'Copied Snippet!' : 'Copy Snippet'}
                </Button>
              </div>
              <pre className="p-3 bg-[#090A0E] rounded-lg border border-white/10 text-slate-300 max-h-36 overflow-auto text-[11px] leading-relaxed">
                <code>{snippetCode}</code>
              </pre>
            </div>

            {/* Quick action to paste after running snippet */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Already ran the snippet?</span>
              <Button
                variant="cyan"
                onClick={handlePasteFromClipboard}
                icon={<ClipboardCheck className="w-4 h-4" />}
              >
                Paste from Clipboard & Decode Now
              </Button>
            </div>
          </div>
        )}

        {/* Tab 2: Paste Raw Markup */}
        {activeTab === 'paste' && (
          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="block text-slate-400 mb-1">TARGET ORIGIN / URL</label>
              <input
                type="text"
                value={customOrigin}
                onChange={e => setCustomOrigin(e.target.value)}
                className="w-full bg-[#0A0B0E] border border-white/15 rounded-lg p-2 text-white focus:outline-none focus:border-[#00F0FF]"
                placeholder="https://dashboard.internal"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                PASTE RAW HTML MARKUP OR ECHO JSON PAYLOAD
              </label>
              <textarea
                value={pastedJsonOrHtml}
                onChange={e => setPastedJsonOrHtml(e.target.value)}
                placeholder="Paste <!DOCTYPE html>... or ECHO JSON payload from snippet"
                rows={9}
                className="w-full bg-[#0A0B0E] border border-white/15 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-[#00F0FF] resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="primary"
                onClick={handleProcessPasted}
                disabled={!pastedJsonOrHtml.trim()}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Decode Private Source
              </Button>
            </div>
          </div>
        )}

        {/* Tab 3: Upload Local File */}
        {activeTab === 'upload' && (
          <div className="p-6 border-2 border-dashed border-white/20 hover:border-[#FEE75C] rounded-xl flex flex-col items-center justify-center text-center bg-[#090A0E]">
            <Upload className="w-10 h-10 text-[#FEE75C] mb-3" />
            <h4 className="text-sm font-bold text-white mb-1">Drop Private Source File</h4>
            <p className="text-xs text-slate-400 mb-4">
              Select saved HTML document or single-page archive from your machine.
            </p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".html,.htm,.xhtml,text/html"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="px-4 py-2 bg-white/10 hover:bg-white/20 text-xs font-mono font-medium text-white rounded-md transition-colors">
                Browse Files
              </span>
            </label>
          </div>
        )}
      </div>
    </Modal>
  );
};
