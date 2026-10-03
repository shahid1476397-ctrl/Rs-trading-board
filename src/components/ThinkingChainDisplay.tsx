import React, { useState } from 'react';
import { ThinkingSteps } from '../types/archer';
import { BrainCircuit, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface ThinkingChainDisplayProps {
  thinking?: ThinkingSteps;
  isStreaming?: boolean;
}

export const ThinkingChainDisplay: React.FC<ThinkingChainDisplayProps> = ({
  thinking,
  isStreaming = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!thinking && !isStreaming) return null;

  return (
    <div className="w-full my-2 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono overflow-hidden shadow-lg">
      {/* Header Bar */}
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-900/80 hover:bg-slate-900 transition-colors text-left border-b border-slate-800/80"
      >
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="font-bold text-white tracking-wider text-[11px]">
            AI IS THINKING...
          </span>
          {isStreaming && (
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          )}
        </div>
        <div className="text-slate-400 hover:text-white">
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Thinking Body */}
      {isExpanded && (
        <div className="p-3 space-y-3 bg-black/60 text-slate-300 leading-relaxed text-[11px]">
          {/* Step 1: Assessing the Request */}
          <div className="space-y-1">
            <div className="font-bold text-cyan-300 flex items-center gap-1">
              <span>» Assessing the Request:</span>
            </div>
            <p className="text-slate-400 font-sans text-xs pl-2 border-l-2 border-cyan-500/40">
              {thinking?.assessing || 'Evaluating user intent, parsing contextual entities, and mapping spatial coordinates...'}
            </p>
          </div>

          {/* Step 2: Clarifying the Task */}
          <div className="space-y-1">
            <div className="font-bold text-amber-300 flex items-center gap-1">
              <span>» Clarifying the Task:</span>
            </div>
            <p className="text-slate-400 font-sans text-xs pl-2 border-l-2 border-amber-500/40">
              {thinking?.clarifying || 'Aligning execution tools, updating neural task memory, and composing natural response...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
