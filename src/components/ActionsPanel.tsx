import React, { useState } from 'react';
import { ActionDefinition, HUDTheme, THEMES } from '../types/marklv';
import {
  Search,
  CloudSun,
  Sliders,
  Terminal,
  FolderOpen,
  FileText,
  MessageSquare,
  MonitorCheck,
  BellRing,
  Globe,
  Radio,
  Eye,
  Shield,
  Layers,
  Play,
  RotateCcw,
} from 'lucide-react';
import { sound } from '../services/soundEffects';

interface ActionsPanelProps {
  theme: HUDTheme;
  onExecuteAction: (actionId: string, params?: any) => void;
}

export const BUNDLED_ACTIONS: ActionDefinition[] = [
  {
    id: 'web_search',
    name: 'Web Intelligence',
    category: 'intelligence',
    description: 'Parallel search across Google & DDG news, research, price & comparisons.',
    pyFile: 'actions/web_search.py',
    icon: 'Search',
  },
  {
    id: 'weather_report',
    name: 'Atmospheric Radar',
    category: 'intelligence',
    description: 'Live meteorological telemetry, barometric pressure, wind, and forecast.',
    pyFile: 'actions/weather_report.py',
    icon: 'CloudSun',
  },
  {
    id: 'computer_settings',
    name: 'Hardware Settings',
    category: 'control',
    description: 'Volume level, display brightness, WiFi adapter, power state calibration.',
    pyFile: 'actions/computer_settings.py',
    icon: 'Sliders',
  },
  {
    id: 'computer_control',
    name: 'Shortcuts & Windows',
    category: 'control',
    description: 'OS window layout tiling, global hotkey hooks, mouse chords, and process switcher.',
    pyFile: 'actions/computer_control.py',
    icon: 'Terminal',
  },
  {
    id: 'file_controller',
    name: 'File Controller',
    category: 'system',
    description: 'Filesystem directory explorer, virtual drives, disk quotas, and permissions.',
    pyFile: 'actions/file_controller.py',
    icon: 'FolderOpen',
  },
  {
    id: 'file_processor',
    name: 'Document Intelligence',
    category: 'intelligence',
    description: 'Document parser, OCR text extraction, PDF summarizer, code analysis.',
    pyFile: 'actions/file_processor.py',
    icon: 'FileText',
  },
  {
    id: 'send_message',
    name: 'Comms Dispatcher',
    category: 'control',
    description: 'Encrypted message relay for Slack, Discord, Signal, and tactical SMS.',
    pyFile: 'actions/send_message.py',
    icon: 'MessageSquare',
  },
  {
    id: 'proactive',
    name: 'Proactive 2.0',
    category: 'system',
    description: 'Time, context & fatigue aware check-ins, automated posture & focus nudges.',
    pyFile: 'actions/proactive.py',
    icon: 'BellRing',
  },
  {
    id: 'browser_control',
    name: 'Browser Automation',
    category: 'control',
    description: 'Tab management, URL dispatch, DOM reader, and web automation.',
    pyFile: 'actions/browser_control.py',
    icon: 'Globe',
  },
  {
    id: 'background_monitor',
    name: 'Topic Monitor',
    category: 'intelligence',
    description: 'Periodic background intelligence crawler for selected topics.',
    pyFile: 'actions/background_monitor.py',
    icon: 'Radio',
  },
  {
    id: 'core_purge',
    name: 'Security Purge Core',
    category: 'system',
    description: 'High-risk security action requiring cryptographic UI confirmation token.',
    pyFile: 'core/confirm.py',
    icon: 'Shield',
    requiresConfirm: true,
  },
];

export const ActionsPanel: React.FC<ActionsPanelProps> = ({
  theme,
  onExecuteAction,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [activeModalAction, setActiveModalAction] = useState<ActionDefinition | null>(null);
  const [actionInput, setActionInput] = useState<string>('');

  const themeColors = THEMES[theme];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Search': return <Search className="w-4 h-4" />;
      case 'CloudSun': return <CloudSun className="w-4 h-4" />;
      case 'Sliders': return <Sliders className="w-4 h-4" />;
      case 'Terminal': return <Terminal className="w-4 h-4" />;
      case 'FolderOpen': return <FolderOpen className="w-4 h-4" />;
      case 'FileText': return <FileText className="w-4 h-4" />;
      case 'MessageSquare': return <MessageSquare className="w-4 h-4" />;
      case 'BellRing': return <BellRing className="w-4 h-4" />;
      case 'Globe': return <Globe className="w-4 h-4" />;
      case 'Radio': return <Radio className="w-4 h-4" />;
      case 'Shield': return <Shield className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  const filtered = BUNDLED_ACTIONS.filter((act) => {
    if (selectedCategory !== 'all' && act.category !== selectedCategory) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      return (
        act.name.toLowerCase().includes(q) ||
        act.description.toLowerCase().includes(q) ||
        act.pyFile.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleActionClick = (action: ActionDefinition) => {
    sound.playBlip(1400);
    setActiveModalAction(action);
    setActionInput('');
  };

  const handleConfirmRun = () => {
    if (!activeModalAction) return;
    sound.playExecuteSuccess();
    onExecuteAction(activeModalAction.id, { input: actionInput });
    setActiveModalAction(null);
  };

  return (
    <div className="flex flex-col gap-3 p-3 bg-black/40 border border-slate-800/80 rounded-lg backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4" style={{ color: themeColors.primary }} />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            Tactical Action Dispatcher (actions/)
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          {BUNDLED_ACTIONS.length} BUNDLED SKILLS
        </span>
      </div>

      {/* Category Tabs & Filter */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {['all', 'intelligence', 'control', 'system'].map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              sound.playBlip(900);
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider border transition-all ${
              selectedCategory === cat
                ? 'bg-slate-800 text-white font-semibold'
                : 'bg-black/40 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            style={{
              borderColor: selectedCategory === cat ? themeColors.primary : undefined,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
        {filtered.map((action) => {
          return (
            <div
              key={action.id}
              onClick={() => handleActionClick(action)}
              className="p-2.5 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between gap-1.5 bg-black/50 border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-900/60"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="p-1 rounded bg-slate-900 border border-slate-800"
                    style={{ color: themeColors.primary }}
                  >
                    {getIcon(action.icon)}
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {action.name}
                  </span>
                </div>
                {action.requiresConfirm && (
                  <span className="px-1.5 py-0.2 text-[9px] font-mono bg-rose-950/80 text-rose-400 border border-rose-800 rounded">
                    GATE
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {action.description}
              </p>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-900">
                <span className="truncate max-w-[120px]">{action.pyFile}</span>
                <span className="flex items-center gap-0.5 text-cyan-400 font-semibold">
                  <Play className="w-2.5 h-2.5" /> RUN
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Input / Parameter Modal */}
      {activeModalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-950 border border-cyan-500/50 rounded-lg p-4 shadow-2xl flex flex-col gap-3 relative hud-bracket">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-slate-900 border border-slate-800 text-cyan-400">
                  {getIcon(activeModalAction.icon)}
                </div>
                <div>
                  <h3 className="text-sm font-mono font-bold text-white uppercase">
                    Dispatch: {activeModalAction.name}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">
                    Target: {activeModalAction.pyFile}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveModalAction(null)}
                className="text-slate-500 hover:text-white font-mono text-sm px-2"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              {activeModalAction.description}
            </p>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Execution Arguments / Prompt:
              </label>
              <input
                type="text"
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
                placeholder={
                  activeModalAction.id === 'web_search'
                    ? 'e.g., Quantum computing breakthroughs 2026'
                    : activeModalAction.id === 'weather_report'
                    ? 'e.g., New York, Tokyo, London (or leave blank)'
                    : 'Enter directive parameters...'
                }
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleConfirmRun()}
                className="w-full px-3 py-2 bg-black border border-slate-800 rounded font-mono text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setActiveModalAction(null)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded font-mono text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRun}
                className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono text-xs rounded flex items-center gap-1.5"
              >
                <Play className="w-3 h-3" />
                <span>Execute Skill</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
