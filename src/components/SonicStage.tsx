import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface SonicStageProps {
  isPlaying: boolean;
}

/**
 * SonicStage: 3D Spatial Audio Galaxy & WebGL Flight Stage for music.anuraaggrao.com.
 * Responsive to track playback, mouse parallax, and document scroll depth.
 */
export function SonicStage({ isPlaying }: SonicStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: window.devicePixelRatio < 2,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a0f, 8, 65);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 16);

    // 1. Fibonacci Spiral Particle Galaxy
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const originalRadii = new Float32Array(particleCount);
    const angles = new Float32Array(particleCount);

    const color1 = new THREE.Color(0xf59e0b); // Kai Amber/Fox
    const color2 = new THREE.Color(0xec4899); // Kitsune Neon Pink
    const color3 = new THREE.Color(0x8b5cf6); // Violet

    for (let i = 0; i < particleCount; i++) {
      const phi = i * 0.1375; // golden angle
      const r = Math.sqrt(i) * 0.65 + 1.2;
      originalRadii[i] = r;
      angles[i] = phi;

      positions[i * 3] = Math.cos(phi) * r;
      positions[i * 3 + 1] = Math.sin(phi) * r;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - (i * 0.08);

      const mixed = color1.clone().lerp(i % 2 === 0 ? color2 : color3, (i / particleCount));
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      vertexColors: true,
      size: 0.14,
      transparent: true,
      opacity: 0.65,
    });
    const galaxy = new THREE.Points(particleGeo, particleMat);
    scene.add(galaxy);

    // 2. Concentric Frequency Rings (Turntable Stator)
    const ringGroup = new THREE.Group();
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });

    for (let i = 1; i <= 4; i++) {
      const ringGeo = new THREE.RingGeometry(i * 2.4, i * 2.42, 48);
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2.5;
      ringMesh.position.y = -3;
      ringGroup.add(ringMesh);
    }
    scene.add(ringGroup);

    // Dynamic Camera Tracking & Scroll Lerp
    let targetZ = 16;
    let targetY = 0;
    let mouseX = 0;

    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
      targetZ = 16 - progress * 26;
      targetY = -progress * 4;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    const handlePointerMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    };
    window.addEventListener('mousemove', handlePointerMove, { passive: true });

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const active = isPlayingRef.current;

      // Camera lerp
      camera.position.z += (targetZ - camera.position.z) * 0.06;
      camera.position.y += (targetY - camera.position.y) * 0.06;
      camera.position.x += (mouseX * 1.4 - camera.position.x) * 0.05;
      camera.lookAt(0, camera.position.y - 0.2, camera.position.z - 15);

      // Rotate galaxy
      const spinSpeed = active ? 0.35 : 0.12;
      galaxy.rotation.z = elapsed * spinSpeed;

      // Pulse particle radius with audio rhythm simulation
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;
      const pulse = active
        ? 1 + Math.sin(elapsed * 6) * 0.12 + Math.cos(elapsed * 12) * 0.06
        : 1 + Math.sin(elapsed * 1.5) * 0.03;

      for (let i = 0; i < particleCount; i++) {
        const phi = angles[i] + elapsed * (active ? 0.08 : 0.02);
        const r = originalRadii[i] * pulse;
        posArr[i * 3] = Math.cos(phi) * r;
        posArr[i * 3 + 1] = Math.sin(phi) * r;
      }
      posAttr.needsUpdate = true;

      // Turntable ring counter-spin
      ringGroup.rotation.z = -elapsed * 0.15;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      ringMat.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-60"
      aria-hidden="true"
    />
  );
}
