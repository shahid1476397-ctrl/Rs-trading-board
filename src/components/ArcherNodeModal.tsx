import React from 'react';
import { brain } from '../services/geminiBrainService';
import { X, Database, Wrench, Sparkles, Settings, Check, Trash2, Play } from 'lucide-react';
import { sound } from '../services/soundEffects';

interface ArcherNodeModalProps {
  node: 'MEMORY' | 'SKILLS' | 'SOUL' | 'SETTING' | null;
  onClose: () => void;
  onExecuteSkill?: (skillName: string) => void;
}

export const ArcherNodeModal: React.FC<ArcherNodeModalProps> = ({
  node,
  onClose,
  onExecuteSkill,
}) => {
  if (!node) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-950 border border-slate-700 rounded-2xl p-5 shadow-2xl relative font-mono text-xs flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            {node === 'MEMORY' && <Database className="w-5 h-5 text-cyan-400" />}
            {node === 'SKILLS' && <Wrench className="w-5 h-5 text-amber-400" />}
            {node === 'SOUL' && <Sparkles className="w-5 h-5 text-emerald-400" />}
            {node === 'SETTING' && <Settings className="w-5 h-5 text-slate-300" />}
            <h3 className="text-base font-bold text-white tracking-wider">
              {node} CONFIGURATION
            </h3>
          </div>

          <button
            onClick={() => {
              sound.playBlip(700);
              onClose();
            }}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content based on selected Node */}
        {node === 'MEMORY' && (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            <p className="text-slate-400 font-sans text-xs">
              Persistent memory items stored by Master Prompt engine:
            </p>
            {brain.getMemory().map((m) => (
              <div key={m.id} className="p-2.5 bg-black/60 rounded-xl border border-slate-800 flex justify-between gap-2">
                <span className="text-slate-200 font-sans">{m.text}</span>
                <span className="text-[10px] text-cyan-400 shrink-0">{m.date}</span>
              </div>
            ))}
          </div>
        )}

        {node === 'SKILLS' && (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            <p className="text-slate-400 font-sans text-xs">
              Active skills executable via voice or manual trigger:
            </p>
            {[
              { id: 'desktop_ctrl', name: 'Desktop Control & Chords', desc: 'Simulate mouse, keyboard, and window management.' },
              { id: 'earth_recon', name: '3D Earth & Satellite Recon', desc: 'Fly camera to any coordinate, track ISS and Starlink.' },
              { id: 'web_search', name: 'Real-time Web Intelligence', desc: 'Live Google & DDG search crawler.' },
              { id: 'task_manager', name: 'Persistent Task Tracker', desc: 'Saves and recalls tasks assigned in conversation.' },
            ].map((skill) => (
              <div key={skill.id} className="p-3 bg-black/60 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-white">{skill.name}</div>
                  <div className="text-[11px] text-slate-400 font-sans">{skill.desc}</div>
                </div>
                <button
                  onClick={() => {
                    sound.playExecuteSuccess();
                    if (onExecuteSkill) onExecuteSkill(skill.name);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center gap-1 shrink-0"
                >
                  <Play className="w-3 h-3" />
                  <span>RUN</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {node === 'SOUL' && (
          <div className="space-y-3 font-sans text-xs text-slate-300">
            <p><strong>Master Prompt Personality Persona:</strong></p>
            <div className="p-3 bg-black/60 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Tone:</span>
                <span className="text-emerald-400 font-bold font-mono">Natural Human Helpful</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pacing:</span>
                <span className="text-cyan-400 font-bold font-mono">Conversational, 1-3 Sentences</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Language Alignment:</span>
                <span className="text-amber-400 font-bold font-mono">Urdu / Hindi / Hinglish / English</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thinking Engine:</span>
                <span className="text-white font-bold font-mono">Assessing & Clarifying Steps</span>
              </div>
            </div>
          </div>
        )}

        {node === 'SETTING' && (
          <div className="space-y-3 text-xs font-sans text-slate-300">
            <div className="p-3 bg-black/60 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Procedural Sound FX</div>
                <div className="text-[11px] text-slate-400">Audio chirps and telemetry blips</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono text-[10px] font-bold">
                ACTIVE
              </span>
            </div>

            <div className="p-3 bg-black/60 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Full-Screen Standalone PWA</div>
                <div className="text-[11px] text-slate-400">Installable on PC desktop and mobile</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono text-[10px] font-bold">
                READY
              </span>
            </div>
          </div>
        )}

        <button
          onClick={() => {
            sound.playBlip(700);
            onClose();
          }}
          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold uppercase tracking-wider text-xs border border-slate-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};
