import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { HUDTheme, THEMES, VisemeShape } from '../types/marklv';
import { speech } from '../services/speechService';

interface HolographicAvatarProps {
  theme: HUDTheme;
  isSpeaking: boolean;
  isListening: boolean;
  arcOutput: number;
}

export const HolographicAvatar: React.FC<HolographicAvatarProps> = ({
  theme,
  isSpeaking,
  isListening,
  arcOutput,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentVisemeRef = useRef<{ shape: VisemeShape; intensity: number }>({
    shape: 'REST',
    intensity: 0,
  });

  // Track mouse coordinates for subtle head gaze
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  useEffect(() => {
    const unsubViseme = speech.onViseme((shape, intensity) => {
      currentVisemeRef.current = { shape, intensity };
    });
    return unsubViseme;
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    let width = container.clientWidth || 400;
    let height = container.clientHeight || 400;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const themeColors = THEMES[theme];
    const primaryColor = new THREE.Color(themeColors.primary);

    // Group for Head & Rigs
    const headGroup = new THREE.Group();
    scene.add(headGroup);

    // 1. Procedural 3D Head Mesh (Cranial & Facial Geometry)
    // We construct a canonical head silhouette with jaw, brow, cheekbones, and vertex-deformable mouth
    const headGeo = new THREE.IcosahedronGeometry(2.1, 4);
    const posAttr = headGeo.attributes.position as THREE.BufferAttribute;
    const origPositions = new Float32Array(posAttr.array);

    // Shape the icosahedron into a stylized aerodynamic cyber-skull
    for (let i = 0; i < posAttr.count; i++) {
      let x = origPositions[i * 3];
      let y = origPositions[i * 3 + 1];
      let z = origPositions[i * 3 + 2];

      // Elongate vertically, narrow jaw at bottom
      y *= 1.25;
      if (y < 0) {
        // Jaw taper
        const taper = 1.0 + y * 0.28;
        x *= Math.max(0.45, taper);
        z *= Math.max(0.55, taper);
      }
      // Flatten back slightly and accentuate cheekbones
      if (z > 0 && y > -0.5 && y < 0.8) {
        z *= 1.08;
      }
      if (z < -0.5) {
        z *= 0.9;
      }

      posAttr.setXYZ(i, x, y, z);
    }
    headGeo.computeVertexNormals();

    // Wireframe Material with glowing holographic aesthetic
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      wireframe: true,
      transparent: true,
      opacity: 0.42,
    });
    const headMesh = new THREE.Mesh(headGeo, wireframeMat);
    headGroup.add(headMesh);

    // Points particle nodes on facial vertices
    const pointsMat = new THREE.PointsMaterial({
      color: primaryColor,
      size: 0.05,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const pointsMesh = new THREE.Points(headGeo, pointsMat);
    headGroup.add(pointsMesh);

    // 2. Optical Visor / Eye Nodes
    const eyeGeo = new THREE.BoxGeometry(0.55, 0.09, 0.2);
    const eyeMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
    });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.7, 0.35, 1.85);
    leftEye.rotation.y = 0.2;
    headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.7, 0.35, 1.85);
    rightEye.rotation.y = -0.2;
    headGroup.add(rightEye);

    // 3. Holographic Orbital Gimbal Rings (Pitch, Yaw, Roll telemetry indicators)
    const ringMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });

    const ringYaw = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.015, 8, 80), ringMat);
    ringYaw.rotation.x = Math.PI / 2;
    scene.add(ringYaw);

    const ringPitch = new THREE.Mesh(new THREE.TorusGeometry(3.5, 0.015, 8, 80), ringMat);
    scene.add(ringPitch);

    const ringRoll = new THREE.Mesh(new THREE.TorusGeometry(3.8, 0.015, 8, 80), ringMat);
    ringRoll.rotation.y = Math.PI / 2;
    scene.add(ringRoll);

    // 4. Arc Reactor Collar Ring at base
    const arcCollarMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0.7,
      wireframe: true,
    });
    const arcCollar = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 0.6, 24, 2, true), arcCollarMat);
    arcCollar.position.set(0, -2.6, 0);
    scene.add(arcCollar);

    // 5. Floating Holographic Data Particles
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 12;
      particlePositions[i + 1] = (Math.random() - 0.5) * 10;
      particlePositions[i + 2] = (Math.random() - 0.5) * 8;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particlePointsMat = new THREE.PointsMaterial({
      color: primaryColor,
      size: 0.04,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particlePointsMat);
    scene.add(particleSystem);

    // Mouse & Touch tracking listener for mobile and desktop
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = x * 0.45;
      mouseRef.current.targetY = y * 0.35;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);
        mouseRef.current.targetX = Math.max(-0.6, Math.min(0.6, x * 0.55));
        mouseRef.current.targetY = Math.max(-0.5, Math.min(0.5, y * 0.45));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 400;
      height = container.clientHeight || 400;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Smooth mouse gaze interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Subtle idle breathing motion + speech excitement
      const idleSway = Math.sin(time * 1.5) * 0.04;
      const speechExcitement = isSpeaking ? Math.sin(time * 12) * 0.025 : 0;
      const listenPulse = isListening ? Math.sin(time * 8) * 0.03 : 0;

      headGroup.rotation.y = mouseRef.current.x + idleSway + speechExcitement;
      headGroup.rotation.x = -mouseRef.current.y + idleSway * 0.5;
      headGroup.position.y = idleSway + listenPulse;

      // Rotate orbital gimbal rings at varying sci-fi rates
      ringYaw.rotation.z += 0.003;
      ringPitch.rotation.x += 0.002;
      ringRoll.rotation.y -= 0.004;

      // Viseme mouth deformation on vertices
      const currentViseme = currentVisemeRef.current;
      const positions = headGeo.attributes.position as THREE.BufferAttribute;
      let jawDrop = 0;
      let lipPucker = 0;
      let mouthWide = 0;

      if (currentViseme.shape === 'A') {
        jawDrop = currentViseme.intensity * 0.35;
      } else if (currentViseme.shape === 'O' || currentViseme.shape === 'U') {
        jawDrop = currentViseme.intensity * 0.2;
        lipPucker = currentViseme.intensity * 0.25;
      } else if (currentViseme.shape === 'E' || currentViseme.shape === 'I') {
        jawDrop = currentViseme.intensity * 0.12;
        mouthWide = currentViseme.intensity * 0.18;
      } else if (currentViseme.shape === 'CH' || currentViseme.shape === 'S') {
        jawDrop = currentViseme.intensity * 0.08;
      }

      // Deform mouth & jaw vertices in real-time
      const posArray = positions.array as Float32Array;
      for (let i = 0; i < positions.count; i++) {
        const origX = origPositions[i * 3];
        const origY = origPositions[i * 3 + 1];
        const origZ = origPositions[i * 3 + 2];

        let modX = origX;
        let modY = origY;
        let modZ = origZ;

        // Vertices corresponding to lower face / jaw
        if (origY < -0.4 && origZ > 0.4) {
          // Jaw drop downward
          modY -= jawDrop;
          // Mouth widening on X
          if (Math.abs(origX) > 0.2) {
            modX += (origX > 0 ? 1 : -1) * mouthWide;
          }
          // Pucker on Z
          modZ += lipPucker;
        }

        posArray[i * 3] = modX;
        posArray[i * 3 + 1] = modY;
        posArray[i * 3 + 2] = modZ;
      }
      positions.needsUpdate = true;

      // Pulse eye glow when listening or speaking
      const eyeOpacity = isSpeaking ? 0.95 + Math.sin(time * 16) * 0.05 : isListening ? 0.6 + Math.sin(time * 6) * 0.3 : 0.8;
      eyeMat.opacity = eyeOpacity;

      // Wireframe opacity reactive to Arc Reactor Output
      wireframeMat.opacity = (arcOutput / 100) * 0.4 + (isSpeaking ? 0.15 : 0);

      // Drift floating particles
      const partPos = particleGeo.attributes.position.array as Float32Array;
      for (let p = 1; p < partPos.length; p += 3) {
        partPos[p] += 0.004;
        if (partPos[p] > 5) partPos[p] = -5;
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      headGeo.dispose();
      wireframeMat.dispose();
      pointsMat.dispose();
      eyeGeo.dispose();
      eyeMat.dispose();
      ringMat.dispose();
      arcCollarMat.dispose();
      particleGeo.dispose();
      particlePointsMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [theme, isSpeaking, isListening, arcOutput]);

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden">
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Holographic Radar / Targeting Overlay Graphics */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {/* Outer Circular Reticle */}
        <div
          className="w-72 h-72 rounded-full border border-dashed opacity-25 animate-spin"
          style={{
            borderColor: THEMES[theme].primary,
            animationDuration: '30s',
          }}
        />

        {/* Inner Tactical Target Crosshairs */}
        <div
          className="w-88 h-88 rounded-full border border-current opacity-15"
          style={{ color: THEMES[theme].primary }}
        />

        {/* Status Callout Badge */}
        <div className="absolute bottom-4 left-6 flex items-center gap-2 px-3 py-1 bg-black/60 border border-slate-700/60 rounded backdrop-blur-sm text-xs font-mono">
          <span
            className="w-2 h-2 rounded-full animate-ping"
            style={{ backgroundColor: THEMES[theme].primary }}
          />
          <span className="text-slate-300">AVATAR MESH:</span>
          <span className="font-bold uppercase tracking-wider" style={{ color: THEMES[theme].primary }}>
            {isSpeaking ? 'VOICE SYNC (VISEME ACTIVE)' : isListening ? 'AUDIO INPUT STREAM' : 'IDLE / RECEPTIVE'}
          </span>
        </div>

        {/* Arc Core Output Display */}
        <div className="absolute bottom-4 right-6 flex items-center gap-2 px-3 py-1 bg-black/60 border border-slate-700/60 rounded backdrop-blur-sm text-xs font-mono">
          <span className="text-slate-400">ARC REACTOR:</span>
          <span className="font-bold text-emerald-400">{Math.round(arcOutput)}%</span>
        </div>
      </div>
    </div>
  );
};
