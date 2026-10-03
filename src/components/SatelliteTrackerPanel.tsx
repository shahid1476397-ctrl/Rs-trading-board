import React, { useState } from 'react';
import { SATELLITES_DATABASE, SatelliteAsset } from '../types/earth';
import { Radio, Satellite, Gauge, Compass, Orbit, Activity, ShieldCheck, Zap } from 'lucide-react';
import { sound } from '../services/soundEffects';

interface SatelliteTrackerPanelProps {
  onFocusSatellite?: (sat: SatelliteAsset) => void;
}

export const SatelliteTrackerPanel: React.FC<SatelliteTrackerPanelProps> = ({ onFocusSatellite }) => {
  const [selectedSat, setSelectedSat] = useState<SatelliteAsset>(SATELLITES_DATABASE[0]);

  const handleSelect = (sat: SatelliteAsset) => {
    sound.playExecuteSuccess();
    setSelectedSat(sat);
    if (onFocusSatellite) onFocusSatellite(sat);
  };

  return (
    <div className="flex flex-col gap-3 p-3 bg-black/60 border border-slate-800/80 rounded-xl backdrop-blur-md text-xs font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Satellite className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white uppercase tracking-wider">
            Orbital Space & Satellite Tracker (سیٹلائٹ ٹریکر)
          </span>
        </div>
        <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800 animate-pulse">
          5 ASSETS IN FLIGHT
        </span>
      </div>

      {/* Selected Satellite Card */}
      <div className="p-3 bg-slate-950/90 rounded-lg border border-cyan-500/40 relative overflow-hidden flex flex-col gap-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedSat.color }} />
              <h3 className="text-sm font-bold text-white font-orbitron">{selectedSat.name}</h3>
            </div>
            <span className="text-[11px] text-slate-400">NORAD #{selectedSat.noradId} • {selectedSat.operator}</span>
          </div>
          <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 font-bold border border-cyan-800 rounded text-[10px]">
            {selectedSat.orbitType} ORBIT
          </span>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900">
          <div className="p-2 rounded bg-black/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">ALTITUDE:</span>
            <span className="font-bold text-white">{selectedSat.altitudeKm} km</span>
          </div>
          <div className="p-2 rounded bg-black/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">VELOCITY:</span>
            <span className="font-bold text-cyan-400">{selectedSat.velocityKmS} km/s</span>
          </div>
          <div className="p-2 rounded bg-black/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">INCLINATION:</span>
            <span className="font-bold text-amber-400">{selectedSat.inclinationDeg}°</span>
          </div>
          <div className="p-2 rounded bg-black/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">DOWNLINK:</span>
            <span className="font-bold text-emerald-400">LOCKED (2.4 GHz)</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-300 font-sans leading-relaxed pt-1">
          <strong className="text-cyan-400">Mission:</strong> {selectedSat.mission}
        </p>
      </div>

      {/* Orbit Assets Roster */}
      <div className="space-y-1.5 pt-1 border-t border-slate-800">
        <span className="text-[10px] text-slate-400 uppercase font-bold">
          Active Space Assets Roster:
        </span>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {SATELLITES_DATABASE.map((sat) => (
            <div
              key={sat.id}
              onClick={() => handleSelect(sat)}
              className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
                selectedSat.id === sat.id
                  ? 'bg-slate-900 border-cyan-400 text-white shadow-md shadow-cyan-950/40'
                  : 'bg-black/50 border-slate-800/80 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sat.color }} />
                <div>
                  <span className="font-bold">{sat.name}</span>
                  <span className="block text-[10px] text-slate-500">{sat.operator}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-cyan-400">{sat.velocityKmS} km/s</span>
                <span className="block text-[10px] text-slate-500">{sat.altitudeKm} km</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
