import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { FileUp, Code, Sparkles, Upload } from 'lucide-react';

interface ManualInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (html: string, url: string) => void;
}

export const ManualInputModal: React.FC<ManualInputModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [htmlContent, setHtmlContent] = useState('');
  const [customUrl, setCustomUrl] = useState('https://manual-import.local');
  const [activeMode, setActiveMode] = useState<'paste' | 'upload'>('paste');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        const text = event.target?.result as string;
        setHtmlContent(text);
        setCustomUrl(`https://${file.name.replace(/\.[^/.]+$/, '')}.local`);
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        const text = event.target?.result as string;
        setHtmlContent(text);
        setCustomUrl(`https://${file.name.replace(/\.[^/.]+$/, '')}.local`);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!htmlContent.trim()) return;
    onSubmit(htmlContent, customUrl.trim() || 'https://imported-source.local');
    onClose();
  };

  const loadSamplePayload = () => {
    const sample = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CyberCore Technologies — Decoded Prototype</title>
  <meta name="description" content="Next generation cognitive intelligence and distributed network mesh.">
  <link rel="icon" href="https://example.com/favicon.ico">
  <style>
    :root {
      --primary-neon: #FEE75C;
      --accent-cyan: #00F0FF;
      --bg-dark: #0A0B0E;
    }
    body {
      background: var(--bg-dark);
      color: #E2E8F0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .hero-btn {
      background: var(--primary-neon);
      color: #000;
      border-radius: 8px;
      padding: 12px 24px;
      box-shadow: 0 4px 14px rgba(254, 231, 92, 0.3);
    }
  </style>
</head>
<body>
  <header>
    <h1>CyberCore Intelligence Platform</h1>
    <nav>
      <a href="#solutions">Solutions</a>
      <a href="#telemetry">Live Telemetry</a>
    </nav>
  </header>
  <main>
    <section>
      <h2>Autonomous Digital Infrastructure</h2>
      <p>Decentralized source retrieval and real-time telemetry extraction for modern web applications.</p>
      <button class="hero-btn">Deploy Satellite Node</button>
      <img src="https://images.unsplash.com/photo-1518770660439-4636190af475" alt="Futuristic circuit board processor" />
    </section>
  </main>
  <script>
    console.log("CyberCore initialized successfully.");
  </script>
</body>
</html>`;
    setHtmlContent(sample);
    setCustomUrl('https://cybercore.technologies');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="MANUAL SOURCE CODE IMPORT"
      subtitle="Paste raw HTML source or upload local markup to decode offline/protected websites"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Mode Toggle & Presets */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveMode('paste')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-colors ${
                activeMode === 'paste'
                  ? 'bg-[#FEE75C] text-[#0A0B0E] font-semibold'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <Code className="w-3.5 h-3.5 inline mr-1.5" />
              Paste Markup
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('upload')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-colors ${
                activeMode === 'upload'
                  ? 'bg-[#FEE75C] text-[#0A0B0E] font-semibold'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <Upload className="w-3.5 h-3.5 inline mr-1.5" />
              Upload HTML File
            </button>
          </div>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={loadSamplePayload}
            icon={<Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />}
          >
            Load Sample Payload
          </Button>
        </div>

        {/* Target URL / Origin Identifier */}
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">
            TARGET BASE URL (For resolving relative paths & domain tokens)
          </label>
          <input
            type="text"
            value={customUrl}
            onChange={e => setCustomUrl(e.target.value)}
            className="w-full bg-[#0A0B0E] border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#FEE75C] transition-colors"
            placeholder="https://example.com"
            required
          />
        </div>

        {/* Input Area */}
        {activeMode === 'paste' ? (
          <div>
            <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-1">
              <span>RAW HTML SOURCE CODE</span>
              <span>{htmlContent.length.toLocaleString()} characters</span>
            </div>
            <textarea
              value={htmlContent}
              onChange={e => setHtmlContent(e.target.value)}
              placeholder="<!DOCTYPE html><html><head><title>My Site</title></head><body>...</body></html>"
              rows={12}
              className="w-full bg-[#0A0B0E] border border-white/15 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#FEE75C] transition-colors resize-none"
              required
            />
          </div>
        ) : (
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-white/20 hover:border-[#00F0FF] rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors bg-[#0A0B0E]/60 cursor-pointer"
          >
            <FileUp className="w-10 h-10 text-[#00F0FF] mb-3" />
            <p className="text-sm font-semibold text-white mb-1">Drag & Drop HTML File Here</p>
            <p className="text-xs text-slate-400 mb-4">Supports .html, .htm, or .xhtml files</p>
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
            {htmlContent && (
              <p className="mt-4 text-xs font-mono text-emerald-400">
                Loaded {htmlContent.length.toLocaleString()} characters from file.
              </p>
            )}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!htmlContent.trim()}
            icon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Decode Source Code
          </Button>
        </div>
      </form>
    </Modal>
  );
};
