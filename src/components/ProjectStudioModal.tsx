import React, { useState } from 'react';
import { BuiltProject, memory } from '../services/memoryService';
import { websiteBuilder } from '../services/websiteBuilderService';
import {
  X,
  Play,
  Code,
  Smartphone,
  Tablet,
  Monitor,
  Download,
  Sparkles,
  RefreshCw,
  FolderKanban,
  Check,
} from 'lucide-react';
import { sound } from '../services/soundEffects';

interface ProjectStudioModalProps {
  isOpen: boolean;
  project: BuiltProject | null;
  onClose: () => void;
  onProjectUpdated: (proj: BuiltProject) => void;
}

export const ProjectStudioModal: React.FC<ProjectStudioModalProps> = ({
  isOpen,
  project,
  onClose,
  onProjectUpdated,
}) => {
  if (!isOpen || !project) return null;

  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'projects'>('preview');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [promptChange, setPromptChange] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleApplyChanges = () => {
    if (!promptChange.trim() || isBuilding) return;
    sound.playExecuteSuccess();
    setIsBuilding(true);

    setTimeout(() => {
      const updated = websiteBuilder.generateWebsite(promptChange, project);
      onProjectUpdated(updated);
      setIsBuilding(false);
      setPromptChange('');
    }, 600);
  };

  const handleDownload = () => {
    sound.playBlip(1200);
    const blob = new Blob([project.htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}-v${project.version}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(project.htmlCode);
    setCopied(true);
    sound.playBlip(1000);
    setTimeout(() => setCopied(false), 2000);
  };

  const allProjects = memory.getProfile().projects;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 font-mono text-xs">
      <div className="w-full max-w-5xl h-[92vh] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-4 py-3 bg-black border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-700 text-cyan-400 flex items-center justify-center font-bold">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm font-sans">{project.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px]">
                  v{project.version}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-sans">{project.description}</span>
            </div>
          </div>

          {/* Center Tabs */}
          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'preview'
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Live Preview</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'code'
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Source Code</span>
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'projects'
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>All Projects ({allProjects.length})</span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1 text-[11px]"
              title="Download HTML file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => {
                sound.playBlip(700);
                onClose();
              }}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Studio Workspace */}
        <div className="flex-1 bg-black overflow-hidden flex flex-col relative">
          {/* Subheader controls when in Preview Mode */}
          {activeTab === 'preview' && (
            <div className="px-4 py-2 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <span>Viewport:</span>
                <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setDeviceMode('desktop')}
                    className={`p-1.5 rounded-md ${deviceMode === 'desktop' ? 'bg-slate-800 text-cyan-300' : 'hover:text-white'}`}
                    title="Desktop"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeviceMode('tablet')}
                    className={`p-1.5 rounded-md ${deviceMode === 'tablet' ? 'bg-slate-800 text-cyan-300' : 'hover:text-white'}`}
                    title="Tablet"
                  >
                    <Tablet className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeviceMode('mobile')}
                    className={`p-1.5 rounded-md ${deviceMode === 'mobile' ? 'bg-slate-800 text-cyan-300' : 'hover:text-white'}`}
                    title="Mobile"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>HOT-RELOAD COMPILED</span>
              </div>
            </div>
          )}

          {/* VIEW: LIVE PREVIEW IFRAME */}
          {activeTab === 'preview' && (
            <div className="flex-1 w-full h-full bg-slate-900/50 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
              <div
                className={`h-full bg-white rounded-2xl overflow-hidden shadow-2xl transition-all border border-slate-700 ${
                  deviceMode === 'desktop'
                    ? 'w-full'
                    : deviceMode === 'tablet'
                    ? 'w-[768px]'
                    : 'w-[375px]'
                }`}
              >
                <iframe
                  title="Project Live Preview"
                  srcDoc={project.htmlCode}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                />
              </div>
            </div>
          )}

          {/* VIEW: SOURCE CODE */}
          {activeTab === 'code' && (
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-slate-400 text-xs">HTML / CSS / JS Source</span>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 flex items-center gap-1 text-[11px]"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
              <textarea
                readOnly
                value={project.htmlCode}
                className="flex-1 w-full bg-slate-950 text-cyan-300 p-4 rounded-xl border border-slate-800 font-mono text-xs overflow-auto resize-none outline-none"
              />
            </div>
          )}

          {/* VIEW: ALL SAVED PROJECTS IN MEMORY */}
          {activeTab === 'projects' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              <div className="text-slate-400 text-xs mb-2">Projects stored in Archer Neural Memory:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      sound.playBlip(1000);
                      onProjectUpdated(p);
                      setActiveTab('preview');
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      p.id === project.id
                        ? 'bg-slate-900 border-cyan-500'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-white text-sm font-sans">{p.name}</span>
                      <span className="text-[10px] text-cyan-400 font-mono">v{p.version}</span>
                    </div>
                    <p className="text-slate-400 text-xs line-clamp-2 mb-2 font-sans">{p.description}</p>
                    <span className="text-[10px] text-slate-500">{new Date(p.updatedAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom AI Modifier Bar ("اور اس میں چینجنگ کروانی ہو تو چینجنگ بھی کر سکے") */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <input
            type="text"
            value={promptChange}
            onChange={(e) => setPromptChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyChanges()}
            placeholder="Command changes to this project (e.g., 'Change theme to neon green', 'Add contact form', 'Make calculator buttons larger')..."
            className="flex-1 bg-black text-white px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-cyan-500 outline-none text-xs font-sans placeholder:text-slate-600"
          />
          <button
            onClick={handleApplyChanges}
            disabled={isBuilding || !promptChange.trim()}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-sans text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 shrink-0"
          >
            {isBuilding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{isBuilding ? 'Compiling...' : 'Apply Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
