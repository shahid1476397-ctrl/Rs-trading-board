import React from 'react';
import { SystemPartitionId, SYSTEM_PARTITIONS } from './SystemPartitionsGrid';
import { AgentFleetRoster } from './AgentFleetRoster';
import { AgentTown } from './AgentTown';
import { MemoryAndTasksPanel } from './MemoryAndTasksPanel';
import { LeftSystemPanel } from './LeftSystemPanel';
import { InteractiveGlobe } from './InteractiveGlobe';
import { ArcherTheme, ARCHER_THEMES, ArcherThemeId } from '../types/archer';
import { CITIES_DATABASE } from '../types/earth';
import { sound } from '../services/soundEffects';
import { X, Volume2 } from 'lucide-react';

interface PartitionInspectorModalProps {
  partitionId: SystemPartitionId | null;
  onClose: () => void;
  theme: ArcherTheme;
  onSelectTheme: (themeId: ArcherThemeId) => void;
  onSendCommand: (cmd: string) => void;
  onSpeakEnglish: (text: string) => void;
}

export const PartitionInspectorModal: React.FC<PartitionInspectorModalProps> = ({
  partitionId,
  onClose,
  theme,
  onSelectTheme,
  onSendCommand,
  onSpeakEnglish,
}) => {
  if (!partitionId) return null;

  const partitionInfo = SYSTEM_PARTITIONS.find((p) => p.id === partitionId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-slate-950 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] font-mono text-xs animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: partitionInfo?.color || theme.orbColorHex }}
            />
            <span className="font-bold text-white uppercase text-sm tracking-wider">
              {partitionInfo?.title}
            </span>
          </div>

          <button
            onClick={() => {
              sound.playBlip(700);
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Modal Content based on partition */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* 1. AGENTS PARTITION */}
          {partitionId === 'agents' && (
            <div className="space-y-3">
              <p className="text-slate-400 font-sans text-xs">
                All autonomous fleet agents are operational. Click any agent card to dispatch a command.
              </p>
              <AgentFleetRoster
                accentColor={theme.orbColorHex}
                onSelectAgent={(agent) => {
                  onSendCommand(`Hey ${agent.name}, report your status on ${agent.duty}`);
                  onClose();
                }}
              />
            </div>
          )}

          {/* 2. AGENT TOWN SIMULATION */}
          {partitionId === 'town' && (
            <div className="space-y-3">
              <p className="text-slate-400 font-sans text-xs">
                Interactive pixel-art virtual office simulation showing real-time agent workflow.
              </p>
              <div className="h-[320px] rounded-xl overflow-hidden border border-slate-800">
                <AgentTown />
              </div>
            </div>
          )}

          {/* 3. MEMORY & TASKS BANK */}
          {partitionId === 'memory' && (
            <div className="space-y-3">
              <p className="text-slate-400 font-sans text-xs">
                Persistent memory registry and active mission task manager.
              </p>
              <div className="h-[360px] rounded-xl overflow-hidden border border-slate-800">
                <MemoryAndTasksPanel />
              </div>
            </div>
          )}

          {/* 4. 3D EARTH RECON */}
          {partitionId === 'earth' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-sans">
                  Interactive 3D Earth globe with orbital satellite tracking
                </span>
                <span className="text-cyan-400 font-mono text-[10px]">
                  ROTATION: 60 FPS
                </span>
              </div>
              <div className="h-[320px] rounded-xl overflow-hidden border border-slate-800 relative">
                <InteractiveGlobe
                  viewMode="photoreal"
                  targetLat={40.7128}
                  targetLng={-74.0060}
                  targetZoom={2.0}
                  autoRotate={true}
                  selectedLocation={CITIES_DATABASE[2]}
                  onSelectLocation={(loc) => {
                    onSpeakEnglish(`Camera focused on ${loc.name}.`);
                  }}
                />
              </div>
            </div>
          )}

          {/* 5. SYSTEM DIAGNOSTICS */}
          {partitionId === 'diagnostics' && (
            <div className="h-[350px] rounded-xl overflow-hidden border border-slate-800">
              <LeftSystemPanel theme={theme} isOnline={true} />
            </div>
          )}

          {/* 6. VOICE & THEME SETTINGS */}
          {partitionId === 'settings' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-3 bg-black/60 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">ENGLISH VOICE SYNTHESIS</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                    en-US ACTIVE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Clear, natural, and direct English voice output is enabled.
                </p>
                <button
                  onClick={() => onSpeakEnglish('Archer AI system online. How can I assist you today?')}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center gap-1.5 transition-all text-xs"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Test English Voice</span>
                </button>
              </div>

              {/* Color Theme Selector */}
              <div className="p-3 bg-black/60 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-white uppercase text-[11px]">
                  Select Color Theme
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {(Object.keys(ARCHER_THEMES) as ArcherThemeId[]).map((tId) => {
                    const t = ARCHER_THEMES[tId];
                    const isSelected = theme.id === tId;
                    return (
                      <button
                        key={tId}
                        onClick={() => {
                          sound.playExecuteSuccess();
                          onSelectTheme(tId);
                        }}
                        className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                          isSelected ? 'bg-slate-900 border-white text-white font-bold' : 'border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.orbColorHex }} />
                        <span className="truncate">{t.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex justify-end shrink-0">
          <button
            onClick={() => {
              sound.playBlip(700);
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
