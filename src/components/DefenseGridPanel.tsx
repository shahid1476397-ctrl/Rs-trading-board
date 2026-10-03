import React from 'react';
import { ShieldAlert, ShieldCheck, Radio, Activity, Lock, AlertTriangle, Cpu, Globe2 } from 'lucide-react';

export const DefenseGridPanel: React.FC = () => {
  return (
    <div className="flex flex-col gap-3 p-3 bg-black/60 border border-slate-800/80 rounded-xl backdrop-blur-md text-xs font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span className="font-bold text-white uppercase tracking-wider">
            Planetary Defense & Cyber Grid (دفاعی مانیٹرنگ)
          </span>
        </div>
        <span className="text-[10px] text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800 animate-pulse">
          DEFCON 3 ACTIVE
        </span>
      </div>

      {/* Strategic Status Matrix */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col gap-1">
          <span className="text-slate-400 text-[10px]">CYBER DEFENSE SHIELD</span>
          <span className="text-emerald-400 font-bold text-sm">99.94% INTACT</span>
          <span className="text-[9px] text-slate-500">Zero active zero-day breaches</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col gap-1">
          <span className="text-slate-400 text-[10px]">SEISMIC TREMOR NETWORK</span>
          <span className="text-amber-400 font-bold text-sm">M 4.2 PACIFIC RING</span>
          <span className="text-[9px] text-slate-500">Tsunami risk: Negligible</span>
        </div>
      </div>

      {/* Subsea Cable & Infrastructure Feeds */}
      <div className="space-y-2">
        <span className="text-[10px] text-slate-400 uppercase font-bold">
          Strategic Asset Integrity Feeds:
        </span>

        {[
          {
            title: 'Subsea Fiber Cable Corridors (SEA-ME-WE 5 & 6)',
            titleUrdu: 'بحری فائبر آپٹک مواصلاتی لائنیں',
            status: 'Operational (24.2 Tbps throughput)',
            health: '100%',
            badge: 'ONLINE',
            badgeCls: 'text-emerald-400 border-emerald-800 bg-emerald-950/60',
          },
          {
            title: 'Orbital Early-Warning Constellation (SBIRS)',
            titleUrdu: 'خلائی ارلی وارننگ سسٹم',
            status: 'Thermal infrared orbital tracking locked',
            health: '99.8%',
            badge: 'SCANNING',
            badgeCls: 'text-cyan-400 border-cyan-800 bg-cyan-950/60',
          },
          {
            title: 'Global GPS / GNSS Navigational Constellation',
            titleUrdu: 'گلوبل پوزیشننگ سسٹم سیٹلائٹ گرڈ',
            status: '31 L-Band operational satellites in orbit',
            health: '100%',
            badge: 'SYNCHRONIZED',
            badgeCls: 'text-emerald-400 border-emerald-800 bg-emerald-950/60',
          },
          {
            title: 'Atmospheric Radiation & Aurora Particle Array',
            titleUrdu: 'شمسی اور مقناطیسی تابکاری مانیٹر',
            status: 'Solar wind 412 km/s, Geomagnetic Kp index: 2.1',
            health: 'NOMINAL',
            badge: 'QUIET',
            badgeCls: 'text-amber-400 border-amber-800 bg-amber-950/60',
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-lg bg-black/50 border border-slate-800/80 flex items-start justify-between gap-2"
          >
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-slate-200">{item.title}</span>
              <span className="text-[10px] text-cyan-400 font-sans" dir="rtl">{item.titleUrdu}</span>
              <span className="text-[10px] text-slate-400">{item.status}</span>
            </div>

            <span className={`px-2 py-0.5 rounded border text-[9px] font-bold shrink-0 ${item.badgeCls}`}>
              {item.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
