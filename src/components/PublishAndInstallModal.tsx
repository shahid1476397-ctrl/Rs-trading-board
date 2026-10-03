import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Download,
  Smartphone,
  Monitor,
  Share2,
  Check,
  X,
  ExternalLink,
  QrCode,
  Github,
  Globe,
  Copy,
  Sparkles,
  Layers,
} from 'lucide-react';
import { sound } from '../services/soundEffects';

interface PublishAndInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublishAndInstallModal: React.FC<PublishAndInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'install' | 'mobile_qr' | 'github'>('install');

  // Published Live URLs
  const liveUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-pre-siq5fduhmnegvqawtjignx-845311567191.asia-east1.run.app';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(liveUrl)}&bgcolor=000000&color=00f3ff`;

  const handleCopy = () => {
    sound.playBlip(1000);
    navigator.clipboard.writeText(liveUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleNativeInstall = async () => {
    sound.playExecuteSuccess();
    if (isInstallable) {
      await install();
    } else {
      // Fallback instructions for manual install
      alert('To install on PC: Click the Install icon (computer with down arrow) in your browser address bar.\n\nOn Mobile: Tap the 3 dots menu and select "Add to Home Screen" or "Install App".');
    }
  };

  // Download Standalone Ready-to-Run Single File HTML
  const handleDownloadStandalone = () => {
    sound.playExecuteSuccess();
    const standaloneHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Archer AI - Standalone Launcher</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; font-family: system-ui, -apple-system, sans-serif; }
    body { background: #000; color: #fff; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; }
    .card { max-width: 500px; text-align: center; border: 1px solid #1e293b; padding: 2.5rem 2rem; border-radius: 24px; background: rgba(15,23,42,0.6); box-shadow: 0 25px 50px rgba(0,0,0,0.8); }
    h1 { font-size: 2rem; color: #00f3ff; margin-bottom: 1rem; font-family: monospace; }
    p { color: #94a3b8; font-size: 1rem; line-height: 1.6; margin-bottom: 2rem; }
    .btn { display: inline-block; padding: 1rem 2.2rem; background: #00f3ff; color: #000; font-weight: bold; border-radius: 50px; text-decoration: none; transition: 0.3s; font-size: 1.1rem; }
    .btn:hover { background: #ff007f; color: #fff; transform: translateY(-3px); }
  </style>
</head>
<body>
  <div class="card">
    <h1>ARCHER AI</h1>
    <p>Autonomous Voice Assistant & Mobile Device Automation OS.</p>
    <a href="${liveUrl}" class="btn">Launch Live Application</a>
  </div>
</body>
</html>`;

    const blob = new Blob([standaloneHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'archer-ai-standalone.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 font-mono text-xs">
      <div className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-black border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-700 text-cyan-400 flex items-center justify-center font-bold">
              <Download className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-white text-sm font-sans">Install & Publish Center</span>
              <p className="text-[10px] text-slate-400 font-sans">Mobile Home Screen, PC Desktop & GitHub Export</p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playBlip(700);
              onClose();
            }}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-4 pt-3 border-b border-slate-800 gap-2 bg-slate-950">
          <button
            onClick={() => setActiveTab('install')}
            className={`pb-2.5 px-3 font-sans text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'install'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Install on PC / Mobile</span>
          </button>

          <button
            onClick={() => setActiveTab('mobile_qr')}
            className={`pb-2.5 px-3 font-sans text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'mobile_qr'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan Mobile QR</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`pb-2.5 px-3 font-sans text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'github'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub & Download</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[65vh] overflow-y-auto space-y-4">
          {/* TAB 1: 1-CLICK INSTALL ON PC & MOBILE */}
          {activeTab === 'install' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm font-sans flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Instant App Installation</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                    PWA STANDALONE READY
                  </span>
                </div>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  You can install Archer AI directly as a native standalone application on your PC Desktop or Mobile Phone without an app store. It runs full-screen, with instant load speed and home screen launcher access.
                </p>

                <div className="pt-2">
                  <button
                    onClick={handleNativeInstall}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold font-sans text-sm shadow-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isInstalled ? 'App Already Installed' : 'Install Archer AI on this Device Now'}</span>
                  </button>
                </div>
              </div>

              {/* Instructions by Platform */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* PC Instructions */}
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold font-sans text-xs">
                    <Monitor className="w-4 h-4" />
                    <span>PC Desktop (Chrome / Edge)</span>
                  </div>
                  <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
                    Look for the <strong>Install</strong> button (computer icon with down arrow) in your Chrome or Edge address bar, or click the Install button above.
                  </p>
                </div>

                {/* Mobile Instructions */}
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold font-sans text-xs">
                    <Smartphone className="w-4 h-4" />
                    <span>Mobile Phone (Android & iOS)</span>
                  </div>
                  <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
                    On Android: Tap "Add to Home screen". On iPhone: Tap the <strong>Share</strong> button and choose <strong>"Add to Home Screen"</strong>.
                  </p>
                </div>
              </div>

              {/* Live URL Copy Bar */}
              <div className="p-3 bg-black rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                <div className="truncate text-slate-400 text-[11px] font-mono select-all">
                  {liveUrl}
                </div>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 flex items-center gap-1 font-bold text-xs shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MOBILE QR CODE SCANNER */}
          {activeTab === 'mobile_qr' && (
            <div className="flex flex-col items-center justify-center p-4 space-y-4 text-center">
              <div className="p-3 bg-black rounded-3xl border-2 border-cyan-500/80 shadow-[0_0_30px_rgba(0,243,255,0.2)]">
                <img
                  src={qrCodeUrl}
                  alt="Archer AI Mobile QR Code"
                  className="w-48 h-48 rounded-2xl"
                />
              </div>

              <div className="space-y-1">
                <div className="font-bold text-white font-sans text-sm">
                  Scan with your Phone Camera
                </div>
                <p className="text-slate-400 font-sans text-xs max-w-xs mx-auto">
                  Open your mobile camera or QR scanner to launch and install Archer AI directly on your smartphone in seconds.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-sans text-xs flex items-center gap-1.5 shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in New Tab</span>
                </a>

                <button
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold font-sans text-xs border border-slate-700 flex items-center gap-1.5"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy URL'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: GITHUB EXPORT & DOWNLOAD PACKAGE */}
          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <Github className="w-5 h-5 text-white" />
                  <span className="font-bold text-white font-sans text-sm">Download Standalone Package</span>
                </div>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  Download the complete standalone launcher or upload your repository directly to GitHub.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleDownloadStandalone}
                    className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-sans text-xs flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Standalone App (HTML)</span>
                  </button>

                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold font-sans text-xs border border-slate-600 flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Open Live Hosted App</span>
                  </a>
                </div>
              </div>

              {/* GitHub Deployment Commands */}
              <div className="space-y-2">
                <span className="text-slate-400 font-sans text-xs font-bold">
                  GitHub & Local Run Commands:
                </span>
                <div className="p-3 bg-black rounded-xl border border-slate-800 space-y-1 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                  <div># Clone and run locally:</div>
                  <div>npm install</div>
                  <div>npm run dev</div>
                  <div className="pt-1 text-slate-500"># Deploy to GitHub Pages / Vercel / Cloud Run:</div>
                  <div>npm run build</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
