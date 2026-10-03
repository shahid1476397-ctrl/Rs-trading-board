import React, { useEffect, useRef, useState } from 'react';
import { HUDTheme, THEMES, VisemeShape } from '../types/marklv';
import { speech } from '../services/speechService';
import { Mic, Volume2 } from 'lucide-react';

interface AudioWaveformProps {
  theme: HUDTheme;
  isSpeaking: boolean;
  isListening: boolean;
  onMicClick: () => void;
  onAbortSpeak: () => void;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  theme,
  isSpeaking,
  isListening,
  onMicClick,
  onAbortSpeak,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentViseme, setCurrentViseme] = useState<{ shape: VisemeShape; intensity: number }>({
    shape: 'REST',
    intensity: 0,
  });

  useEffect(() => {
    const unsub = speech.onViseme((shape, intensity) => {
      setCurrentViseme({ shape, intensity });
    });
    return unsub;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;
    const themeColor = THEMES[theme].primary;

    const render = () => {
      animId = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Draw middle baseline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      const active = isSpeaking || isListening;
      const baseAmp = active ? 24 : 4;
      phase += active ? 0.15 : 0.03;

      // Draw primary glowing audio wave
      ctx.lineWidth = 2;
      ctx.strokeStyle = themeColor;
      ctx.shadowColor = themeColor;
      ctx.shadowBlur = active ? 8 : 2;

      ctx.beginPath();
      for (let x = 0; x < width; x += 2) {
        const normX = x / width;
        // Bell envelope so edges fade smoothly
        const envelope = Math.sin(normX * Math.PI);
        const y =
          height / 2 +
          Math.sin(normX * 12 + phase) * baseAmp * envelope +
          Math.sin(normX * 24 - phase * 1.5) * (baseAmp * 0.4) * envelope;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw secondary harmonic echo wave
      ctx.lineWidth = 1;
      ctx.strokeStyle = `${themeColor}44`;
      ctx.beginPath();
      for (let x = 0; x < width; x += 3) {
        const normX = x / width;
        const envelope = Math.sin(normX * Math.PI);
        const y =
          height / 2 +
          Math.sin(normX * 8 - phase * 0.8) * (baseAmp * 0.6) * envelope;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [theme, isSpeaking, isListening]);

  return (
    <div className="flex flex-col gap-2 p-3 bg-black/40 border border-slate-800/80 rounded-lg backdrop-blur-md">
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isSpeaking ? 'bg-amber-400 animate-ping' : isListening ? 'bg-rose-500 animate-ping' : 'bg-slate-600'
            }`}
          />
          <span className="text-slate-400 uppercase tracking-wider">
            {isSpeaking ? 'AUDIO OUTPUT [TTS]' : isListening ? 'AUDIO INPUT [MIC STREAM]' : 'ACOUSTIC CHORD STANDBY'}
          </span>
        </div>

        {/* Viseme Shape Readout */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
          <span className="text-slate-500">VISEME:</span>
          <span
            className="font-bold tracking-widest"
            style={{ color: THEMES[theme].primary }}
          >
            [{currentViseme.shape}]
          </span>
        </div>
      </div>

      {/* Canvas Oscilloscope */}
      <div className="relative w-full h-14 bg-black/60 rounded border border-slate-800/60 overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={400}
          height={60}
          className="w-full h-full block"
        />

        {/* Frequency tick marks */}
        <div className="absolute inset-x-0 bottom-0.5 flex justify-between px-2 text-[9px] font-mono text-slate-600 pointer-events-none">
          <span>20Hz</span>
          <span>1kHz</span>
          <span>8kHz</span>
          <span>20kHz</span>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onMicClick}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider transition-all ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-900/50'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-cyan-500'
          }`}
          title="Push to Talk (or press Spacebar)"
        >
          <Mic className={`w-3.5 h-3.5 ${isListening ? 'animate-bounce' : ''}`} />
          <span>{isListening ? 'Listening (Release)...' : 'Push To Talk [Space]'}</span>
        </button>

        {isSpeaking && (
          <button
            onClick={onAbortSpeak}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-xs font-mono transition-all"
            title="Interrupt speech"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Mute / Intercept</span>
          </button>
        )}
      </div>
    </div>
  );
};
