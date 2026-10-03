import React from 'react';
import { CloudSun, Wind, Droplets, Thermometer, AlertCircle, Eye, Compass, Waves } from 'lucide-react';

export const WeatherRadarPanel: React.FC = () => {
  return (
    <div className="flex flex-col gap-3 p-3 bg-black/60 border border-slate-800/80 rounded-xl backdrop-blur-md text-xs font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <CloudSun className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white uppercase tracking-wider">
            Meteorological & Atmospheric Radar (عالمی موسم)
          </span>
        </div>
        <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
          DOPPLER 4D STREAM
        </span>
      </div>

      {/* Global Highlights Banner */}
      <div className="p-3 bg-slate-950/90 rounded-lg border border-cyan-500/30 flex flex-col gap-2">
        <div className="flex items-center justify-between text-slate-200">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white uppercase">Planetary Thermal Equilibrium</span>
          </div>
          <span className="text-emerald-400 font-bold">14.8°C Global Mean</span>
        </div>
        <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
          Tropospheric thermal baseline stable. Subtropical jet streams flowing at 145 knots across the North Atlantic and Pacific corridors.
        </p>
      </div>

      {/* 4 Regional Weather Radar Stations */}
      <div className="space-y-2">
        <span className="text-[10px] text-slate-400 uppercase font-bold">
          Regional Atmospheric Stations:
        </span>

        {[
          {
            region: 'Arabian Sea & South Asia',
            regionUrdu: 'بحیرہ عرب اور جنوبی ایشیا',
            status: 'Maritime High Pressure Zone',
            temp: '32°C',
            humidity: '68%',
            wind: '14 knots SSW',
            pressure: '1012 hPa',
          },
          {
            region: 'North Atlantic Jet Stream',
            regionUrdu: 'شمالی اوقیانوس جیٹ اسٹریم',
            status: 'Sub-polar Low Cyclonic Drift',
            temp: '11°C',
            humidity: '84%',
            wind: '42 knots NW',
            pressure: '998 hPa',
          },
          {
            region: 'Pacific Ocean Basin',
            regionUrdu: 'بحر الکاہل خطہ',
            status: 'Tropical Wave Disturbance Active',
            temp: '27°C',
            humidity: '76%',
            wind: '22 knots ENE',
            pressure: '1008 hPa',
          },
          {
            region: 'Mediterranean & Southern Europe',
            regionUrdu: 'بحیرہ روم اور جنوبی یورپ',
            status: 'Mild Anticyclone System',
            temp: '22°C',
            humidity: '48%',
            wind: '8 knots S',
            pressure: '1018 hPa',
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-lg bg-black/50 border border-slate-800/80 hover:border-slate-700 flex flex-col gap-1.5 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200">{item.region}</span>
                <span className="block text-[10px] text-cyan-400 font-sans" dir="rtl">{item.regionUrdu}</span>
              </div>
              <span className="font-bold text-amber-400 text-sm">{item.temp}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 pt-1 border-t border-slate-900">
              <div className="flex items-center gap-1">
                <Wind className="w-3 h-3 text-cyan-400" />
                <span>{item.wind}</span>
              </div>
              <div className="flex items-center gap-1">
                <Droplets className="w-3 h-3 text-cyan-400" />
                <span>{item.humidity}</span>
              </div>
              <div className="flex items-center gap-1">
                <Waves className="w-3 h-3 text-cyan-400" />
                <span>{item.pressure}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
