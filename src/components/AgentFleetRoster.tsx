import React from 'react';
import { PixelAgent } from '../types/archer';
import { sound } from '../services/soundEffects';
import { Users, Bot, Terminal, Activity, CheckCircle2, Radio, Play } from 'lucide-react';

export interface FleetAgentInfo {
  id: string;
  name: string;
  role: string;
  badge: string;
  color: string;
  status: string;
  duty: string;
  isActive: boolean;
}

export const ALL_FLEET_AGENTS: FleetAgentInfo[] = [
  {
    id: 'dave',
    name: 'Dave',
    role: 'Lead AI Engineer',
    badge: 'DEV',
    color: '#00f3ff',
    status: 'Coding Python AI Core',
    duty: 'Orbital path algorithms & Neural synthesis',
    isActive: true,
  },
  {
    id: 'sarah',
    name: 'Sarah',
    role: 'Mission Director',
    badge: 'PM',
    color: '#ff9e00',
    status: 'Reviewing Mission Plan',
    duty: 'Coordinating satellite passes & operations',
    isActive: true,
  },
  {
    id: 'alex',
    name: 'Alex',
    role: 'Security & QA Guard',
    badge: 'QA',
    color: '#10b981',
    status: 'Automating Unit Tests',
    duty: 'Sub-system integrity & threat scanning',
    isActive: true,
  },
  {
    id: 'maya',
    name: 'Maya',
    role: 'Optical Vision Analyst',
    badge: 'VIS',
    color: '#b5179e',
    status: 'Tracking Earth Feeds',
    duty: 'Multi-spectral satellite imagery processing',
    isActive: true,
  },
  {
    id: 'atlas',
    name: 'Atlas',
    role: 'Orbital Navigator',
    badge: 'NAV',
    color: '#38bdf8',
    status: 'ISS & Starlink Sync',
    duty: 'Calculating orbital decay & trajectory',
    isActive: true,
  },
  {
    id: 'sentinel',
    name: 'Sentinel',
    role: 'Defense Protocol',
    badge: 'DEF',
    color: '#ef4444',
    status: 'Perimeter Scanning',
    duty: 'Geospatial cyber-shield & seismic monitor',
    isActive: true,
  },
];

interface AgentFleetRosterProps {
  onSelectAgent?: (agent: FleetAgentInfo) => void;
  accentColor?: string;
}

export const AgentFleetRoster: React.FC<AgentFleetRosterProps> = ({
  onSelectAgent,
  accentColor = '#00f3ff',
}) => {
  return (
    <div className="flex flex-col bg-black/85 rounded-2xl border border-slate-800/90 backdrop-blur-md overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-950/80">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          <span className="font-orbitron font-bold text-xs tracking-wider text-white">
            ACTIVE AGENT FLEET
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{ALL_FLEET_AGENTS.length} AGENTS READY</span>
        </div>
      </div>

      {/* Agents Grid List (Responsive 2-col on mobile, 3-col on desktop) */}
      <div className="p-2 sm:p-2.5 grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto max-h-[165px] scrollbar-none font-mono text-[11px]">
        {ALL_FLEET_AGENTS.map((agent) => (
          <div
            key={agent.id}
            onClick={() => {
              sound.playBlip(1000);
              if (onSelectAgent) onSelectAgent(agent);
            }}
            className="p-2 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all flex flex-col justify-between gap-1 shadow-sm group active:scale-98"
          >
            {/* Top row: Avatar + Name + Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                  style={{ backgroundColor: agent.color }}
                />
                <span className="font-bold text-white text-xs truncate">
                  {agent.name}
                </span>
              </div>
              <span
                className="text-[9px] px-1 py-0.2 rounded font-bold border"
                style={{
                  borderColor: agent.color,
                  color: agent.color,
                  backgroundColor: `${agent.color}15`,
                }}
              >
                {agent.badge}
              </span>
            </div>

            {/* Role and Activity */}
            <div className="text-[10px] text-slate-400 truncate font-sans">
              {agent.role}
            </div>

            {/* Status Live */}
            <div className="flex items-center gap-1 text-[10px] text-slate-300 pt-0.5 border-t border-slate-900">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="truncate">{agent.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
