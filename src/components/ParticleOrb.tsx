import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ArcherTheme } from '../types/archer';

interface ParticleOrbProps {
  theme: ArcherTheme;
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  lastSpokenText?: string;
  onToggleActive: () => void;
  onToggleMic: () => void;
  onReplayVoice?: () => void;
}

export const ParticleOrb: React.FC<ParticleOrbProps> = ({
  theme,
  isActive,
  isListening,
  isSpeaking,
  lastSpokenText,
  onToggleActive,
  onToggleMic,
  onReplayVoice,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef<number>(theme.orbColorNum);
  const activeRef = useRef<boolean>(isActive);
  const speakingRef = useRef<boolean>(isSpeaking);
  const listeningRef = useRef<boolean>(isListening);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);

  const handleToggle = () => {
    if (!isActive) {
      setIsCalibrating(true);
      setTimeout(() => {
        setIsCalibrating(false);
        onToggleActive();
      }, 700);
    } else {
      onToggleActive();
    }
  };

  useEffect(() => {
    colorRef.current = theme.orbColorNum;
  }, [theme]);

  useEffect(() => {
    activeRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    speakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    listeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    let width = container.clientWidth || 300;
    let height = container.clientHeight || 240;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create 3D spherical particle cloud
    const particleCount = 1800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    const radius = 1.35;
    for (let i = 0; i < particleCount; i++) {
      // Golden spiral distribution on sphere
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;

      const r = radius * (0.92 + Math.random() * 0.16);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      scales[i] = 0.5 + Math.random() * 1.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    const material = new THREE.PointsMaterial({
      color: new THREE.Color(colorRef.current),
      size: 0.042,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Inner glowing core
    const coreGeo = new THREE.SphereGeometry(0.55, 24, 24);
    const coreMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(colorRef.current),
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const currentActive = activeRef.current;
      const currentSpeaking = speakingRef.current;
      const currentListening = listeningRef.current;

      // Update color dynamically from theme ref
      material.color.setHex(colorRef.current);
      coreMat.color.setHex(colorRef.current);

      // Rotation speed based on active/idle
      const speed = currentActive ? (currentSpeaking ? 0.035 : 0.018) : 0.007;
      particles.rotation.y += speed;
      particles.rotation.x = Math.sin(elapsedTime * 0.5) * 0.2;

      // Pulse / breathing distortion on vertices
      const posArray = geometry.attributes.position.array as Float32Array;
      const waveFreq = currentSpeaking ? 14 : currentListening ? 8 : 2.5;
      const waveAmp = currentSpeaking ? 0.28 : currentActive ? 0.12 : 0.04;

      for (let i = 0; i < particleCount; i++) {
        const ox = originalPositions[i * 3];
        const oy = originalPositions[i * 3 + 1];
        const oz = originalPositions[i * 3 + 2];

        const noise = Math.sin(elapsedTime * waveFreq + ox * 3.0 + oy * 3.0) * waveAmp;
        const factor = 1.0 + noise;

        posArray[i * 3] = ox * factor;
        posArray[i * 3 + 1] = oy * factor;
        posArray[i * 3 + 2] = oz * factor;
      }
      geometry.attributes.position.needsUpdate = true;

      // Core opacity pulse
      coreMat.opacity = currentActive
        ? 0.35 + Math.sin(elapsedTime * 4) * 0.15
        : 0.12 + Math.sin(elapsedTime * 1.5) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 300;
      height = container.clientHeight || 240;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-between p-3 bg-black/80 rounded-2xl border border-slate-800 backdrop-blur-md w-full h-full shadow-2xl overflow-hidden">
      {/* Reticle corner borders */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-slate-600 rounded-tl pointer-events-none" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-slate-600 rounded-tr pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-slate-600 rounded-bl pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-slate-600 rounded-br pointer-events-none" />

      {/* 3D Particle Canvas */}
      <div ref={containerRef} className="w-full flex-1 min-h-[170px] cursor-pointer" onClick={onToggleActive} />

      {/* Live Voice-Over Banner */}
      {isSpeaking ? (
        <div className="w-full px-3 py-1.5 mb-2 rounded-xl bg-cyan-950/80 border border-cyan-500/70 text-cyan-200 text-xs flex items-center justify-between shadow-lg animate-pulse font-mono">
          <div className="flex items-center gap-2">
            <span className="flex items-end gap-0.5 h-3">
              <span className="w-1 bg-cyan-400 animate-[bounce_0.6s_infinite_100ms] h-3 rounded-full" />
              <span className="w-1 bg-cyan-400 animate-[bounce_0.6s_infinite_200ms] h-2 rounded-full" />
              <span className="w-1 bg-cyan-400 animate-[bounce_0.6s_infinite_300ms] h-4 rounded-full" />
              <span className="w-1 bg-cyan-400 animate-[bounce_0.6s_infinite_150ms] h-2.5 rounded-full" />
            </span>
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">
              VOICE-OVER ACTIVE
            </span>
          </div>
          <span className="text-[9px] text-cyan-400">ENGLISH</span>
        </div>
      ) : lastSpokenText ? (
        <div className="w-full px-2.5 py-1 mb-2 rounded-lg bg-black/70 border border-slate-800 text-[10px] text-slate-400 flex items-center justify-between font-mono">
          <span className="truncate max-w-[170px] text-slate-300">
            {lastSpokenText}
          </span>
          {onReplayVoice && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReplayVoice();
              }}
              className="text-cyan-400 hover:text-white font-bold ml-1 shrink-0 flex items-center gap-1"
            >
              <span>Replay Voice 🔊</span>
            </button>
          )}
        </div>
      ) : null}

      {/* Status Label (SYSTEM STANDBY / CALIBRATION / SYSTEM ACTIVE) */}
      <div className="flex items-center gap-2 mb-2 font-mono text-[11px] tracking-widest uppercase">
        <span
          className={`w-2 h-2 rounded-full ${isActive || isCalibrating ? 'animate-ping' : ''}`}
          style={{ backgroundColor: isCalibrating ? '#eab308' : (isActive ? theme.orbColorHex : '#94a3b8') }}
        />
        <span style={{ color: isCalibrating ? '#facc15' : (isActive ? theme.orbColorHex : '#94a3b8') }}>
          {isCalibrating ? '• CALIBRATION... •' : (isActive ? '• SYSTEM ACTIVE •' : '• SYSTEM STANDBY •')}
        </span>
      </div>

      {/* Action Buttons: START AI / TERMINATE + Mic */}
      <div className="flex items-center gap-2 w-full max-w-[220px]">
        <button
          onClick={handleToggle}
          disabled={isCalibrating}
          className={`flex-1 py-1.5 px-4 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg text-center ${
            isActive
              ? 'bg-transparent text-white border hover:bg-white/10'
              : 'bg-transparent text-white border border-slate-700 hover:border-slate-500 hover:bg-slate-900'
          }`}
          style={{
            borderColor: isActive ? theme.orbColorHex : undefined,
            boxShadow: isActive ? `0 0 14px ${theme.glowColor}` : undefined,
          }}
        >
          {isActive ? 'TERMINATE' : (isCalibrating ? 'CALIBRATING...' : 'START AI')}
        </button>

        {/* Microphone Toggle Button */}
        <button
          onClick={onToggleMic}
          className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
            isListening
              ? 'bg-rose-600 border-rose-400 text-white animate-pulse shadow-md shadow-rose-900'
              : 'bg-black/60 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
          }`}
          title={isListening ? 'Mute Mic' : 'Voice Input'}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="8" y1="23" x2="16" y2="23" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};
