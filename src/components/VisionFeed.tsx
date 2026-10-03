import React, { useEffect, useRef, useState } from 'react';
import { HUDTheme, THEMES } from '../types/marklv';
import { Camera, Monitor, RefreshCw, Eye, Scan, CheckCircle, ShieldAlert } from 'lucide-react';
import { sound } from '../services/soundEffects';

interface VisionFeedProps {
  theme: HUDTheme;
  onAnalysisResult?: (text: string) => void;
}

export const VisionFeed: React.FC<VisionFeedProps> = ({ theme, onAnalysisResult }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [feedMode, setFeedMode] = useState<'webcam' | 'screen' | 'synthetic'>('synthetic');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [detectedTargets, setDetectedTargets] = useState<Array<{ id: string; label: string; x: number; y: number; w: number; h: number; confidence: number }>>([
    { id: 'T-101', label: 'OPERATOR: ANOMALOUS', x: 28, y: 22, w: 44, h: 56, confidence: 98.7 },
    { id: 'O-204', label: 'INTERFACE_CONSOLE', x: 74, y: 60, w: 20, h: 28, confidence: 91.2 },
  ]);

  const themeColors = THEMES[theme];

  // Stop video stream helper
  const stopCurrentStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  const startWebcam = async () => {
    stopCurrentStream();
    sound.playChirp();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreamActive(true);
        setFeedMode('webcam');
      }
    } catch (err) {
      console.warn('Webcam permission denied or unavailable, reverting to synthetic HUD feed', err);
      setFeedMode('synthetic');
      setStreamActive(false);
    }
  };

  const startScreenShare = async () => {
    stopCurrentStream();
    sound.playChirp();
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreamActive(true);
        setFeedMode('screen');
      }
    } catch (err) {
      setFeedMode('synthetic');
      setStreamActive(false);
    }
  };

  const runVisionAnalysis = () => {
    setIsScanning(true);
    sound.playAlert();

    // Trigger visual scan effect
    setTimeout(() => {
      setIsScanning(false);
      sound.playExecuteSuccess();
      const findings = [
        'BIO-TELEMETRY: Operator vitals nominal. Pupil dilation stable at 3.2mm. No external thermal anomalies detected.',
        'OPTICAL TARGET ACQUIRED: Primary visual quadrant mapped. 3 interactive surfaces identified with zero hostile intrusion markers.',
        'OCR TEXT EXTRACTION: Mark LV OS console feed verified. Tactical response parameters locked.',
      ];
      const randomFinding = findings[Math.floor(Math.random() * findings.length)];
      if (onAnalysisResult) {
        onAnalysisResult(randomFinding);
      }
    }, 1400);
  };

  useEffect(() => {
    return () => {
      stopCurrentStream();
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 p-3 bg-black/50 border border-slate-800/80 rounded-lg backdrop-blur-md relative overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4" style={{ color: themeColors.primary }} />
          <span className="text-slate-300 font-bold uppercase tracking-wider">
            Vision Processor [actions/screen_processor.py]
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={startWebcam}
            className={`px-2 py-1 rounded flex items-center gap-1 text-[11px] border transition-all ${
              feedMode === 'webcam' && streamActive
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 font-bold'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Switch to Real Webcam"
          >
            <Camera className="w-3 h-3" />
            <span>Webcam</span>
          </button>
          <button
            onClick={startScreenShare}
            className={`px-2 py-1 rounded flex items-center gap-1 text-[11px] border transition-all ${
              feedMode === 'screen' && streamActive
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 font-bold'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Screen Capture Feed"
          >
            <Monitor className="w-3 h-3" />
            <span>Screen</span>
          </button>
        </div>
      </div>

      {/* Main Video Viewport / Holographic Vision Box */}
      <div className="relative w-full h-48 bg-slate-950 rounded border border-slate-800/80 overflow-hidden flex items-center justify-center">
        {/* Real Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${streamActive ? 'block' : 'hidden'}`}
        />

        {/* Synthetic Holographic Grid Feed when webcam is idle */}
        {!streamActive && (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 relative hud-grid-bg">
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-cyan-500/30 flex items-center justify-center animate-spin" style={{ animationDuration: '20s' }}>
              <div className="w-16 h-16 rounded-full border border-cyan-400/40 flex items-center justify-center">
                <Scan className="w-8 h-8 text-cyan-400/70" />
              </div>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 mt-2 uppercase tracking-widest font-semibold">
              SYNTHETIC OPTICAL SENSOR ONLINE
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Click [Webcam] or [Screen] above to connect live optical sensors
            </span>
          </div>
        )}

        {/* Target Bounding Boxes */}
        {detectedTargets.map((t) => (
          <div
            key={t.id}
            className="absolute border border-dashed pointer-events-none transition-all duration-300"
            style={{
              borderColor: themeColors.primary,
              left: `${t.x}%`,
              top: `${t.y}%`,
              width: `${t.w}%`,
              height: `${t.h}%`,
              backgroundColor: `${themeColors.primary}0a`,
            }}
          >
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2" style={{ borderColor: themeColors.primary }} />
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2" style={{ borderColor: themeColors.primary }} />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2" style={{ borderColor: themeColors.primary }} />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2" style={{ borderColor: themeColors.primary }} />

            <div
              className="absolute -top-5 left-0 px-1 py-0.2 text-[9px] font-mono font-bold tracking-tight bg-black/80 rounded"
              style={{ color: themeColors.primary }}
            >
              [{t.id}] {t.label} ({t.confidence}%)
            </div>
          </div>
        ))}

        {/* Scanning laser line */}
        {isScanning && (
          <div
            className="absolute inset-x-0 h-1 shadow-lg shadow-cyan-400/80 animate-pulse pointer-events-none"
            style={{
              backgroundColor: themeColors.primary,
              top: '50%',
              animation: 'scanline 1.2s ease-in-out infinite alternate',
            }}
          />
        )}

        {/* HUD Crosshairs in center */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-cyan-400 rounded-full" />
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={runVisionAnalysis}
          disabled={isScanning}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded text-xs font-mono uppercase tracking-wider transition-all disabled:opacity-50"
        >
          <Scan className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Acquiring Telemetry...' : 'Optical Analysis & OCR'}</span>
        </button>

        <span className="text-[10px] font-mono text-slate-500">
          RGB 640x480 • FOV 78° • 60 FPS
        </span>
      </div>
    </div>
  );
};
