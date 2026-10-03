import React, { useState, useRef, useEffect } from 'react';
import { ARCHER_THEMES, ArcherChatMessage, ArcherTheme, ArcherThemeId } from '../types/archer';
import { ThinkingChainDisplay } from './ThinkingChainDisplay';
import { sound } from '../services/soundEffects';
import {
  Mic,
  Send,
  Volume2,
  ChevronDown,
  Check,
  Settings,
  Sparkles,
  Bot,
  User,
  Radio,
  FileText,
  Users2,
} from 'lucide-react';

interface RightVoicePanelProps {
  theme: ArcherTheme;
  onSelectTheme: (themeId: ArcherThemeId) => void;
  messages: ArcherChatMessage[];
  isThinking: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  liveTranscription?: string;
  onSendMessage: (text: string) => void;
  onToggleMic: () => void;
  onSpeakText?: (text: string) => void;
}

export const RightVoicePanel: React.FC<RightVoicePanelProps> = ({
  theme,
  onSelectTheme,
  messages,
  isThinking,
  isListening,
  isSpeaking,
  liveTranscription,
  onSendMessage,
  onToggleMic,
  onSpeakText,
}) => {
  const [activeTab, setActiveTab] = useState<'VOICE' | 'AGENT' | 'NOTES'>('VOICE');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="flex flex-col h-full bg-black/85 rounded-2xl border border-slate-800 backdrop-blur-md overflow-hidden shadow-2xl relative">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-950/90">
        {/* Navigation Tabs: VOICE, AGENT, NOTES */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          {(['VOICE', 'AGENT', 'NOTES'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                sound.playBlip(900);
                setActiveTab(tab);
              }}
              className={`px-3 py-1 rounded-md font-bold tracking-wider transition-all ${
                activeTab === tab
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Theme Selector Dropdown (Archer Legacy, Neon Void, Solar Amber, Electric Cyan, Crimson Neon) */}
        <div className="relative">
          <button
            onClick={() => {
              sound.playBlip(1000);
              setIsThemeMenuOpen((prev) => !prev);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono hover:border-slate-500 transition-all"
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: theme.orbColorHex }}
            />
            <span className="hidden sm:inline font-bold">{theme.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Theme Dropdown Menu */}
          {isThemeMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 font-mono text-xs flex flex-col gap-1">
              <span className="px-2 py-1 text-[10px] text-slate-500 uppercase font-bold">
                Orb Aura Themes
              </span>
              {(Object.keys(ARCHER_THEMES) as ArcherThemeId[]).map((thmId) => {
                const thm = ARCHER_THEMES[thmId];
                const isSelected = theme.id === thmId;
                return (
                  <button
                    key={thmId}
                    onClick={() => {
                      sound.playExecuteSuccess();
                      onSelectTheme(thmId);
                      setIsThemeMenuOpen(false);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-slate-800 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: thm.orbColorHex }}
                      />
                      <span>{thm.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area based on Tab */}
      {activeTab === 'VOICE' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages & Thinking Flow */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                {/* User Message */}
                {msg.role === 'user' ? (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] p-3 rounded-2xl bg-cyan-950/60 border border-cyan-800 text-cyan-100 shadow-md">
                      <div className="flex items-center justify-between text-[10px] text-cyan-400 font-mono mb-1">
                        <span>YOU</span>
                        <span>{msg.time}</span>
                      </div>
                      <div className="text-sm leading-relaxed">{msg.text}</div>
                    </div>
                  </div>
                ) : (
                  /* Assistant Response with Thinking Chain */
                  <div className="space-y-2">
                    {/* Collapsible / Visual Thinking Steps */}
                    {msg.thinking && (
                      <ThinkingChainDisplay thinking={msg.thinking} />
                    )}

                    {/* Final Natural Spoken Response Bubble */}
                    <div className="max-w-[95%] p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-100 shadow-lg">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: theme.orbColorHex }}
                          />
                          <span className="font-bold text-white">ARCHER AI</span>
                          {isSpeaking && (
                            <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[9px] animate-pulse">
                              Speaking...
                            </span>
                          )}
                        </div>
                        <span>{msg.time}</span>
                      </div>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                        {msg.text}
                      </div>

                      {/* Explicit Listen in Voice Button */}
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            sound.playBlip(1100);
                            if (onSpeakText) onSpeakText(msg.text);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-[11px] font-mono flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                          title="Listen to this response in voice"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Listen in Voice</span>
                        </button>

                        <span className="text-[10px] text-slate-500 font-mono">
                          ENGLISH VOICE
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Live Thinking Status */}
            {isThinking && (
              <ThinkingChainDisplay
                isStreaming={true}
                thinking={{
                  assessing: 'Analyzing inquiry directly without repetition...',
                  clarifying: 'Formulating direct, informative answer...',
                }}
              />
            )}

            {/* Live Real-Time Speech Transcription Bubble */}
            {isListening && (
              <div className="p-3 bg-rose-950/70 border border-rose-600/80 rounded-2xl text-xs text-rose-200 shadow-xl animate-pulse">
                <div className="flex items-center gap-2 text-[10px] font-mono text-rose-400 mb-1">
                  <Mic className="w-3.5 h-3.5 animate-bounce" />
                  <span className="font-bold uppercase">LIVE LISTENING:</span>
                </div>
                <div className="text-sm font-sans italic">
                  {liveTranscription || 'Listening... your speech is transcribed here in real-time...'}
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Bottom Live Input Bar */}
          <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
            <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message or speak commands live..."
                className="flex-1 px-4 py-2.5 bg-black border border-slate-800 rounded-xl text-xs font-sans text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />

              {/* Mic Button */}
              <button
                type="button"
                onClick={onToggleMic}
                className={`p-2.5 rounded-xl border transition-all ${
                  isListening
                    ? 'bg-rose-600 border-rose-400 text-white animate-pulse shadow-lg shadow-rose-900'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
                }`}
                title="Voice Input"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold disabled:opacity-40 transition-all shadow-md shadow-cyan-950"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AGENT TAB */}
      {activeTab === 'AGENT' && (
        <div className="flex-1 p-4 space-y-3 font-mono text-xs overflow-y-auto">
          <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase text-[11px]">
            <Users2 className="w-4 h-4" />
            <span>Autonomous Agent Fleet</span>
          </div>
          <p className="text-slate-400 text-xs font-sans">
            Archer AI orchestrates multi-agent desktop routines, background topic crawls, and automated browser tasks.
          </p>

          <div className="space-y-2">
            {[
              { name: 'Browser Pilot Agent', status: 'Listening on port 9222', state: 'READY' },
              { name: 'File Intelligence Agent', status: 'Monitoring local workspace', state: 'ACTIVE' },
              { name: 'Memory Consolidation Agent', status: 'Synced with Master Prompt bank', state: 'IDLE' },
              { name: 'Vision OCR Processor', status: 'Continuous screen observer', state: 'STANDBY' },
            ].map((ag, i) => (
              <div key={i} className="p-3 bg-black/60 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">{ag.name}</div>
                  <div className="text-[10px] text-slate-500">{ag.status}</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-bold">
                  {ag.state}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NOTES TAB */}
      {activeTab === 'NOTES' && (
        <div className="flex-1 p-4 space-y-3 font-mono text-xs overflow-y-auto">
          <div className="flex items-center gap-2 text-amber-400 font-bold uppercase text-[11px]">
            <FileText className="w-4 h-4" />
            <span>Mission Notes & Quick Directives</span>
          </div>

          <div className="p-3 rounded-xl bg-black/60 border border-slate-800 space-y-2 text-slate-300 font-sans text-xs">
            <p><strong>Master Prompt Voice Rules:</strong></p>
            <ul className="list-disc pl-4 space-y-1 text-slate-400">
              <li>Natural human-like tone without AI robotic clichés.</li>
              <li>Thinks before speaking: Assessing → Clarifying → Natural reply.</li>
              <li>Multi-language: Urdu, Hindi, English, and Roman mix.</li>
              <li>Seamless 3D Earth and Desktop control.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
