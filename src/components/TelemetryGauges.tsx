import React from 'react';
import { HUDTheme, SystemTelemetry, THEMES } from '../types/marklv';
import { Cpu, HardDrive, Zap, Wifi, Activity, Gauge } from 'lucide-react';

interface TelemetryGaugesProps {
  telemetry: SystemTelemetry;
  theme: HUDTheme;
  onThrottleArc: (val: number) => void;
}

export const TelemetryGauges: React.FC<TelemetryGaugesProps> = ({
  telemetry,
  theme,
  onThrottleArc,
}) => {
  const themeColors = THEMES[theme];

  // Helper for circular progress bar
  const renderCircleMeter = (
    percent: number,
    label: string,
    valueStr: string,
    subStr: string,
    warningThresh: number = 85
  ) => {
    const radius = 28;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (Math.min(100, Math.max(0, percent)) / 100) * circ;
    const isWarning = percent >= warningThresh;

    return (
      <div className="flex flex-col items-center p-2 rounded-lg bg-black/40 border border-slate-800/80 backdrop-blur-md relative overflow-hidden group">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke="currentColor"
              strokeWidth="4"
              className="text-slate-800/80"
              fill="transparent"
            />
            {/* Value ring */}
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke={isWarning ? '#ef4444' : themeColors.primary}
              strokeWidth="4"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-mono font-bold text-white tracking-tight">
              {valueStr}
            </span>
          </div>
        </div>
        <span className="text-[11px] font-mono uppercase text-slate-400 mt-1 tracking-wider">
          {label}
        </span>
        <span className="text-[10px] font-mono text-slate-500">
          {subStr}
        </span>
      </div>
    );
  };

  const memPercent = (telemetry.memoryUsedGB / telemetry.memoryTotalGB) * 100;

  return (
    <div className="flex flex-col gap-3">
      {/* 4 Primary Dials */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {renderCircleMeter(
          telemetry.cpuUsage,
          'CPU Core',
          `${Math.round(telemetry.cpuUsage)}%`,
          `${telemetry.cpuTemp}°C`
        )}
        {renderCircleMeter(
          memPercent,
          'RAM Cache',
          `${telemetry.memoryUsedGB}GB`,
          `of ${telemetry.memoryTotalGB}GB`
        )}
        {renderCircleMeter(
          telemetry.gpuUsage,
          'GPU Shader',
          `${Math.round(telemetry.gpuUsage)}%`,
          `${telemetry.fps} FPS`
        )}
        {renderCircleMeter(
          telemetry.arcReactorOutput,
          'Arc Output',
          `${Math.round(telemetry.arcReactorOutput)}%`,
          'Palladium Core'
        )}
      </div>

      {/* Auxiliary Telemetry Strip */}
      <div className="flex items-center justify-between px-3 py-2 bg-black/60 border border-slate-800/80 rounded-lg text-xs font-mono">
        <div className="flex items-center gap-2">
          <Wifi className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">NET LATENCY:</span>
          <span className="text-cyan-400 font-bold">{telemetry.networkLatencyMs}ms</span>
        </div>

        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">STABILITY:</span>
          <span className="text-emerald-400 font-bold">99.98%</span>
        </div>

        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">POWER GRID:</span>
          <span className="text-amber-400 font-bold">ON LINE</span>
        </div>
      </div>

      {/* Arc Reactor Throttle Control */}
      <div className="p-3 bg-black/50 border border-slate-800/80 rounded-lg flex flex-col gap-1.5 backdrop-blur-md">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5" style={{ color: themeColors.primary }} />
            <span className="text-slate-300 uppercase tracking-wider font-semibold">
              Arc Reactor Power Shunt
            </span>
          </div>
          <span className="font-bold" style={{ color: themeColors.primary }}>
            {Math.round(telemetry.arcReactorOutput)}%
          </span>
        </div>
        <input
          type="range"
          min="20"
          max="100"
          value={telemetry.arcReactorOutput}
          onChange={(e) => onThrottleArc(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>20% Low Power</span>
          <span>50% Tactical</span>
          <span>100% Overdrive</span>
        </div>
      </div>
    </div>
  );
};
