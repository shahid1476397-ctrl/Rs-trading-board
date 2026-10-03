import React, { useState, useEffect, useRef } from 'react';
import { PixelAgent } from '../types/archer';
import { Moon, Sun, Users, Monitor, Sparkles, Coffee, Laptop, MessageCircle } from 'lucide-react';
import { sound } from '../services/soundEffects';

const INITIAL_AGENTS: PixelAgent[] = [
  {
    id: 'dave',
    name: 'Dave',
    role: 'Dev',
    status: 'Coding Python AI Core...',
    x: 140,
    y: 110,
    targetX: 140,
    targetY: 110,
    color: '#00f3ff',
    deskX: 140,
    deskY: 110,
  },
  {
    id: 'sarah',
    name: 'Sarah',
    role: 'PM',
    status: 'Reviewing Mission Plan',
    x: 230,
    y: 110,
    targetX: 230,
    targetY: 110,
    color: '#ff9e00',
    deskX: 230,
    deskY: 110,
  },
  {
    id: 'alex',
    name: 'Alex',
    role: 'QA',
    status: 'Automating UI Tests',
    x: 320,
    y: 110,
    targetX: 320,
    targetY: 110,
    color: '#06d6a0',
    deskX: 320,
    deskY: 110,
  },
  {
    id: 'maya',
    name: 'Maya',
    role: 'Vision',
    status: 'Tracking Optical Feeds',
    x: 200,
    y: 200,
    targetX: 200,
    targetY: 200,
    color: '#b5179e',
    deskX: 200,
    deskY: 200,
  },
  {
    id: 'atlas',
    name: 'Atlas',
    role: 'Cloud',
    status: 'Optimizing Neural Infra',
    x: 100,
    y: 190,
    targetX: 100,
    targetY: 190,
    color: '#3b82f6',
    deskX: 100,
    deskY: 190,
  },
  {
    id: 'boss',
    name: 'Boss',
    role: 'Exec',
    status: 'Directing Autonomous Tasks',
    x: 340,
    y: 190,
    targetX: 340,
    targetY: 190,
    color: '#e63946',
    deskX: 340,
    deskY: 190,
  },
];

export const AgentTown: React.FC = () => {
  const [agents, setAgents] = useState<PixelAgent[]>(INITIAL_AGENTS);
  const [isNight, setIsNight] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'agents' | 'visual' | 'gesture'>('agents');
  const [selectedAgent, setSelectedAgent] = useState<PixelAgent | null>(INITIAL_AGENTS[0]);
  const [activeSpeech, setActiveSpeech] = useState<{ agentId: string; text: string } | null>({
    agentId: 'dave',
    text: 'Orb and Master Prompt synchronized!',
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Agent walking / wander AI cycle
  useEffect(() => {
    const speechPhrases = [
      'Checking neural parameters...',
      'Agent Town operational!',
      'Running background diagnostics...',
      'Grabbing a quick coffee...',
      'Ready for desktop control!',
      'Optimizing particle simulation...',
      'Standby for next voice command...',
    ];

    const interval = setInterval(() => {
      setAgents((prev) =>
        prev.map((agent) => {
          // 40% chance to wander around or return to desk
          if (Math.random() > 0.6) {
            const wanderPoints = [
              { x: agent.deskX, y: agent.deskY },
              { x: 80, y: 190 }, // Water cooler / coffee
              { x: 340, y: 190 }, // Meeting couch
              { x: 230, y: 150 }, // Central hallway
            ];
            const pick = wanderPoints[Math.floor(Math.random() * wanderPoints.length)];
            return {
              ...agent,
              targetX: pick.x,
              targetY: pick.y,
            };
          }
          return agent;
        })
      );

      // Random speech bubble
      if (Math.random() > 0.5) {
        const randAgent = INITIAL_AGENTS[Math.floor(Math.random() * INITIAL_AGENTS.length)];
        const randPhrase = speechPhrases[Math.floor(Math.random() * speechPhrases.length)];
        setActiveSpeech({ agentId: randAgent.id, text: randPhrase });
      }
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Smooth canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      // Background room colors based on Day/Night
      ctx.fillStyle = isNight ? '#090d16' : '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Floor tiles grid pattern
      const tileSize = 24;
      ctx.strokeStyle = isNight ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += tileSize) {
        for (let y = 0; y < canvas.height; y += tileSize) {
          ctx.strokeRect(x, y, tileSize, tileSize);
        }
      }

      // Room partition walls
      ctx.fillStyle = isNight ? '#0f172a' : '#334155';
      ctx.fillRect(20, 20, canvas.width - 40, 6);
      ctx.fillRect(20, 20, 6, canvas.height - 40);
      ctx.fillRect(canvas.width - 26, 20, 6, canvas.height - 40);
      ctx.fillRect(20, canvas.height - 26, canvas.width - 40, 6);

      // Interior dividing partition
      ctx.fillRect(180, 160, 4, 80);

      // Draw Desks & Computers
      const desks = [
        { x: 120, y: 90, label: 'DEV-01' },
        { x: 210, y: 90, label: 'PM-02' },
        { x: 300, y: 90, label: 'QA-03' },
        { x: 180, y: 180, label: 'LAB-04' },
      ];

      desks.forEach((desk) => {
        // Wooden desk surface
        ctx.fillStyle = '#475569';
        ctx.fillRect(desk.x, desk.y, 48, 28);
        ctx.strokeStyle = '#64748b';
        ctx.strokeRect(desk.x, desk.y, 48, 28);

        // Computer monitor with glowing screen
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(desk.x + 14, desk.y + 4, 20, 12);
        ctx.fillStyle = '#00f3ff';
        ctx.fillRect(desk.x + 16, desk.y + 6, 16, 8); // glowing cyan screen

        // Desk chair
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(desk.x + 24, desk.y + 36, 6, 0, Math.PI * 2);
        ctx.fill();
      });

      // Breakroom Coffee Machine & Water Cooler (bottom-left)
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(50, 190, 16, 26); // Water dispenser
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.arc(58, 190, 6, 0, Math.PI * 2);
      ctx.fill();

      // Meeting Couch / Lounge (bottom-right)
      ctx.fillStyle = '#7c3aed';
      ctx.fillRect(320, 190, 60, 22);
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(324, 194, 52, 14);

      // Potted plants in corners
      const plants = [{ x: 35, y: 35 }, { x: 380, y: 35 }, { x: 35, y: 220 }];
      plants.forEach((p) => {
        ctx.fillStyle = '#b45309'; // pot
        ctx.fillRect(p.x - 5, p.y + 2, 10, 8);
        ctx.fillStyle = '#10b981'; // green plant leaves
        ctx.beginPath();
        ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
        ctx.fill();
      });

      // Move & Draw Pixel Agents
      setAgents((prev) =>
        prev.map((agent) => {
          // Linear interpolation towards target
          const dx = agent.targetX - agent.x;
          const dy = agent.targetY - agent.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          let newX = agent.x;
          let newY = agent.y;

          if (dist > 1.5) {
            newX += (dx / dist) * 1.2;
            newY += (dy / dist) * 1.2;
          }

          // Draw Pixel Character Body
          // Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.beginPath();
          ctx.ellipse(newX, newY + 8, 8, 3, 0, 0, Math.PI * 2);
          ctx.fill();

          // Shirt / Body
          ctx.fillStyle = agent.color;
          ctx.fillRect(newX - 5, newY - 4, 10, 10);

          // Head (skin tone)
          ctx.fillStyle = '#fed7aa';
          ctx.fillRect(newX - 4, newY - 12, 8, 8);

          // Hair
          ctx.fillStyle = '#475569';
          ctx.fillRect(newX - 4, newY - 14, 8, 3);

          // Name Tag overhead
          ctx.font = '9px monospace';
          ctx.fillStyle = '#f8fafc';
          ctx.textAlign = 'center';
          ctx.fillText(`${agent.name}`, newX, newY - 17);

          // Active Speech Bubble
          if (activeSpeech && activeSpeech.agentId === agent.id) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(newX - 50, newY - 40, 100, 16);
            ctx.strokeStyle = '#00f3ff';
            ctx.lineWidth = 1;
            ctx.strokeRect(newX - 50, newY - 40, 100, 16);

            ctx.font = '8px sans-serif';
            ctx.fillStyle = '#0f172a';
            ctx.fillText(activeSpeech.text.slice(0, 18) + '...', newX, newY - 29);
          }

          return { ...agent, x: newX, y: newY };
        })
      );

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isNight, activeSpeech]);

  return (
    <div className="flex flex-col h-full bg-black/80 rounded-2xl border border-slate-800 backdrop-blur-md overflow-hidden shadow-2xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-950/80">
        <div className="flex items-center gap-2">
          <span className="font-orbitron font-bold text-xs tracking-wider text-white">
            AGENT TOWN
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
            SIMULATION ACTIVE
          </span>
        </div>

        {/* Right Tab Controls: agents, visual hub, gesture + Day/Night */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-lg border border-slate-800 font-mono text-[10px]">
            {(['agents', 'visual', 'gesture'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  sound.playBlip(900);
                  setActiveTab(tab);
                }}
                className={`px-2 py-0.5 rounded uppercase transition-all ${
                  activeTab === tab
                    ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'visual' ? 'visual hub' : tab}
              </button>
            ))}
          </div>

          {/* Day / Night Toggle Button */}
          <button
            onClick={() => {
              sound.playBlip(1100);
              setIsNight((prev) => !prev);
            }}
            className="p-1 rounded-md bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
            title={isNight ? 'Switch to Day Office' : 'Switch to Night Office'}
          >
            {isNight ? <Moon className="w-3.5 h-3.5 text-cyan-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Agents Roster Bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 border-b border-slate-900 text-[10px] font-mono overflow-x-auto scrollbar-none">
        {agents.map((ag) => (
          <button
            key={ag.id}
            onClick={() => {
              sound.playBlip(1000);
              setSelectedAgent(ag);
            }}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border whitespace-nowrap transition-all ${
              selectedAgent?.id === ag.id
                ? 'bg-slate-900 border-emerald-500 text-white font-bold'
                : 'bg-black/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ag.color }} />
            <span>{ag.name} ({ag.role})</span>
          </button>
        ))}
      </div>

      {/* Interactive 2D Canvas Area */}
      <div className="relative flex-1 w-full min-h-[190px] overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={440}
          height={240}
          className="w-full h-full object-cover cursor-crosshair"
          onClick={(e) => {
            sound.playChirp();
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = ((e.clientX - rect.left) / rect.width) * 440;
            const clickY = ((e.clientY - rect.top) / rect.height) * 240;
            if (selectedAgent) {
              setAgents((prev) =>
                prev.map((a) =>
                  a.id === selectedAgent.id ? { ...a, targetX: clickX, targetY: clickY } : a
                )
              );
            }
          }}
        />

        {/* Selected Agent Floating Status */}
        {selectedAgent && (
          <div className="absolute bottom-2 left-2 bg-black/85 px-2.5 py-1 rounded-md border border-slate-800 text-[10px] font-mono text-slate-300 pointer-events-none flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: selectedAgent.color }} />
            <span className="font-bold text-white">{selectedAgent.name}</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400">{selectedAgent.status}</span>
          </div>
        )}
      </div>
    </div>
  );
};
