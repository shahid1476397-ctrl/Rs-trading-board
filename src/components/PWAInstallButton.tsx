import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Laptop, Check, X, Share2 } from 'lucide-react';
import { sound } from '../services/soundEffects';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'compact' | 'drawer';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // If already installed, show subtle installed indicator
  if (isInstalled) {
    if (variant === 'drawer') {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/40 border border-emerald-800 text-emerald-400 rounded text-xs font-mono">
          <Check className="w-3.5 h-3.5" />
          <span>Mark LV System Installed [Standalone Active]</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    sound.playBlip(1200);
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      setShowInfoModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/60 rounded text-xs font-mono uppercase tracking-wider transition-all shadow-md shadow-cyan-950/40 ${className}`}
        title="Install Mark LV on Mobile Phone or PC Desktop"
      >
        <Download className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        <span className="font-bold">Install App</span>
      </button>

      {/* iOS Safari Installation Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-slate-950 border border-cyan-500/50 rounded-xl p-5 shadow-2xl relative flex flex-col gap-4 hud-bracket font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Install on iPhone / iPad
                </h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3 font-sans leading-relaxed">
              <p>Apple iOS Safari does not show an automatic prompt. To install Mark LV to your home screen:</p>
              <div className="p-3 bg-black/60 rounded border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-cyan-400">1.</span>
                  <span>Tap the <strong className="text-white">Share</strong> icon <Share2 className="w-3.5 h-3.5 inline mx-1 text-cyan-400" /> at bottom of Safari.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-cyan-400">2.</span>
                  <span>Scroll down and select <strong className="text-white">"Add to Home Screen"</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-cyan-400">3.</span>
                  <span>Tap <strong className="text-cyan-400">Add</strong> at top right to launch full-screen standalone HUD.</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 rounded text-xs uppercase tracking-wider font-bold"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* PC / Android General Instructions Modal if ambient badge is blocked */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-slate-950 border border-cyan-500/50 rounded-xl p-5 shadow-2xl relative flex flex-col gap-4 hud-bracket font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Laptop className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Install Mark LV
                </h3>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3 font-sans leading-relaxed">
              <p>Install Mark LV directly to your PC desktop or Mobile device as a standalone native app:</p>
              <div className="p-3 bg-black/60 rounded border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-cyan-400">PC / Chrome:</span>
                  <span>Click the <strong className="text-white">Install</strong> icon in your browser URL bar (or menu ⋮ → "Install Mark LV").</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-cyan-400">Mobile / Android:</span>
                  <span>Tap Chrome menu ⋮ → <strong className="text-white">"Install app"</strong> or "Add to Home Screen".</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 rounded text-xs uppercase tracking-wider font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
