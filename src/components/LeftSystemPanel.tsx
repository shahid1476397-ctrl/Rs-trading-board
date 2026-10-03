import React from 'react';
import { Cpu, Activity, ShieldCheck, CheckCircle2, Terminal, HardDrive, Wifi, Power } from 'lucide-react';
import { ArcherTheme } from '../types/archer';
import { sound } from '../services/soundEffects';

interface LeftSystemPanelProps {
  theme: ArcherTheme;
  isOnline: boolean;
  onToggleOnline?: () => void;
}

export const LeftSystemPanel: React.FC<LeftSystemPanelProps> = ({ theme, isOnline, onToggleOnline }) => {
  return (
    <div className="flex flex-col h-full bg-black/85 rounded-2xl border border-slate-800 backdrop-blur-md overflow-hidden shadow-2xl p-3 font-mono text-xs gap-3">
      {/* Top Header: ARCHER ID + SYSTEM STATUS TOGGLE (As in Video) */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white uppercase tracking-wider text-xs">
            ARCHER ID: ARC-09
          </span>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={() => {
            sound.playExecuteSuccess();
            if (onToggleOnline) onToggleOnline();
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold transition-all shadow-sm ${
            isOnline
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600'
              : 'bg-rose-950/80 text-rose-300 border-rose-800'
          }`}
        >
          <Power className="w-3 h-3" />
          <span>{isOnline ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE'}</span>
        </button>
      </div>

      {/* Driver / Speech Engine Card (As Seen in Video) */}
      <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-white uppercase tracking-wide">
            Core Driver v3.8
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
            ACTIVE
          </span>
        </div>
        <div className="text-[11px] text-slate-400 font-sans leading-relaxed">
          Neural Driver: Model gemini-3.8-flash linked with live voice synthesis engine.
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px] pt-1.5 border-t border-slate-900 text-slate-300">
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            <span>RAM: 3.4 / 16 GB</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>PING: 14 ms</span>
          </div>
        </div>
      </div>

      {/* Real-Time Diagnostics Event Stream (As in Video) */}
      <div className="flex-1 flex flex-col gap-1.5 min-h-[140px] bg-black/60 rounded-xl border border-slate-900 p-2.5 overflow-y-auto font-mono">
        <div className="flex items-center justify-between text-[10px] text-slate-500 pb-1 border-b border-slate-900">
          <span className="flex items-center gap-1">
            <Terminal className="w-3 h-3 text-cyan-400" />
            <span>EVENT STREAM</span>
          </span>
          <span className="text-emerald-400 text-[9px]">LIVE NOMINAL</span>
        </div>
        <div className="space-y-1.5 text-[10px] text-slate-400 pt-1">
          <div className="flex items-start gap-1.5">
            <span className="text-emerald-400">✓</span>
            <span>Particle orb dynamic shader compiled.</span>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="text-cyan-400">⚡</span>
            <span>Agent Town virtual office running at 60 FPS.</span>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="text-amber-400">◈</span>
            <span>Master Prompt reasoning pipeline initialized.</span>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="text-emerald-400">✓</span>
            <span>Natural English speech recognition active (en-US).</span>
          </div>
        </div>
      </div>
    </div>
  );
};
