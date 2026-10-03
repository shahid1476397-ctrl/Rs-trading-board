import React, { useState } from 'react';
import { HUDTheme, THEMES } from '../types/marklv';
import {
  FileCode2,
  Folder,
  FolderOpen,
  Copy,
  Check,
  Download,
  Search,
  ExternalLink,
} from 'lucide-react';
import { sound } from '../services/soundEffects';

interface CodeExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: HUDTheme;
}

interface FileTreeItem {
  path: string;
  name: string;
  type: 'file' | 'dir';
  description: string;
  content?: string;
  children?: FileTreeItem[];
}

const MARK_LV_REPO: FileTreeItem[] = [
  {
    path: 'main.py',
    name: 'main.py',
    type: 'file',
    description: 'Core loop — Gemini Live session, audio I/O, viseme extraction, tool dispatch',
    content: `"""
Mark LV — Core Orchestrator
Initializes Gemini Live WebSocket / Bidirectional session, microphone/speaker pipeline,
real-time viseme stream extraction, and action tool dispatch.
"""
import sys
import asyncio
from PyQt6.QtWidgets import QApplication
from ui import MarkLVHUD
from core.gemini import GeminiLiveSession
from core.action_loader import ActionDispatcher
from core.viseme import VisemeExtractor
from memory.config_manager import ConfigManager

async def run_system():
    config = ConfigManager.load()
    dispatcher = ActionDispatcher()
    viseme_engine = VisemeExtractor()
    
    app = QApplication(sys.argv)
    hud = MarkLVHUD(config=config, dispatcher=dispatcher)
    hud.show()
    
    session = GeminiLiveSession(
        api_key=config.api_key,
        model="gemini-2.5-flash",
        on_audio=hud.waveform.feed_pcm,
        on_viseme=hud.avatar.set_viseme,
        tool_handler=dispatcher.dispatch
    )
    await session.connect()
    app.exec()

if __name__ == "__main__":
    asyncio.run(run_system())
`,
  },
  {
    path: 'ui.py',
    name: 'ui.py',
    type: 'file',
    description: 'PyQt6 HUD — avatar canvas, waveform, log panel, settings drawer, camera feed',
    content: `"""
Mark LV — PyQt6 Holographic HUD
Assembles QPainter 3D avatar viewport, audio waveform oscilloscope,
collapsible settings drawer, log panel, and screen processor overlay.
"""
from PyQt6.QtWidgets import QMainWindow, QWidget, QHBoxLayout, QVBoxLayout
from PyQt6.QtCore import Qt, QTimer
from core.avatar import HolographicAvatarCanvas
from core.viseme import VisemeWidget

class MarkLVHUD(QMainWindow):
    def __init__(self, config, dispatcher):
        super().__init__()
        self.setWindowTitle("Mark LV // Tactical AI HUD")
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.setWindowFlags(Qt.WindowType.FramelessWindowHint | Qt.WindowType.WindowStaysOnTopHint)
        self.config = config
        self.dispatcher = dispatcher
        self._init_layout()

    def _init_layout(self):
        central = QWidget()
        layout = QHBoxLayout(central)
        self.avatar = HolographicAvatarCanvas(theme=self.config.theme)
        layout.addWidget(self.avatar, stretch=3)
        self.setCentralWidget(central)
`,
  },
  {
    path: 'core/confirm.py',
    name: 'core/confirm.py',
    type: 'file',
    description: 'Irreversible-action gate — the token is issued by the UI, not the model',
    content: `"""
Mark LV — Security Confirmation Gate
Guarantees that dangerous/irreversible operations cannot be hallucinated
or auto-executed by LLM tokens without UI cryptographic token clearance.
"""
import secrets

class IrreversibleSecurityGate:
    def __init__(self):
        self._active_tokens = {}

    def issue_challenge(self, action_id, params):
        token = secrets.token_hex(3).upper()  # 6-char hex
        self._active_tokens[token] = {"action_id": action_id, "params": params}
        return token

    def verify_token(self, token, entered_token):
        if entered_token.strip().upper() == token and token in self._active_tokens:
            payload = self._active_tokens.pop(token)
            return True, payload
        return False, None
`,
  },
  {
    path: 'core/undo.py',
    name: 'core/undo.py',
    type: 'file',
    description: 'One shared undo stack — actions register how to reverse themselves',
    content: `"""
Mark LV — Shared Undo Stack
Actions register reversal inverse hooks before mutating computer state.
"""
class UndoStack:
    def __init__(self):
        self.stack = []

    def push(self, action_id, title, revert_fn, state_data):
        self.stack.append({
            "action_id": action_id,
            "title": title,
            "revert_fn": revert_fn,
            "state_data": state_data
        })

    def pop_and_revert(self):
        if not self.stack:
            return None
        item = self.stack.pop()
        item["revert_fn"](item["state_data"])
        return item["title"]
`,
  },
  {
    path: 'actions/web_search.py',
    name: 'actions/web_search.py',
    type: 'file',
    description: 'Gemini + DDG parallel search (news, research, price, compare)',
    content: `"""
Mark LV Skill — actions/web_search.py
Executes fast concurrent search via DuckDuckGo HTML & Google Gemini Search Grounding.
"""
TOOL = {
    "name": "web_search",
    "description": "Searches real-time web intelligence across news, academic papers, and pricing.",
    "parameters": {
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "Search query keywords"},
            "intent": {"type": "string", "enum": ["general", "news", "price", "research"]}
        },
        "required": ["query"]
    }
}

async def handler(params):
    query = params.get("query")
    # Parallel query execution logic
    return f"Intelligence harvest completed for: {query}"
`,
  },
  {
    path: 'plugins/_template.py',
    name: 'plugins/_template.py',
    type: 'file',
    description: 'Copy this to write a new skill — one file, drop in, done',
    content: `"""
Mark LV Skill Plugin Template
Copy this file into plugins/your_skill.py — Mark LV auto-discovers and registers it.
"""
TOOL = {
    "name": "my_custom_skill",
    "description": "Explains to Mark LV what this tool does and when to call it.",
    "parameters": {
        "type": "object",
        "properties": {
            "target": {"type": "string", "description": "Primary argument"}
        },
        "required": ["target"]
    }
}

def handler(params):
    target = params.get("target")
    # Implement custom logic here...
    return f"Executed successfully with {target}"
`,
  },
];

export const CodeExplorerModal: React.FC<CodeExplorerModalProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  const [selectedFile, setSelectedFile] = useState<FileTreeItem>(MARK_LV_REPO[0]);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const themeColors = THEMES[theme];

  const handleCopyCode = () => {
    if (selectedFile.content) {
      sound.playExecuteSuccess();
      navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredFiles = MARK_LV_REPO.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-4xl h-[82vh] bg-slate-950 border border-cyan-500/40 rounded-xl shadow-2xl flex flex-col overflow-hidden relative hud-bracket">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-black/60">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              Mark LV System Source Code & Architecture Inspector
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playBlip(700);
              onClose();
            }}
            className="text-slate-400 hover:text-white font-mono px-2 py-1 rounded"
          >
            ✕
          </button>
        </div>

        {/* Content Body: Sidebar Tree + Code Preview */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left File Tree Sidebar */}
          <div className="w-64 sm:w-72 border-r border-slate-800 bg-black/40 flex flex-col">
            <div className="p-2 border-b border-slate-800">
              <div className="flex items-center gap-2 px-2 py-1 bg-black border border-slate-800 rounded">
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter files..."
                  className="w-full bg-transparent font-mono text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-xs">
              <div className="px-2 py-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Mark LV Repository
              </div>
              {filteredFiles.map((file) => (
                <button
                  key={file.path}
                  onClick={() => {
                    sound.playBlip(1100);
                    setSelectedFile(file);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded flex flex-col gap-0.5 transition-all ${
                    selectedFile.path === file.path
                      ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/80 font-bold'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode2 className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 line-clamp-1">
                    {file.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Code Viewport */}
          <div className="flex-1 flex flex-col bg-slate-950">
            {/* File Path Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-black/40 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">File:</span>
                <span className="text-cyan-400 font-bold">{selectedFile.path}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded text-xs transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Python'}</span>
                </button>
              </div>
            </div>

            {/* Code Block */}
            <div className="flex-1 overflow-auto p-4 bg-black/90 font-mono text-xs text-slate-300 select-text leading-relaxed">
              <pre className="text-emerald-400/90 whitespace-pre">
                {selectedFile.content}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
