import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Check } from 'lucide-react';
import { sound } from '../services/soundEffects';
import { PublishAndInstallModal } from './PublishAndInstallModal';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'compact' | 'drawer';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { isInstalled } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  const handleInstallClick = () => {
    sound.playBlip(1200);
    setShowModal(true);
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`flex items-center gap-1.5 px-2.5 py-1 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/80 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-md ${className}`}
        title="Install Archer AI on Mobile Phone or PC Desktop & GitHub Package"
      >
        <Download className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        <span className="hidden sm:inline">{isInstalled ? 'Installed' : 'Install App'}</span>
      </button>

      <PublishAndInstallModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};
