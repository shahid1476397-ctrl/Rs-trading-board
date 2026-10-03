import React from 'react';
import { Database, Wrench, Sparkles, Settings } from 'lucide-react';
import { ArcherTheme } from '../types/archer';

interface NodeConnectorWiresProps {
  theme: ArcherTheme;
  activeNode: string | null;
  onSelectNode: (node: 'MEMORY' | 'SKILLS' | 'SOUL' | 'SETTING') => void;
}

export const NodeConnectorWires: React.FC<NodeConnectorWiresProps> = ({
  theme,
  activeNode,
  onSelectNode,
}) => {
  const nodes = [
    {
      id: 'MEMORY',
      name: 'MEMORY',
      icon: Database,
      color: '#00f3ff',
      wireY: 30,
    },
    {
      id: 'SKILLS',
      name: 'SKILLS',
      icon: Wrench,
      color: '#ff9e00',
      wireY: 80,
    },
    {
      id: 'SOUL',
      name: 'SOUL',
      icon: Sparkles,
      color: '#06d6a0',
      wireY: 130,
    },
    {
      id: 'SETTING',
      name: 'SETTING',
      icon: Settings,
      color: '#e2e8f0',
      wireY: 180,
    },
  ] as const;

  return (
    <div className="relative flex items-center h-full w-full">
      {/* 4 Stacked Node Tag Buttons */}
      <div className="flex flex-col justify-between h-[210px] z-10 w-28 shrink-0">
        {nodes.map((node) => {
          const Icon = node.icon;
          const isSelected = activeNode === node.id;
          return (
            <button
              key={node.id}
              onClick={() => onSelectNode(node.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-mono font-bold tracking-wider transition-all shadow-md active:scale-95 ${
                isSelected
                  ? 'bg-slate-900 border-white text-white'
                  : 'bg-black/80 hover:bg-slate-900 text-slate-300'
              }`}
              style={{
                borderColor: isSelected ? '#ffffff' : node.color,
                boxShadow: isSelected ? `0 0 10px ${node.color}` : `0 0 4px ${node.color}40`,
              }}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: node.color }} />
              <span>{node.name}</span>
            </button>
          );
        })}
      </div>

      {/* SVG Connecting Glowing Wires */}
      <svg className="flex-1 h-[210px] overflow-visible pointer-events-none" viewBox="0 0 140 210">
        <defs>
          {nodes.map((node) => (
            <filter key={`glow-${node.id}`} id={`glow-${node.id}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {nodes.map((node) => {
          // Curved bezier wire connecting node button output to orb
          const startX = 0;
          const startY = node.wireY;
          const endX = 140;
          const endY = 105; // Converge towards the center of the orb

          return (
            <g key={node.id}>
              {/* Outer glow stroke */}
              <path
                d={`M ${startX} ${startY} C ${startX + 60} ${startY}, ${endX - 40} ${endY}, ${endX} ${endY}`}
                fill="none"
                stroke={node.color}
                strokeWidth="2.5"
                opacity="0.8"
                filter={`url(#glow-${node.id})`}
              />
              {/* Core bright wire */}
              <path
                d={`M ${startX} ${startY} C ${startX + 60} ${startY}, ${endX - 40} ${endY}, ${endX} ${endY}`}
                fill="none"
                stroke="#ffffff"
                strokeWidth="1"
                opacity="0.9"
              />
              {/* Connection dot at start */}
              <circle cx={startX + 2} cy={startY} r="3" fill={node.color} />
              {/* Connection dot at orb boundary */}
              <circle cx={endX - 2} cy={endY} r="3" fill={node.color} />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
