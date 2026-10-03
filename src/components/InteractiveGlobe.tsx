import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CITIES_DATABASE, GeoLocation, GlobeViewMode, SATELLITES_DATABASE, SatelliteAsset } from '../types/earth';
import { sound } from '../services/soundEffects';

interface InteractiveGlobeProps {
  viewMode: GlobeViewMode;
  targetLat: number;
  targetLng: number;
  targetZoom: number;
  autoRotate: boolean;
  selectedLocation: GeoLocation | null;
  onSelectLocation: (loc: GeoLocation) => void;
  onSelectSatellite?: (sat: SatelliteAsset) => void;
}

// Convert Lat/Lng to 3D Cartesian coordinates on sphere of given radius
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export const InteractiveGlobe: React.FC<InteractiveGlobeProps> = ({
  viewMode,
  targetLat,
  targetLng,
  targetZoom,
  autoRotate,
  selectedLocation,
  onSelectLocation,
  onSelectSatellite,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetLookAtRef = useRef<{ lat: number; lng: number; zoom: number }>({
    lat: targetLat,
    lng: targetLng,
    zoom: targetZoom,
  });

  // Track latest props
  useEffect(() => {
    targetLookAtRef.current = { lat: targetLat, lng: targetLng, zoom: targetZoom };
  }, [targetLat, targetLng, targetZoom]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    let width = container.clientWidth || 600;
    let height = container.clientHeight || 500;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, targetZoom * 3.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Deep Space Starfield
    const starCount = 600;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 60;
      starPos[i + 1] = (Math.random() - 0.5) * 60;
      starPos[i + 2] = (Math.random() - 0.5) * 60;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x88ccff,
      size: 0.08,
      transparent: true,
      opacity: 0.7,
    });
    const starfield = new THREE.Points(starGeo, starMat);
    scene.add(starfield);

    // 3. Globe Master Group
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    const EARTH_RADIUS = 2.0;

    // Procedural High-Contrast Earth Texture Canvas
    const createEarthTexture = (mode: GlobeViewMode) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);

      // Deep Ocean Base
      const oceanColor = mode === 'holographic' ? '#031525' : mode === 'meteorology' ? '#0a192f' : '#051329';
      ctx.fillStyle = oceanColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stylized landmass continents
      const landColor = mode === 'holographic' ? '#00f3ff' : mode === 'meteorology' ? '#00b4d8' : '#1b4332';
      ctx.fillStyle = landColor;

      // Stylized continents (Americas, Eurasia, Africa, Australia, Antarctica)
      // North America
      ctx.beginPath();
      ctx.ellipse(250, 160, 100, 70, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // South America
      ctx.beginPath();
      ctx.ellipse(320, 320, 60, 110, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Europe / Eurasia
      ctx.beginPath();
      ctx.ellipse(600, 150, 170, 80, 0, 0, Math.PI * 2);
      ctx.fill();

      // Africa
      ctx.beginPath();
      ctx.ellipse(540, 270, 75, 110, 0, 0, Math.PI * 2);
      ctx.fill();

      // Australia
      ctx.beginPath();
      ctx.ellipse(820, 340, 60, 50, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Lat/Lng Coordinate Grid Lines
      ctx.strokeStyle = mode === 'holographic' ? 'rgba(0, 243, 255, 0.35)' : 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      for (let y = 0; y <= canvas.height; y += 42) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      for (let x = 0; x <= canvas.width; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      return tex;
    };

    // Earth Sphere Mesh
    const earthGeo = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      map: createEarthTexture(viewMode),
      specular: new THREE.Color(0x224488),
      shininess: 15,
      wireframe: viewMode === 'holographic',
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // 4. Glowing Atmosphere Rim Halo (Fresnel Shader effect)
    const haloGeo = new THREE.SphereGeometry(EARTH_RADIUS * 1.05, 32, 32);
    const haloMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
          gl_FragColor = vec4(0.0, 0.85, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    scene.add(haloMesh);

    // 5. Cloud Layer Sphere
    const cloudGeo = new THREE.SphereGeometry(EARTH_RADIUS * 1.015, 48, 48);
    const createCloudTexture = () => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 256;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.fillRect(0, 0, 512, 256);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        for (let i = 0; i < 40; i++) {
          ctx.beginPath();
          ctx.arc(Math.random() * 512, Math.random() * 256, 15 + Math.random() * 35, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      return new THREE.CanvasTexture(c);
    };

    const cloudMat = new THREE.MeshPhongMaterial({
      map: createCloudTexture(),
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    earthGroup.add(cloudMesh);

    // 6. City Pinpoint Markers & Pulsating Beacons
    const cityMarkersGroup = new THREE.Group();
    earthGroup.add(cityMarkersGroup);

    CITIES_DATABASE.forEach((city) => {
      const pos = latLngToVector3(city.lat, city.lng, EARTH_RADIUS);
      // Small beacon sphere
      const beaconGeo = new THREE.SphereGeometry(0.032, 12, 12);
      const isSelected = selectedLocation?.id === city.id;
      const beaconMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xffb703 : 0x00f3ff,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.copy(pos);
      beacon.userData = { cityId: city.id, city };
      cityMarkersGroup.add(beacon);

      // Beacon ring
      const ringGeo = new THREE.RingGeometry(0.04, 0.065, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xffb703 : 0x00f3ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos.clone().multiplyScalar(1.002));
      ring.lookAt(pos.clone().multiplyScalar(2));
      cityMarkersGroup.add(ring);
    });

    // 7. Satellite Orbital Rings & Moving Probes
    const satelliteGroup = new THREE.Group();
    earthGroup.add(satelliteGroup);

    const satObjects: Array<{ mesh: THREE.Mesh; sat: SatelliteAsset; speed: number; angle: number; radius: number; normal: THREE.Vector3 }> = [];

    SATELLITES_DATABASE.forEach((sat, idx) => {
      const orbitRadius = EARTH_RADIUS + (sat.altitudeKm / 1500);
      const incRad = THREE.MathUtils.degToRad(sat.inclinationDeg);

      // Orbital ellipse path
      const pathGeo = new THREE.BufferGeometry();
      const pathPoints: THREE.Vector3[] = [];
      const segments = 64;
      for (let s = 0; s <= segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        const x = Math.cos(theta) * orbitRadius;
        const y = Math.sin(theta) * orbitRadius * Math.sin(incRad);
        const z = Math.sin(theta) * orbitRadius * Math.cos(incRad);
        pathPoints.push(new THREE.Vector3(x, y, z));
      }
      pathGeo.setFromPoints(pathPoints);
      const pathMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(sat.color),
        transparent: true,
        opacity: 0.35,
      });
      const pathLine = new THREE.Line(pathGeo, pathMat);
      satelliteGroup.add(pathLine);

      // Satellite probe body
      const satGeo = new THREE.BoxGeometry(0.045, 0.045, 0.08);
      const satMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(sat.color) });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      satelliteGroup.add(satMesh);

      satObjects.push({
        mesh: satMesh,
        sat,
        speed: 0.005 + (idx * 0.002),
        angle: (idx * Math.PI) / 2.5,
        radius: orbitRadius,
        normal: new THREE.Vector3(0, Math.sin(incRad), Math.cos(incRad)),
      });
    });

    // 8. Directional Sun Lighting
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.4);
    sunLight.position.set(10, 6, 8);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x223344, 0.85);
    scene.add(ambientLight);

    // 9. Interactive Drag / Touch Controls
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let sphericalCoords = { phi: Math.PI / 2, theta: 0, radius: camera.position.z };

    const onPointerDown = (clientX: number, clientY: number) => {
      isDragging = true;
      prevMousePos = { x: clientX, y: clientY };
    };

    const onPointerMove = (clientX: number, clientY: number) => {
      if (!isDragging) return;
      const deltaX = clientX - prevMousePos.x;
      const deltaY = clientY - prevMousePos.y;

      earthGroup.rotation.y += deltaX * 0.005;
      earthGroup.rotation.x += deltaY * 0.005;

      prevMousePos = { x: clientX, y: clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const handleMouseDown = (e: MouseEvent) => onPointerDown(e.clientX, e.clientY);
    const handleMouseMove = (e: MouseEvent) => onPointerMove(e.clientX, e.clientY);
    const handleMouseUp = () => onPointerUp();

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchEnd = () => onPointerUp();

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.002;
      camera.position.z = Math.max(3.2, Math.min(10.0, camera.position.z + zoomDelta));
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    domEl.addEventListener('wheel', handleWheel, { passive: false });

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 600;
      height = container.clientHeight || 500;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Raycaster for clicking city beacons
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = domEl.getBoundingClientRect();
      mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVector.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      raycaster.setFromCamera(mouseVector, camera);

      const intersects = raycaster.intersectObjects(cityMarkersGroup.children);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData?.city) {
          sound.playChirp();
          onSelectLocation(hit.userData.city);
        }
      }
    };
    domEl.addEventListener('click', handleClick);

    // 10. Animation Loop & Camera Slerp
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Idle planet rotation
      if (autoRotate && !isDragging) {
        earthGroup.rotation.y += 0.0018;
      }
      cloudMesh.rotation.y += 0.0024;

      // Update orbiting satellites
      satObjects.forEach((item) => {
        item.angle += item.speed;
        const incRad = THREE.MathUtils.degToRad(item.sat.inclinationDeg);
        const x = Math.cos(item.angle) * item.radius;
        const y = Math.sin(item.angle) * item.radius * Math.sin(incRad);
        const z = Math.sin(item.angle) * item.radius * Math.cos(incRad);
        item.mesh.position.set(x, y, z);
      });

      // Camera Smooth Fly-To / Focus on Target Lat/Lng
      const { lat, lng, zoom } = targetLookAtRef.current;
      const targetPos = latLngToVector3(lat, lng, zoom * 2.4);

      // Smoothly slerp camera position towards target view vector
      if (!isDragging) {
        camera.position.lerp(targetPos, 0.04);
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      domEl.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domEl.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      domEl.removeEventListener('wheel', handleWheel);
      domEl.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);

      renderer.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      cloudGeo.dispose();
      cloudMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [viewMode, autoRotate, selectedLocation]);

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden bg-radial from-slate-950 via-black to-black">
      {/* Three.js Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Futuristic HUD Tactical Reticle Overlay */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {/* Outer Circular Reticle */}
        <div className="w-72 sm:w-96 h-72 sm:h-96 rounded-full border border-dashed border-cyan-500/25 animate-spin" style={{ animationDuration: '45s' }} />
        {/* Precision Crosshairs */}
        <div className="w-4 h-4 border border-cyan-400/50 rounded-full flex items-center justify-center">
          <div className="w-1 h-1 bg-cyan-400 rounded-full" />
        </div>

        {/* Telemetry Corner Callouts */}
        <div className="absolute top-4 left-4 flex flex-col gap-1 font-mono text-[10px] text-cyan-400/80 bg-black/60 px-2.5 py-1.5 rounded border border-cyan-500/30 backdrop-blur-sm">
          <span>ORBITAL RECON: ACTIVE</span>
          <span>LAT: {targetLat.toFixed(4)}° | LNG: {targetLng.toFixed(4)}°</span>
          <span>TARGET LOCK: {selectedLocation ? selectedLocation.name.toUpperCase() : 'FREE EXPLORATION'}</span>
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-2 font-mono text-[10px] text-slate-400 bg-black/60 px-2.5 py-1.5 rounded border border-slate-800 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>SATELLITE DOWNLINK: 100% NOMINAL</span>
        </div>
      </div>
    </div>
  );
};
