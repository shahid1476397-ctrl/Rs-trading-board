import React, { useState, useRef, useEffect } from 'react';
import { HUDTheme, LogMessage, THEMES, UndoItem } from '../types/marklv';
import { Terminal, Send, RotateCcw, Shield, Mic, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { sound } from '../services/soundEffects';

interface LogTerminalProps {
  theme: HUDTheme;
  logs: LogMessage[];
  undoStack: UndoItem[];
  onSendMessage: (text: string) => void;
  onUndo: (undoItem: UndoItem) => void;
  onPushToTalk: () => void;
  isListening: boolean;
  onClearLogs: () => void;
}

export const LogTerminal: React.FC<LogTerminalProps> = ({
  theme,
  logs,
  undoStack,
  onSendMessage,
  onUndo,
  onPushToTalk,
  isListening,
  onClearLogs,
}) => {
  const [inputText, setInputText] = useState('');
  const logContainerRef = useRef<HTMLDivElement>(null);
  const themeColors = THEMES[theme];

  // Auto-scroll to bottom of logs on new entry
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sound.playBlip(1100);
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const renderBadge = (source: LogMessage['source'], type?: LogMessage['type']) => {
    let colorCls = 'text-cyan-400 bg-cyan-950/60 border-cyan-800';
    if (source === 'GEMINI') colorCls = 'text-amber-400 bg-amber-950/60 border-amber-800';
    if (source === 'USER') colorCls = 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
    if (source === 'SECURITY') colorCls = 'text-rose-400 bg-rose-950/60 border-rose-800';
    if (source === 'PROACTIVE') colorCls = 'text-purple-400 bg-purple-950/60 border-purple-800';

    return (
      <span className={`px-1.5 py-0.2 rounded border text-[9px] font-mono uppercase tracking-wider font-bold ${colorCls}`}>
        {source}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full bg-black/50 border border-slate-800/80 rounded-lg backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80 bg-slate-950/60 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5" style={{ color: themeColors.primary }} />
          <span className="font-bold text-slate-300 uppercase tracking-wider">
            Mark LV Tactical Log Stream
          </span>
          <span className="text-[10px] text-slate-500">[{logs.length} entries]</span>
        </div>

        <div className="flex items-center gap-2">
          {undoStack.length > 0 && (
            <button
              onClick={() => {
                sound.playBlip(800);
                onUndo(undoStack[undoStack.length - 1]);
              }}
              className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[11px] font-mono transition-all"
              title={`Undo: ${undoStack[undoStack.length - 1]?.title}`}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Undo Last</span>
            </button>
          )}

          <button
            onClick={onClearLogs}
            className="text-slate-500 hover:text-slate-300 text-[10px] px-1.5 py-0.5 rounded hover:bg-slate-900"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Log Entries Container */}
      <div
        ref={logContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-xs select-text scroll-smooth"
      >
        {logs.map((log) => {
          const associatedUndo = undoStack.find((u) => u.id === log.undoableId);

          return (
            <div
              key={log.id}
              className={`p-2 rounded border transition-all ${
                log.source === 'USER'
                  ? 'bg-emerald-950/15 border-emerald-900/40 text-slate-200'
                  : log.source === 'GEMINI'
                  ? 'bg-slate-900/40 border-slate-800/80 text-slate-100'
                  : log.source === 'SECURITY'
                  ? 'bg-rose-950/20 border-rose-900/50 text-rose-200'
                  : 'bg-black/40 border-slate-900 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                <div className="flex items-center gap-1.5">
                  {renderBadge(log.source, log.type)}
                  <span>{log.timestamp}</span>
                </div>

                {associatedUndo && (
                  <button
                    onClick={() => onUndo(associatedUndo)}
                    className="flex items-center gap-1 px-1.5 py-0.5 text-amber-400 hover:text-amber-300 bg-amber-950/50 rounded border border-amber-800 text-[9px]"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Revert</span>
                  </button>
                )}
              </div>

              <div className="leading-relaxed whitespace-pre-wrap font-sans text-xs">
                {log.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Command & Voice Bar */}
      <form
        onSubmit={handleSubmit}
        className="p-2 border-t border-slate-800/80 bg-slate-950 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={onPushToTalk}
          className={`p-2 rounded-lg border transition-all ${
            isListening
              ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-cyan-500'
          }`}
          title="Push to Talk or press Space"
        >
          <Mic className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter command for Mark LV (e.g. 'Status report', 'Scan webcam', 'Set theme to gold')..."
          className="flex-1 px-3 py-2 bg-black border border-slate-800 rounded font-mono text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
        />

        <button
          type="submit"
          className="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono text-xs rounded flex items-center gap-1 transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">SEND</span>
        </button>
      </form>
    </div>
  );
};
