'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface FuturisticCyberMonolithProps {
  scrollProgress: number; // 0 to 1
}

export function FuturisticCyberMonolith({ scrollProgress }: FuturisticCyberMonolithProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeMode, setActiveMode] = useState<'standby' | 'hypercharge' | 'exploded' | 'quantum'>('hypercharge');
  const [telemetry, setTelemetry] = useState({
    voltage: 802.4,
    power: 349.8,
    efficiency: 99.6,
    thermal: 32.1,
    fluxRate: 1420,
  });

  // State refs to pass into Three.js animation loop without re-triggering effects
  const scrollRef = useRef(scrollProgress);
  const modeRef = useRef(activeMode);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isHovered: false });
  const pulseRef = useRef(0);

  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    modeRef.current = activeMode;
  }, [activeMode]);

  // Telemetry real-time micro-fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => ({
        voltage: +(798 + Math.sin(Date.now() * 0.003) * 6).toFixed(1),
        power: +(348 + Math.cos(Date.now() * 0.002) * 4).toFixed(1),
        efficiency: +(99.4 + Math.sin(Date.now() * 0.001) * 0.3).toFixed(2),
        thermal: +(31.8 + Math.sin(Date.now() * 0.0007) * 1.2).toFixed(1),
        fluxRate: Math.round(1400 + Math.sin(Date.now() * 0.004) * 80),
      }));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ── 1. SCENE & CAMERA SETUP ──────────────────────────────────────────
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    // Subtle cybernetic fog for depth
    scene.fog = new THREE.FogExp2(0xd8dcde, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 7.2);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // ── 2. LIGHTING ─────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    const rimLightCyan = new THREE.PointLight(0x00f5d4, 6, 12);
    rimLightCyan.position.set(-3, 2, 2);
    scene.add(rimLightCyan);

    const rimLightLime = new THREE.PointLight(0xc8f369, 5, 12);
    rimLightLime.position.set(3, -2, 2);
    scene.add(rimLightLime);

    const coreLight = new THREE.PointLight(0x00f5d4, 8, 6);
    coreLight.position.set(0, 0.3, 0);
    scene.add(coreLight);

    // ── 3. ROOT MONOLITH ASSEMBLY ────────────────────────────────────────
    const monolithRoot = new THREE.Group();
    scene.add(monolithRoot);

    // ── A. CYBER FLOOR PLATFORM & RINGS ──
    const platformGroup = new THREE.Group();
    platformGroup.position.y = -2.2;
    monolithRoot.add(platformGroup);

    // Concentric glowing rings on floor
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x111312, wireframe: true, transparent: true, opacity: 0.35 });
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x00f5d4, wireframe: true, transparent: true, opacity: 0.5 });
    const floorRing1 = new THREE.Mesh(new THREE.RingGeometry(1.8, 2.4, 32), ringMat1);
    floorRing1.rotation.x = -Math.PI / 2;
    platformGroup.add(floorRing1);

    const floorRing2 = new THREE.Mesh(new THREE.RingGeometry(2.7, 3.2, 48), ringMat2);
    floorRing2.rotation.x = -Math.PI / 2;
    platformGroup.add(floorRing2);

    // Monolith Pedestal
    const baseGeo = new THREE.CylinderGeometry(1.4, 1.6, 0.25, 8);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1b1f22,
      roughness: 0.3,
      metalness: 0.8,
    });
    const pedestal = new THREE.Mesh(baseGeo, baseMat);
    platformGroup.add(pedestal);

    // ── B. EXPLODABLE CHASSIS PANELS (LEFT & RIGHT) ──
    // Left Shell Armor
    const shellShape = new THREE.BoxGeometry(0.55, 3.8, 0.95);
    const shellMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.15,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
    });

    const leftShell = new THREE.Mesh(shellShape, shellMat);
    leftShell.position.set(-0.55, 0.1, 0);
    monolithRoot.add(leftShell);

    // Left Shell Cyber Accents (Neon vertical line)
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4 });
    const leftGlowLine = new THREE.Mesh(new THREE.BoxGeometry(0.04, 3.6, 0.04), lineMat);
    leftGlowLine.position.set(0.28, 0, 0.48);
    leftShell.add(leftGlowLine);

    // Right Shell Armor
    const rightShell = new THREE.Mesh(shellShape, shellMat);
    rightShell.position.set(0.55, 0.1, 0);
    monolithRoot.add(rightShell);

    const rightGlowLine = new THREE.Mesh(new THREE.BoxGeometry(0.04, 3.6, 0.04), lineMat);
    rightGlowLine.position.set(-0.28, 0, 0.48);
    rightShell.add(rightGlowLine);

    // ── C. INTERNAL QUANTUM POWER CORE (REVEALED ON SCROLL) ──
    const coreGroup = new THREE.Group();
    coreGroup.position.set(0, 0.1, 0);
    monolithRoot.add(coreGroup);

    // Central Obsidian Column
    const spineGeo = new THREE.BoxGeometry(0.35, 3.9, 0.6);
    const spineMat = new THREE.MeshStandardMaterial({
      color: 0x0d1114,
      metalness: 0.95,
      roughness: 0.2,
    });
    const spine = new THREE.Mesh(spineGeo, spineMat);
    coreGroup.add(spine);

    // Luminescent Energy Reactor (Crystal Prism)
    const reactorGeo = new THREE.CylinderGeometry(0.18, 0.18, 2.2, 6);
    const reactorMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const reactor = new THREE.Mesh(reactorGeo, reactorMat);
    reactor.position.set(0, 0.3, 0.12);
    coreGroup.add(reactor);

    // Holographic Energy Beam Inside Reactor
    const beamGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.4, 16);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
    });
    const innerBeam = new THREE.Mesh(beamGeo, beamMat);
    innerBeam.position.set(0, 0.3, 0.12);
    coreGroup.add(innerBeam);

    // 3 Gyroscopic Magnetic Rings Orbiting the Core
    const ringGeo1 = new THREE.TorusGeometry(0.46, 0.025, 16, 64);
    const gyroRingMat1 = new THREE.MeshBasicMaterial({ color: 0xc8f369 });
    const gyroRing1 = new THREE.Mesh(ringGeo1, gyroRingMat1);
    gyroRing1.position.set(0, 0.6, 0.12);
    coreGroup.add(gyroRing1);

    const ringGeo2 = new THREE.TorusGeometry(0.58, 0.02, 16, 64);
    const gyroRingMat2 = new THREE.MeshBasicMaterial({ color: 0x00f5d4 });
    const gyroRing2 = new THREE.Mesh(ringGeo2, gyroRingMat2);
    gyroRing2.position.set(0, 0.1, 0.12);
    coreGroup.add(gyroRing2);

    const ringGeo3 = new THREE.TorusGeometry(0.5, 0.022, 16, 64);
    const gyroRingMat3 = new THREE.MeshBasicMaterial({ color: 0x8b5cf6 });
    const gyroRing3 = new THREE.Mesh(ringGeo3, gyroRingMat3);
    gyroRing3.position.set(0, -0.4, 0.12);
    coreGroup.add(gyroRing3);

    // ── D. LASER SCANNER PLANE ──
    const laserGeo = new THREE.PlaneGeometry(1.6, 0.03);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const laserScanner = new THREE.Mesh(laserGeo, laserMat);
    laserScanner.position.set(0, 0, 0.52);
    monolithRoot.add(laserScanner);

    // ── E. FLOATING ENERGY PARTICLE STORM ──
    const particleCount = 450;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleVelocities: { x: number; y: number; z: number; speed: number; radius: number; angle: number }[] = [];

    const cyanColor = new THREE.Color(0x00f5d4);
    const limeColor = new THREE.Color(0xc8f369);
    const violetColor = new THREE.Color(0x8b5cf6);

    for (let i = 0; i < particleCount; i++) {
      const radius = 0.8 + Math.random() * 2.5;
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 4.5;

      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius;

      particleVelocities.push({
        x: 0,
        y: 0.004 + Math.random() * 0.012,
        z: 0,
        speed: 0.008 + Math.random() * 0.02,
        radius,
        angle,
      });

      // Palette mix
      const choice = Math.random();
      const c = choice < 0.45 ? cyanColor : choice < 0.8 ? limeColor : violetColor;
      particleColors[i * 3] = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    monolithRoot.add(particles);

    // ── 4. MOUSE EVENT HANDLERS ──────────────────────────────────────────
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = normX * 0.45;
      mouseRef.current.targetY = normY * 0.35;
      mouseRef.current.isHovered = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
      mouseRef.current.isHovered = false;
    };

    const handleClick = () => {
      pulseRef.current = 1.0; // Trigger holographic shockwave
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('click', handleClick);

    // ── 5. RESIZE HANDLER ────────────────────────────────────────────────
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // ── 6. ANIMATION LOOP ────────────────────────────────────────────────
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Fluid mouse damping
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      // Base idle yaw + mouse tilt
      monolithRoot.rotation.y = elapsedTime * 0.25 + mouseRef.current.x;
      monolithRoot.rotation.x = mouseRef.current.y * 0.6;

      // Floor rings counter-rotation
      floorRing1.rotation.z = -elapsedTime * 0.2;
      floorRing2.rotation.z = elapsedTime * 0.15;

      // Dynamic Scroll Progress Calculation
      const currentScroll = scrollRef.current;
      const isExplodedMode = modeRef.current === 'exploded';

      // ── CHASSIS EXPLODED VIEW ANIMATION (SCROLL OR MODE DRIVEN) ──
      // At higher scroll or in 'exploded' mode, armor plates separate laterally in 3D!
      const explodeFactor = isExplodedMode
        ? 1.0
        : Math.min(Math.max((currentScroll - 0.05) / 0.5, 0), 1.0);

      const targetSeparation = 0.55 + explodeFactor * 1.1; // Extends out to 1.65
      leftShell.position.x = -targetSeparation;
      rightShell.position.x = targetSeparation;

      // Shells tilt outwards slightly when exploded for dramatic presentation
      leftShell.rotation.z = explodeFactor * 0.12;
      rightShell.rotation.z = -explodeFactor * 0.12;

      // Gyroscope Ring Rotations
      const speedMultiplier = modeRef.current === 'hypercharge' ? 3.0 : 1.5;
      gyroRing1.rotation.x = elapsedTime * 1.8 * speedMultiplier;
      gyroRing1.rotation.y = elapsedTime * 1.2 * speedMultiplier;

      gyroRing2.rotation.y = -elapsedTime * 2.2 * speedMultiplier;
      gyroRing2.rotation.z = elapsedTime * 1.5 * speedMultiplier;

      gyroRing3.rotation.x = -elapsedTime * 1.4 * speedMultiplier;
      gyroRing3.rotation.z = -elapsedTime * 2.5 * speedMultiplier;

      // Laser Scanner Oscillates up and down
      laserScanner.position.y = Math.sin(elapsedTime * 2.4) * 1.7;
      laserScanner.material.opacity = 0.5 + Math.sin(elapsedTime * 5) * 0.3;

      // Core Reactor Pulse
      const corePulse = 1.0 + Math.sin(elapsedTime * 6) * 0.12 + pulseRef.current * 0.4;
      reactor.scale.set(corePulse, 1, corePulse);
      coreLight.intensity = (6 + Math.sin(elapsedTime * 8) * 2 + pulseRef.current * 10);

      // Decay click shockwave
      pulseRef.current *= 0.94;

      // Particle Vortex Update
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const vel = particleVelocities[i];
        vel.angle += vel.speed * (1 + explodeFactor * 0.8);

        // Vortex orbits
        positions[i * 3] = Math.cos(vel.angle) * vel.radius;
        positions[i * 3 + 2] = Math.sin(vel.angle) * vel.radius;

        // Vertical drift with loop
        positions[i * 3 + 1] += vel.y;
        if (positions[i * 3 + 1] > 2.2) {
          positions[i * 3 + 1] = -2.2;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Dynamic Camera parallax tilt on scroll
      camera.position.y = 0.5 - currentScroll * 1.2;
      camera.position.z = 7.2 - currentScroll * 1.4;
      camera.lookAt(0, 0.1, 0);

      renderer.render(scene, camera);
    };

    animate();

    // ── 7. CLEANUP ON UNMOUNT ───────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('click', handleClick);

      renderer.dispose();
      baseGeo.dispose();
      baseMat.dispose();
      shellShape.dispose();
      shellMat.dispose();
      spineGeo.dispose();
      spineMat.dispose();
      reactorGeo.dispose();
      reactorMat.dispose();
      beamGeo.dispose();
      beamMat.dispose();
      ringGeo1.dispose();
      ringGeo2.dispose();
      ringGeo3.dispose();
      laserGeo.dispose();
      laserMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[640px] sm:h-[720px] md:h-[820px] flex items-center justify-center select-none overflow-hidden">
      
      {/* ── THREE.JS WEBGL CANVAS CONTAINER ── */}
      <div
        ref={mountRef}
        className="absolute inset-0 z-10 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* ── HOLOGRAPHIC HUD CORNER BRACKETS ── */}
      <div className="absolute inset-4 sm:inset-8 z-20 pointer-events-none flex flex-col justify-between">
        
        {/* Top telemetry band */}
        <div className="flex items-start justify-between">
          <div className="space-y-1.5 font-telemetry text-[11px] text-black/60 tracking-wider">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00f5d4] animate-ping" />
              <span className="font-bold text-[#111312] uppercase tracking-widest text-xs">
                3D CORE // ACTIVE
              </span>
            </div>
            <p className="text-[10px] text-black/40">
              SYS.ID: 800V-SK-ULTRA • SEED: 0x9AF4
            </p>
            <p className="text-[10px] font-mono text-[#00a896]">
              PARALLAX: 6-DOF ROTATIONAL LERP
            </p>
          </div>

          <div className="text-right space-y-1 font-telemetry text-[11px]">
            <div className="text-[#111312] font-bold text-sm">
              {telemetry.power} <span className="text-[10px] font-normal text-black/50">kW DC</span>
            </div>
            <div className="text-[10px] text-black/50">
              POTENTIAL: {telemetry.voltage} V
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold">
              STABILITY {telemetry.efficiency}%
            </div>
          </div>
        </div>

        {/* Bottom Interactive HUD Action Matrix */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 pointer-events-auto">
          
          {/* Mode switch buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-white/70 backdrop-blur-md rounded-2xl border border-black/[0.08] shadow-sm">
            {(
              [
                { id: 'hypercharge', label: 'HyperCharge' },
                { id: 'exploded', label: 'Explode Chassis' },
                { id: 'quantum', label: 'Quantum Flux' },
              ] as const
            ).map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setActiveMode(btn.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-telemetry tracking-wide transition-all ${
                  activeMode === btn.id
                    ? 'bg-[#111312] text-white shadow-xs font-semibold'
                    : 'text-black/60 hover:text-black hover:bg-black/5'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Interactive Hint */}
          <div className="text-right font-telemetry text-[10px] text-black/45 space-y-0.5">
            <div>[CLICK TO DISCHARGE SHOCKWAVE]</div>
            <div>[DRAG / MOVE MOUSE TO TILT 3D MONOLITH]</div>
          </div>

        </div>

      </div>

    </div>
  );
}
