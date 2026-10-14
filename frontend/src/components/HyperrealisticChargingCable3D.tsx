'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface HyperrealisticChargingCable3DProps {
  scrollProgress: number; // 0 to 1
  stageNumber: string;
  stageName: string;
  isEvenStage: boolean;
}

export function HyperrealisticChargingCable3D({
  scrollProgress,
  stageNumber,
  stageName,
  isEvenStage,
}: HyperrealisticChargingCable3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // User interaction states
  const [isHovered, setIsHovered] = useState(false);
  const [isSurging, setIsSurging] = useState(false);
  const [hudPower, setHudPower] = useState(350);

  // References for the 3D animation loop
  const scrollRef = useRef(scrollProgress);
  scrollRef.current = scrollProgress;

  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const surgeRef = useRef(false);
  surgeRef.current = isSurging;

  useEffect(() => {
    if (!canvasRef.current || !mountRef.current) return;

    const canvas = canvasRef.current;
    const width = mountRef.current.clientWidth || 380;
    const height = mountRef.current.clientHeight || 380;

    // ── 1. Scene & Camera ──
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.8);

    // ── 2. Renderer ──
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // ── 3. High-End Studio Lighting ──
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Key directional light (cool white)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    // Rim specular light (metallic sheen)
    const rimLight = new THREE.DirectionalLight(0xddeeff, 1.8);
    rimLight.position.set(-6, -4, 4);
    scene.add(rimLight);

    // Cyan Neon Glow Point Light (at connector nozzle)
    const neonCyanPoint = new THREE.PointLight(0x00e5ff, 4.0, 6);
    neonCyanPoint.position.set(0.6, 0.8, 0.8);
    scene.add(neonCyanPoint);

    // Volt-Green Accent Light
    const voltGreenPoint = new THREE.PointLight(0xc8f369, 1.8, 5);
    voltGreenPoint.position.set(-1.2, -0.6, 1.0);
    scene.add(voltGreenPoint);

    // ── 4. PBR Materials ──
    // Brushed Titanium Chassis
    const titaniumMat = new THREE.MeshStandardMaterial({
      color: 0x222524,
      metalness: 0.88,
      roughness: 0.22,
    });

    // Dark Matte Industrial Rubber
    const rubberMat = new THREE.MeshStandardMaterial({
      color: 0x141615,
      metalness: 0.08,
      roughness: 0.82,
    });

    // Cable Conduit (High-flex liquid-cooled rubber)
    const cableMat = new THREE.MeshStandardMaterial({
      color: 0x121413,
      metalness: 0.15,
      roughness: 0.65,
    });

    // Emissive Cyan LED Halo Ring
    const cyanLedMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 2.2,
      roughness: 0.1,
    });

    // Gold-Plated High-Voltage DC Terminals
    const goldPinMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.18,
      emissive: 0xffaa00,
      emissiveIntensity: 0.25,
    });

    // Glowing Core Pin Tips
    const pinGlowMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 2.5,
    });

    // ── 5. Connector Gun Assembly (Group) ──
    const gunGroup = new THREE.Group();
    scene.add(gunGroup);

    // Barrel / Nozzle Collar (Chamfered Bezel)
    const nozzleGeometry = new THREE.CylinderGeometry(0.82, 0.88, 0.9, 36);
    nozzleGeometry.rotateZ(Math.PI / 4);
    const nozzleMesh = new THREE.Mesh(nozzleGeometry, titaniumMat);
    nozzleMesh.position.set(0.5, 0.6, 0);
    gunGroup.add(nozzleMesh);

    // Cyan Neon Energy Halo Ring around Nozzle
    const haloGeo = new THREE.TorusGeometry(0.85, 0.045, 16, 48);
    haloGeo.rotateY(Math.PI / 4);
    haloGeo.rotateX(Math.PI / 4);
    const haloMesh = new THREE.Mesh(haloGeo, cyanLedMat);
    haloMesh.position.set(0.82, 0.92, 0.32);
    gunGroup.add(haloMesh);

    // Ergonomic Handle Grip
    const handleGeo = new THREE.CylinderGeometry(0.42, 0.36, 1.8, 24);
    handleGeo.rotateZ(-Math.PI / 6);
    const handleMesh = new THREE.Mesh(handleGeo, rubberMat);
    handleMesh.position.set(-0.25, -0.45, 0);
    gunGroup.add(handleMesh);

    // Ribbed Grip Insets (Tactile finger grooves)
    for (let i = 0; i < 4; i++) {
      const ribGeo = new THREE.TorusGeometry(0.44 - i * 0.015, 0.03, 12, 24);
      ribGeo.rotateX(Math.PI / 2);
      ribGeo.rotateZ(-Math.PI / 6);
      const ribMesh = new THREE.Mesh(ribGeo, titaniumMat);
      ribMesh.position.set(-0.1 - i * 0.18, -0.15 - i * 0.32, 0);
      gunGroup.add(ribMesh);
    }

    // Top Mechanical Latch Lever
    const latchGeo = new THREE.BoxGeometry(0.85, 0.16, 0.35);
    const latchMesh = new THREE.Mesh(latchGeo, titaniumMat);
    latchMesh.position.set(0.2, 1.15, 0);
    latchMesh.rotation.z = 0.12;
    gunGroup.add(latchMesh);

    // Latch Indicator Stripe
    const latchStripeGeo = new THREE.BoxGeometry(0.4, 0.04, 0.36);
    const latchStripe = new THREE.Mesh(latchStripeGeo, cyanLedMat);
    latchStripe.position.set(0.2, 1.22, 0);
    latchStripe.rotation.z = 0.12;
    gunGroup.add(latchStripe);

    // Heavy DC Fast-Charging Pins (CCS2 Dual Combos)
    const dcPin1 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.45, 18), goldPinMat);
    dcPin1.position.set(0.9, 0.85, 0.5);
    dcPin1.rotation.z = Math.PI / 4;
    gunGroup.add(dcPin1);

    const dcPin2 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.45, 18), goldPinMat);
    dcPin2.position.set(1.05, 0.7, 0.25);
    dcPin2.rotation.z = Math.PI / 4;
    gunGroup.add(dcPin2);

    // Glowing core nodes on the pins
    const pinGlow1 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), pinGlowMat);
    pinGlow1.position.set(1.02, 0.97, 0.5);
    gunGroup.add(pinGlow1);

    const pinGlow2 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), pinGlowMat);
    pinGlow2.position.set(1.17, 0.82, 0.25);
    gunGroup.add(pinGlow2);

    // Rear Strain Relief Collar (Where flexible cable attaches)
    const strainCollarGeo = new THREE.CylinderGeometry(0.34, 0.28, 0.8, 20);
    strainCollarGeo.rotateZ(Math.PI / 3);
    const strainCollar = new THREE.Mesh(strainCollarGeo, rubberMat);
    strainCollar.position.set(-0.8, -1.15, 0);
    gunGroup.add(strainCollar);

    // ── 6. Dynamic Flexible Spline Cable (Organic 3D Tube) ──
    let cableMesh: THREE.Mesh | null = null;
    let energyPulseMesh: THREE.Mesh | null = null;

    const updateCableSpline = (flexOffset: number) => {
      if (cableMesh) scene.remove(cableMesh);
      if (energyPulseMesh) scene.remove(energyPulseMesh);

      // Points form an organic catenary curve snaking backwards into space
      const p0 = new THREE.Vector3(-4.5, -3.8, -2.5);
      const p1 = new THREE.Vector3(-3.0, -1.8 + flexOffset * 0.4, -1.2);
      const p2 = new THREE.Vector3(-2.0, -2.2 - flexOffset * 0.3, -0.6);
      const p3 = new THREE.Vector3(-1.0, -1.35, 0);

      const curve = new THREE.CatmullRomCurve3([p0, p1, p2, p3]);

      // Outer heavy rubber tube
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.16, 16, false);
      cableMesh = new THREE.Mesh(tubeGeo, cableMat);
      scene.add(cableMesh);

      // Internal glowing photon pulse thread
      const pulseGeo = new THREE.TubeGeometry(curve, 32, 0.05, 10, false);
      energyPulseMesh = new THREE.Mesh(pulseGeo, cyanLedMat);
      scene.add(energyPulseMesh);
    };

    updateCableSpline(0);

    // ── 7. Animation Loop ──
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const progress = scrollRef.current;

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      // Dynamic scroll-driven 3D orientation:
      // Gun turns left/right to aim into the current stage's narrative
      const waveAngle = Math.sin(progress * Math.PI * 3) * 0.45;
      const pitchAngle = Math.cos(progress * Math.PI * 4) * 0.15;

      // Mouse interactive tilt
      gunGroup.rotation.y = waveAngle + mouseRef.current.x * 0.7;
      gunGroup.rotation.x = pitchAngle + mouseRef.current.y * 0.5;
      gunGroup.rotation.z = Math.sin(elapsedTime * 1.5) * 0.04 - waveAngle * 0.3;

      // Gentle organic float
      gunGroup.position.y = Math.sin(elapsedTime * 2.0) * 0.08;

      // Cable flexes with scroll tension
      const cableTension = Math.sin(progress * Math.PI * 3 + elapsedTime * 1.2) * 0.6;
      updateCableSpline(cableTension);

      // Pulse neon lighting based on surge state and scroll
      if (surgeRef.current) {
        cyanLedMat.emissiveIntensity = 4.0 + Math.sin(elapsedTime * 18) * 2.0;
        neonCyanPoint.intensity = 7.0 + Math.sin(elapsedTime * 18) * 3.0;
      } else {
        cyanLedMat.emissiveIntensity = 2.0 + Math.sin(elapsedTime * 4.0) * 0.6;
        neonCyanPoint.intensity = 3.5 + Math.sin(elapsedTime * 4.0) * 0.8;
      }

      renderer.render(scene, camera);
    };

    animate();

    // ── 8. Resize Handler ──
    const handleResize = () => {
      if (!mountRef.current) return;
      const newW = mountRef.current.clientWidth || 380;
      const newH = mountRef.current.clientHeight || 380;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      scene.clear();
    };
  }, []);

  // Mouse move handler for 3D tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mountRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseRef.current.targetX = x;
    mouseRef.current.targetY = y;
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseRef.current.targetX = 0;
    mouseRef.current.targetY = 0;
  };

  // Interactive Click Surge
  const handleSurge = () => {
    setIsSurging(true);
    setHudPower(362.4);
    setTimeout(() => {
      setIsSurging(false);
      setHudPower(350);
    }, 1200);
  };

  return (
    <div
      ref={mountRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleSurge}
      className="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 flex items-center justify-center cursor-pointer select-none group"
      title="Interactive 3D EV Fast Charger — Move mouse to inspect in 3D, Click to trigger power surge"
    >
      {/* ── Ambient Radial Atmosphere Glow ── */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-700 pointer-events-none ${
          isSurging
            ? 'opacity-85 scale-110'
            : isHovered
            ? 'opacity-60 scale-105'
            : 'opacity-35 scale-100'
        }`}
        style={{
          background: isSurging
            ? 'radial-gradient(circle at center, rgba(0, 229, 255, 0.45) 0%, rgba(200, 243, 105, 0.25) 45%, transparent 75%)'
            : 'radial-gradient(circle at center, rgba(0, 229, 255, 0.25) 0%, rgba(17, 19, 18, 0.06) 60%, transparent 75%)',
          filter: 'blur(20px)',
        }}
      />

      {/* ── Click Surge Shockwave Pulse ── */}
      {isSurging && (
        <div className="absolute inset-4 rounded-full border-2 border-[#00E5FF] animate-ping pointer-events-none opacity-80" />
      )}

      {/* ── Real-Time 3D WebGL Canvas ── */}
      <canvas ref={canvasRef} className="w-full h-full pointer-events-none relative z-10" />

      {/* ── Floating OLED Telemetry HUD (Directly on the 3D unit) ── */}
      <div className="absolute -bottom-2 inset-x-0 flex flex-col items-center pointer-events-none z-20">
        <div className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-black/10 shadow-[0_10px_25px_rgba(0,0,0,0.1)] flex items-center gap-2 transition-transform group-hover:scale-105">
          <div
            className={`w-2 h-2 rounded-full ${
              isSurging
                ? 'bg-[#C8F369] shadow-[0_0_10px_#C8F369]'
                : 'bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]'
            } animate-pulse`}
          />
          <span className="text-[9.5px] font-mono font-bold text-[#111312] tracking-wider uppercase">
            {stageNumber} // {stageName}
          </span>
          <span className="text-[8.5px] font-mono text-black/55 border-l border-black/15 pl-1.5 flex items-center gap-1">
            <span className="font-bold text-[#111312]">{hudPower} kW</span>
            <span>{isSurging ? '⚡ SURGE' : '• 800V DC'}</span>
          </span>
        </div>
      </div>

    </div>
  );
}
