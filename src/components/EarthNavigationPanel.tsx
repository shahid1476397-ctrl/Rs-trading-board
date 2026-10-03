import React from 'react';
import { CITIES_DATABASE, GeoLocation, GlobeState, GlobeViewMode } from '../types/earth';
import { Navigation, Globe2, Compass, Wind, Users, Clock, ZoomIn, ZoomOut, Play, Pause, Layers, Target } from 'lucide-react';
import { sound } from '../services/soundEffects';

interface EarthNavigationPanelProps {
  globeState: GlobeState;
  onSelectCity: (city: GeoLocation) => void;
  onSetViewMode: (mode: GlobeViewMode) => void;
  onToggleAutoRotate: () => void;
  onZoom: (delta: number) => void;
}

export const EarthNavigationPanel: React.FC<EarthNavigationPanelProps> = ({
  globeState,
  onSelectCity,
  onSetViewMode,
  onToggleAutoRotate,
  onZoom,
}) => {
  const selected = globeState.selectedLocation;

  return (
    <div className="flex flex-col gap-3 p-3 bg-black/60 border border-slate-800/80 rounded-xl backdrop-blur-md text-xs font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white uppercase tracking-wider">
            Planetary Reconnaissance (ارتھ کنٹرول)
          </span>
        </div>
        <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
          GLOBAL 3D GRID
        </span>
      </div>

      {/* Target City Dossier Card */}
      {selected ? (
        <div className="p-3 bg-slate-950/90 rounded-lg border border-cyan-500/40 relative overflow-hidden flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white font-orbitron">{selected.name}</span>
                <span className="text-sm font-bold text-cyan-300 font-sans">{selected.nameUrdu}</span>
              </div>
              <span className="text-[11px] text-slate-400">{selected.country} ({selected.countryUrdu})</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-amber-400">{selected.tempC}°C</span>
              <span className="block text-[10px] text-slate-500">SURFACE TEMP</span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>{selected.lat.toFixed(2)}°N, {selected.lng.toFixed(2)}°E</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{selected.timezone}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>Pop: {selected.population}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              <span className="truncate">{selected.weatherCondition}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 font-sans leading-relaxed pt-1 border-t border-slate-900">
            {selected.strategicNote}
          </p>
          <p className="text-[11px] text-cyan-300 font-sans leading-relaxed text-right" dir="rtl">
            {selected.strategicNoteUrdu}
          </p>
        </div>
      ) : (
        <div className="p-3 bg-black/40 rounded-lg border border-slate-800 text-center text-slate-400">
          <span>Click any city pinpoint or use Voice to fly camera to coordinates.</span>
          <span className="block text-[11px] text-cyan-400 mt-1" dir="rtl">کسی بھی شہر پر کلک کریں یا آواز کے ذریعے حکم دیں۔</span>
        </div>
      )}

      {/* Camera & Globe Motion Controls */}
      <div className="flex items-center justify-between p-2 bg-black/50 rounded-lg border border-slate-800/80">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              sound.playBlip(1100);
              onZoom(-0.3);
            }}
            className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span className="text-[10px]">In</span>
          </button>
          <button
            onClick={() => {
              sound.playBlip(900);
              onZoom(0.3);
            }}
            className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
            <span className="text-[10px]">Out</span>
          </button>
        </div>

        <button
          onClick={() => {
            sound.playBlip(1200);
            onToggleAutoRotate();
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-[11px] transition-all ${
            globeState.autoRotate
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          {globeState.autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{globeState.autoRotate ? 'Halt Spin' : 'Auto Rotate'}</span>
        </button>
      </div>

      {/* Globe Projection Shaders Switcher */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold">
          <Layers className="w-3 h-3 text-cyan-400" />
          <span>Planetary Shader Projections:</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'photoreal', name: 'Photoreal Day/Night', urdu: 'قدرتی گلوب' },
            { id: 'holographic', name: 'Tactical Wireframe', urdu: 'ہولوگرافک' },
            { id: 'meteorology', name: 'Weather Radar', urdu: 'موسمیاتی ریڈار' },
            { id: 'satellites', name: 'Orbital Mesh', urdu: 'سیٹلائٹ مدار' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                sound.playBlip(1200);
                onSetViewMode(mode.id as GlobeViewMode);
              }}
              className={`p-1.5 rounded border text-[10px] text-left transition-all ${
                globeState.viewMode === mode.id
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500 font-bold'
                  : 'bg-black/40 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <div>{mode.name}</div>
              <div className="text-[9px] text-slate-500" dir="rtl">{mode.urdu}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick City Navigation Grid */}
      <div className="space-y-1.5 pt-1 border-t border-slate-800">
        <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
          <div className="flex items-center gap-1.5">
            <Target className="w-3 h-3 text-amber-400" />
            <span>Target Coordinates Hotlist:</span>
          </div>
          <span>{CITIES_DATABASE.length} LOCATIONS</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {CITIES_DATABASE.map((city) => (
            <button
              key={city.id}
              onClick={() => {
                sound.playExecuteSuccess();
                onSelectCity(city);
              }}
              className={`p-2 rounded border text-left flex flex-col gap-0.5 transition-all active:scale-95 ${
                selected?.id === city.id
                  ? 'bg-cyan-950 border-cyan-400 text-white font-bold shadow-md shadow-cyan-950/50'
                  : 'bg-black/50 border-slate-800/80 text-slate-300 hover:border-cyan-500/50 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">{city.name}</span>
                <span className="text-[10px] text-cyan-400">{city.tempC}°</span>
              </div>
              <span className="text-[10px] text-slate-500">{city.nameUrdu}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
