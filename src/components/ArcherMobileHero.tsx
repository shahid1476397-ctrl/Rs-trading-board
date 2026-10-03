import React from 'react';
import { ArcherTheme } from '../types/archer';
import { History, Coins, Lock, Square, CheckSquare, Volume2, Mic, MicOff } from 'lucide-react';
import { sound } from '../services/soundEffects';

interface ArcherMobileHeroProps {
  theme: ArcherTheme;
  isListening: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
  tasks: Array<{ id: string; title: string; completed: boolean }>;
  onToggleTask: (id: string) => void;
  onToggleMute: () => void;
  onSelectNode: (node: 'MEMORY' | 'CHAT' | 'SOUL' | 'SETTING') => void;
  headlines?: string[];
}

export const ArcherMobileHero: React.FC<ArcherMobileHeroProps> = ({
  theme,
  isListening,
  isSpeaking,
  isMuted,
  tasks,
  onToggleTask,
  onToggleMute,
  onSelectNode,
  headlines = ['Auto-listening active (Never auto-mutes)', 'Autonomous app control nominal'],
}) => {
  const nodes = [
    { id: 'MEMORY', name: 'MEMORY', color: '#00f3ff' },
    { id: 'CHAT', name: 'CHAT', color: '#f59e0b' },
    { id: 'SOUL', name: 'SOUL', color: '#10b981' },
    { id: 'SETTING', name: 'SETTING', color: '#94a3b8' },
  ] as const;

  const remainingTasks = tasks.filter((t) => !t.completed).length;

  return (
    <div className="flex flex-col h-full w-full bg-black text-white font-mono p-3 select-none justify-between overflow-y-auto">
      {/* 1. Header Bar (As seen in Video) */}
      <div className="flex items-center justify-between pt-1 pb-3 px-1">
        {/* Left: History icon */}
        <button
          onClick={() => sound.playBlip(900)}
          className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white"
        >
          <History className="w-4 h-4" />
        </button>

        {/* Center: Lock icon + ARCHER AI */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs font-bold tracking-wider">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-orbitron text-white">ARCHER AI</span>
        </div>

        {/* Right: Coins/Points Icon */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-bold text-xs">
          <Coins className="w-3.5 h-3.5" />
          <span>$</span>
        </div>
      </div>

      {/* 2. Middle Interactive Stage: 4 Nodes + Bezier Wires + Glowing Orb with LISTENING/SPEAKING/MUTED */}
      <div className="relative flex items-center justify-between w-full my-auto py-2">
        {/* Left 4 Stacked Node Buttons */}
        <div className="flex flex-col justify-between h-[210px] w-24 shrink-0 z-10 space-y-2">
          {nodes.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                sound.playBlip(1100);
                onSelectNode(n.id);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-bold tracking-wider transition-all shadow-md active:scale-95 bg-black/90 hover:bg-slate-900"
              style={{
                borderColor: n.color,
                color: n.color,
                boxShadow: `0 0 8px ${n.color}40`,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: n.color }} />
              <span>{n.name}</span>
            </button>
          ))}
        </div>

        {/* Connecting SVG Bezier Wires */}
        <div className="flex-1 h-[210px] relative pointer-events-none">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 210" preserveAspectRatio="none">
            {nodes.map((n, idx) => {
              const yStart = 25 + idx * 53;
              const yEnd = 105;
              return (
                <g key={n.id}>
                  <path
                    d={`M 0 ${yStart} C 50 ${yStart}, 50 ${yEnd}, 100 ${yEnd}`}
                    fill="none"
                    stroke={n.color}
                    strokeWidth="2.5"
                    strokeOpacity="0.85"
                  />
                  {/* Flowing particle pulse */}
                  <circle r="3" fill="#ffffff">
                    <animateMotion
                      path={`M 0 ${yStart} C 50 ${yStart}, 50 ${yEnd}, 100 ${yEnd}`}
                      dur={`${1.8 + idx * 0.4}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right Glowing Orb Sphere (Matching Video Circle) */}
        <div className="relative w-44 h-44 shrink-0 flex flex-col items-center justify-center">
          {/* Outer Glowing Neon Ring */}
          <div
            onClick={onToggleMute}
            className={`w-36 h-36 rounded-full border-2 flex flex-col items-center justify-center relative cursor-pointer transition-all ${
              isMuted
                ? 'border-rose-800/80 bg-rose-950/20 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : isSpeaking
                ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_25px_rgba(0,243,255,0.7)] animate-pulse'
                : 'border-emerald-400 bg-emerald-950/30 shadow-[0_0_25px_rgba(16,185,129,0.7)] animate-pulse'
            }`}
          >
            {/* Particle Swarm Simulation */}
            <div className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center opacity-80">
              <div
                className={`w-28 h-28 rounded-full blur-sm animate-spin ${
                  isMuted
                    ? 'bg-gradient-to-tr from-rose-900/20 to-slate-800/20'
                    : 'bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20'
                }`}
                style={{ animationDuration: '8s' }}
              />
            </div>

            {/* Status Label (LISTENING / SPEAKING / MUTED) */}
            <div className="z-10 flex flex-col items-center gap-1">
              <span
                className={`text-[10px] font-bold tracking-widest uppercase ${
                  isMuted
                    ? 'text-rose-400'
                    : isSpeaking
                    ? 'text-cyan-300'
                    : 'text-emerald-400 animate-bounce'
                }`}
              >
                {isMuted ? '• MUTED •' : isSpeaking ? '• SPEAKING •' : '• LISTENING •'}
              </span>

              {/* Central Mic Pulse */}
              <div
                className={`w-3 h-3 rounded-full ${
                  isMuted ? 'bg-rose-500' : isSpeaking ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400 animate-ping'
                }`}
              />
            </div>
          </div>

          {/* Under Orb Controls: EXPLICIT MUTE / UNMUTE BUTTON ("जब तक मैं म्यूट पर न लगाऊं, ये म्यूट पर न लगे") */}
          <div className="flex items-center gap-2 mt-3 z-10">
            <button
              onClick={() => {
                sound.playBlip(isMuted ? 1200 : 700);
                onToggleMute();
              }}
              className={`px-4 py-1 rounded-full border font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all active:scale-95 ${
                isMuted
                  ? 'bg-rose-950/80 border-rose-700 text-rose-300 hover:bg-rose-900'
                  : 'bg-slate-900 border-slate-700 hover:border-emerald-500 text-emerald-400'
              }`}
            >
              {isMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
              <span>{isMuted ? 'UNMUTE' : 'MUTE'}</span>
            </button>

            <button
              onClick={() => {
                sound.playBlip(1000);
                onToggleMute();
              }}
              className={`p-1.5 rounded-full border text-xs transition-all ${
                isMuted
                  ? 'bg-rose-950 border-rose-800 text-rose-400'
                  : 'bg-emerald-950 border-emerald-700 text-emerald-400'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Bottom Cards (TODAY HEADLINES and TODAY TASKS as shown in video!) */}
      <div className="grid grid-cols-2 gap-2.5 pt-2 shrink-0">
        {/* Left: TODAY HEADLINES */}
        <div className="p-3 bg-slate-950/90 rounded-2xl border border-slate-800 flex flex-col justify-between min-h-[95px] shadow-lg">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-900 pb-1">
            <span>TODAY HEADLINES</span>
          </div>

          <div className="text-[11px] text-slate-400 font-sans py-1">
            {isMuted ? 'Muted: Tap Unmute to resume speaking' : 'Always listening... बोलिए'}
          </div>

          <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
            <div className={`h-full w-1/3 ${isMuted ? 'bg-rose-500' : 'bg-emerald-500'}`} />
          </div>
        </div>

        {/* Right: TODAY TASKS */}
        <div className="p-3 bg-slate-950/90 rounded-2xl border border-slate-800 flex flex-col justify-between min-h-[95px] shadow-lg">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider border-b border-slate-900 pb-1">
            <span className="text-white">TODAY TASKS!</span>
            <span className="text-amber-400 font-bold">left: {remainingTasks} 🔥</span>
          </div>

          <div className="space-y-1 py-1 overflow-y-auto max-h-[50px]">
            {tasks.map((t) => (
              <button
                key={t.id}
                onClick={() => onToggleTask(t.id)}
                className="flex items-center gap-1.5 w-full text-left text-[11px] text-slate-300 hover:text-white"
              >
                {t.completed ? (
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                )}
                <span className={`truncate ${t.completed ? 'line-through text-slate-500' : ''}`}>
                  {t.title}
                </span>
              </button>
            ))}
          </div>

          <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
            <div
              className="bg-cyan-400 h-full transition-all"
              style={{
                width: `${tasks.length ? ((tasks.length - remainingTasks) / tasks.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
