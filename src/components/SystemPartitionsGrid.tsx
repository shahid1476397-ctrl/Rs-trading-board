import React from 'react';
import {
  Users,
  Building2,
  ListTodo,
  Globe2,
  Cpu,
  Settings,
  ArrowUpRight,
} from 'lucide-react';
import { sound } from '../services/soundEffects';

export type SystemPartitionId = 'agents' | 'town' | 'memory' | 'earth' | 'diagnostics' | 'settings';

export interface PartitionItem {
  id: SystemPartitionId;
  title: string;
  badge: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  status: string;
}

export const SYSTEM_PARTITIONS: PartitionItem[] = [
  {
    id: 'agents',
    title: 'Agents Fleet Hub',
    badge: '6 ACTIVE',
    desc: 'Dave (Dev), Sarah (PM), Alex (QA), Maya (Vision), Atlas, Sentinel',
    icon: Users,
    color: '#00f3ff',
    status: 'All 6 agents online and ready',
  },
  {
    id: 'town',
    title: 'Virtual Office Town',
    badge: 'PIXEL 2D',
    desc: 'Interactive office with animated agents, desks, and daylight cycle',
    icon: Building2,
    color: '#10b981',
    status: 'Simulation running smoothly',
  },
  {
    id: 'memory',
    title: 'Memory & Tasks Bank',
    badge: 'PERSISTENT',
    desc: 'Recorded directives, operational memories, and pending to-dos',
    icon: ListTodo,
    color: '#b5179e',
    status: 'Stored in persistent brain storage',
  },
  {
    id: 'earth',
    title: '3D Earth & Satellites',
    badge: 'SPATIAL',
    desc: 'Interactive 3D Earth globe, city coordinates, and orbit trajectories',
    icon: Globe2,
    color: '#38bdf8',
    status: 'Orbital satellite feed locked',
  },
  {
    id: 'diagnostics',
    title: 'System Telemetry',
    badge: 'DIAGNOSTICS',
    desc: 'Core v3.8 status, ping, memory buffers, and live event stream',
    icon: Cpu,
    color: '#ff9e00',
    status: '14ms latency • Optimal',
  },
  {
    id: 'settings',
    title: 'Voice & Theme Settings',
    badge: 'CONFIG',
    desc: 'English speech rate, pitch, audio SFX, and theme color palette',
    icon: Settings,
    color: '#e63946',
    status: 'English Voice-Over active',
  },
];

interface SystemPartitionsGridProps {
  onOpenPartition: (id: SystemPartitionId) => void;
  accentColor?: string;
}

export const SystemPartitionsGrid: React.FC<SystemPartitionsGridProps> = ({
  onOpenPartition,
  accentColor = '#00f3ff',
}) => {
  return (
    <div className="flex flex-col bg-black/85 rounded-2xl border border-slate-800/90 backdrop-blur-md overflow-hidden shadow-xl p-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full animate-ping"
            style={{ backgroundColor: accentColor }}
          />
          <span className="font-orbitron font-bold text-xs tracking-wider text-white">
            SYSTEM PARTITIONS
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">
          Click any card to inspect and control
        </span>
      </div>

      {/* Grid of Clickable Partition Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        {SYSTEM_PARTITIONS.map((part) => {
          const Icon = part.icon;
          return (
            <button
              key={part.id}
              onClick={() => {
                sound.playExecuteSuccess();
                onOpenPartition(part.id);
              }}
              className="p-2.5 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-all flex flex-col justify-between gap-1.5 shadow-sm group active:scale-98 relative overflow-hidden"
            >
              {/* Top Row: Icon + Badge + Open Arrow */}
              <div className="flex items-center justify-between w-full">
                <div
                  className="p-1.5 rounded-lg border flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{
                    borderColor: part.color,
                    color: part.color,
                    backgroundColor: `${part.color}15`,
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className="text-[9px] px-1.5 py-0.2 rounded font-bold border"
                    style={{
                      borderColor: part.color,
                      color: part.color,
                      backgroundColor: `${part.color}10`,
                    }}
                  >
                    {part.badge}
                  </span>
                  <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-white transition-colors" />
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <div className="font-bold text-white text-[11px] truncate group-hover:text-cyan-300 transition-colors">
                  {part.title}
                </div>
                <div className="text-[10px] text-slate-400 font-sans truncate">
                  {part.desc}
                </div>
              </div>

              {/* Status footer */}
              <div className="text-[9px] text-slate-500 truncate pt-1 border-t border-slate-900 w-full flex items-center gap-1 font-sans">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: part.color }} />
                <span>{part.status}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
