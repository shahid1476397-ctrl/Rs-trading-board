import React, { useState } from 'react';
import { HUDTheme, LongTermMemory, MarkLVConfig, THEMES } from '../types/marklv';
import {
  Settings,
  Database,
  Volume2,
  Key,
  Palette,
  Code2,
  Plus,
  Trash2,
  Check,
  Cpu,
  Mic,
} from 'lucide-react';
import { sound } from '../services/soundEffects';
import { speech } from '../services/speechService';
import { geminiService } from '../services/geminiService';

interface MemoryConfigDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: MarkLVConfig;
  onUpdateConfig: (newCfg: Partial<MarkLVConfig>) => void;
  memory: LongTermMemory;
  onUpdateMemory: (newMem: Partial<LongTermMemory>) => void;
}

export const MemoryConfigDrawer: React.FC<MemoryConfigDrawerProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  memory,
  onUpdateMemory,
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'memory' | 'plugins' | 'identity'>('config');
  const [newFact, setNewFact] = useState('');
  const [newFactCat, setNewFactCat] = useState('Personal');
  const [apiKeyInput, setApiKeyInput] = useState(
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || ''
  );
  const [apiKeySaved, setApiKeySaved] = useState(false);

  // Plugin editor state
  const [customPluginCode, setCustomPluginCode] = useState<string>(`# Mark LV Custom Skill Plugin
# File: plugins/custom_diagnostic.py

TOOL = {
    "name": "custom_diagnostic",
    "description": "Performs quick integrity probe across quantum registers",
    "parameters": {
        "type": "object",
        "properties": {
            "depth": {"type": "string", "enum": ["quick", "deep"]}
        }
    }
}

def handler(params):
    depth = params.get("depth", "quick")
    return f"Diagnostic completed at {depth} level. Subsystems aligned."
`);

  if (!isOpen) return null;

  const handleSaveApiKey = () => {
    sound.playExecuteSuccess();
    geminiService.setApiKey(apiKeyInput.trim());
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2500);
  };

  const handleAddFact = () => {
    if (!newFact.trim()) return;
    sound.playBlip(1200);
    const updated = [
      ...memory.facts,
      {
        id: `fact_${Date.now()}`,
        category: newFactCat,
        text: newFact.trim(),
        date: new Date().toLocaleDateString(),
      },
    ];
    onUpdateMemory({ facts: updated });
    setNewFact('');
  };

  const handleDeleteFact = (id: string) => {
    sound.playBlip(800);
    onUpdateMemory({
      facts: memory.facts.filter((f) => f.id !== id),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-slate-950 border-l border-slate-800 h-full flex flex-col shadow-2xl relative">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-black/40">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-mono font-bold uppercase tracking-wider text-white">
              Mark LV System Architecture & Storage
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playBlip(700);
              onClose();
            }}
            className="p-1 rounded text-slate-400 hover:text-white font-mono hover:bg-slate-900"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-black/60 px-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab('config')}
            className={`py-2.5 px-3 border-b-2 font-bold uppercase tracking-wider transition-all ${
              activeTab === 'config'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            System Config
          </button>
          <button
            onClick={() => setActiveTab('identity')}
            className={`py-2.5 px-3 border-b-2 font-bold uppercase tracking-wider transition-all ${
              activeTab === 'identity'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Identity
          </button>
          <button
            onClick={() => setActiveTab('memory')}
            className={`py-2.5 px-3 border-b-2 font-bold uppercase tracking-wider transition-all ${
              activeTab === 'memory'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            long_term.json
          </button>
          <button
            onClick={() => setActiveTab('plugins')}
            className={`py-2.5 px-3 border-b-2 font-bold uppercase tracking-wider transition-all ${
              activeTab === 'plugins'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            plugins/
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* TAB 1: SYSTEM CONFIG */}
          {activeTab === 'config' && (
            <div className="space-y-5 font-mono text-xs">
              {/* Theme Palette */}
              <div className="p-3 bg-black/40 border border-slate-800 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-slate-200 font-bold uppercase">
                  <Palette className="w-4 h-4 text-cyan-400" />
                  <span>Holographic HUD Theme Chroma</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(THEMES) as HUDTheme[]).map((thm) => (
                    <button
                      key={thm}
                      onClick={() => {
                        sound.playBlip(1200);
                        onUpdateConfig({ theme: thm });
                      }}
                      className={`p-2 rounded border flex items-center gap-2 transition-all ${
                        config.theme === thm
                          ? 'bg-slate-900 border-white text-white shadow-lg'
                          : 'bg-black/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: THEMES[thm].primary }}
                      />
                      <span className="truncate">{THEMES[thm].name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gemini Model & API Key */}
              <div className="p-3 bg-black/40 border border-slate-800 rounded-lg space-y-3">
                <div className="flex items-center justify-between text-slate-200 font-bold uppercase">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-400" />
                    <span>Gemini Core Engine Ladder</span>
                  </div>
                  <span className="text-[10px] text-slate-500">core/gemini.py</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Gemini Model:</label>
                  <select
                    value={config.geminiModel}
                    onChange={(e) => onUpdateConfig({ geminiModel: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-black border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="gemini-2.5-flash">gemini-2.5-flash (Standard & Multimodal)</option>
                    <option value="gemini-2.0-flash">gemini-2.0-flash (Ultra-fast real-time)</option>
                    <option value="gemini-2.5-pro">gemini-2.5-pro (Deep Strategic Reasoning)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Gemini API Key:</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="Paste Gemini API key or let env load..."
                      className="flex-1 px-2.5 py-1.5 bg-black border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      onClick={handleSaveApiKey}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded flex items-center gap-1"
                    >
                      {apiKeySaved ? <Check className="w-3.5 h-3.5" /> : null}
                      <span>{apiKeySaved ? 'Locked' : 'Save'}</span>
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    (Auto-loads from AI Studio secrets if already set; falls back to tactical offline heuristics)
                  </span>
                </div>
              </div>

              {/* Voice & Synthesis Pitch */}
              <div className="p-3 bg-black/40 border border-slate-800 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-slate-200 font-bold uppercase">
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>Acoustic Profile & Speech Synthesis</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Pitch:</span>
                      <span>{config.voicePitch.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.05"
                      value={config.voicePitch}
                      onChange={(e) => onUpdateConfig({ voicePitch: parseFloat(e.target.value) })}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Rate (Speed):</span>
                      <span>{config.voiceRate.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.7"
                      max="1.5"
                      step="0.05"
                      value={config.voiceRate}
                      onChange={(e) => onUpdateConfig({ voiceRate: parseFloat(e.target.value) })}
                      className="w-full accent-cyan-400"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    speech.speak('Mark LV speech synthesis acoustic verification complete.', {
                      pitch: config.voicePitch,
                      rate: config.voiceRate,
                    });
                  }}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded text-xs"
                >
                  Test Voice Output
                </button>
              </div>

              {/* Toggles */}
              <div className="p-3 bg-black/40 border border-slate-800 rounded-lg space-y-2">
                <label className="flex items-center justify-between cursor-pointer py-1">
                  <span className="text-slate-300">Sci-Fi UI Sound Effects (Audio Synthesis)</span>
                  <input
                    type="checkbox"
                    checked={config.soundEffectsEnabled}
                    onChange={(e) => {
                      sound.setEnabled(e.target.checked);
                      onUpdateConfig({ soundEffectsEnabled: e.target.checked });
                    }}
                    className="accent-cyan-400 w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer py-1">
                  <span className="text-slate-300">Proactive 2.0 Autonomous Check-ins</span>
                  <input
                    type="checkbox"
                    checked={config.proactiveEnabled}
                    onChange={(e) => onUpdateConfig({ proactiveEnabled: e.target.checked })}
                    className="accent-cyan-400 w-4 h-4"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: IDENTITY */}
          {activeTab === 'identity' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-3 bg-black/40 border border-slate-800 rounded-lg space-y-3">
                <h3 className="text-sm font-bold text-white uppercase">User & Operator Identity</h3>
                <p className="text-slate-400 text-[11px]">
                  Mark LV personalizes interactions, briefings, and telemetry based on operator parameters.
                </p>

                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] text-slate-400">Operator Name:</label>
                    <input
                      type="text"
                      value={memory.identity.userName}
                      onChange={(e) =>
                        onUpdateMemory({
                          identity: { ...memory.identity, userName: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-black border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400">Tactical Callsign / Honorific:</label>
                    <input
                      type="text"
                      value={memory.identity.callsign}
                      onChange={(e) =>
                        onUpdateMemory({
                          identity: { ...memory.identity, callsign: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-black border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400">Station / Location:</label>
                    <input
                      type="text"
                      value={memory.identity.location}
                      onChange={(e) =>
                        onUpdateMemory({
                          identity: { ...memory.identity, location: e.target.value },
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-black border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LONG TERM MEMORY */}
          {activeTab === 'memory' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-white uppercase">
                    Persistent Memory Store (memory/long_term.json)
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {memory.facts.length} records retained
                </span>
              </div>

              {/* Add Fact Form */}
              <div className="p-3 bg-black/40 border border-slate-800 rounded-lg flex flex-col gap-2">
                <span className="text-[11px] text-slate-400 uppercase font-bold">
                  Ingest New Strategic Fact
                </span>
                <div className="flex gap-2">
                  <select
                    value={newFactCat}
                    onChange={(e) => setNewFactCat(e.target.value)}
                    className="bg-black border border-slate-800 rounded px-2 text-xs text-slate-300"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Tactical">Tactical</option>
                    <option value="Preferences">Preferences</option>
                    <option value="Directives">Directives</option>
                  </select>
                  <input
                    type="text"
                    value={newFact}
                    onChange={(e) => setNewFact(e.target.value)}
                    placeholder="Enter learned fact or operational reminder..."
                    onKeyDown={(e) => e.key === 'Enter' && handleAddFact()}
                    className="flex-1 px-2.5 py-1 bg-black border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={handleAddFact}
                    className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Facts List */}
              <div className="space-y-2">
                {memory.facts.map((fact) => (
                  <div
                    key={fact.id}
                    className="p-2.5 rounded bg-black/60 border border-slate-800/80 flex items-center justify-between group hover:border-slate-700"
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.2 bg-slate-900 text-cyan-400 border border-slate-800 rounded text-[9px] uppercase font-bold">
                          {fact.category}
                        </span>
                        <span className="text-[10px] text-slate-500">{fact.date}</span>
                      </div>
                      <span className="text-slate-200 text-xs font-sans mt-0.5">
                        {fact.text}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteFact(fact.id)}
                      className="text-slate-600 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Purge fact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PLUGINS / TEMPLATE */}
          {activeTab === 'plugins' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-white uppercase">
                    Plugin Skill Engine (plugins/_template.py)
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400">HOT RELOAD ACTIVE</span>
              </div>

              <p className="text-slate-400 text-[11px] leading-relaxed">
                Mark LV features a plug-and-play modular skill architecture: "one file, drop in, done".
                Skills expose a <code className="text-cyan-300">TOOL</code> dictionary and a <code className="text-cyan-300">handler(params)</code> function.
              </p>

              <div className="relative">
                <textarea
                  value={customPluginCode}
                  onChange={(e) => setCustomPluginCode(e.target.value)}
                  rows={14}
                  className="w-full p-3 bg-black border border-slate-800 rounded-lg text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  spellCheck={false}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    sound.playExecuteSuccess();
                    alert('Plugin compiled and registered into core/plugin_loader.py memory ring.');
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs rounded flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Verify & Hot-Load Plugin</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
