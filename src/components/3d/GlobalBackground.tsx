"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function Particles({ count = 3000 }) {
  const mesh = useRef<THREE.Points>(null);
  const { viewport, pointer } = useThree();

  // Generate random particle positions
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Spread them across a wide area to cover the screen
      positions[i * 3] = (Math.random() - 0.5) * 20;         // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;     // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2; // z
    }
    return positions;
  }, [count]);

  // Animation frame
  useFrame((state, delta) => {
    if (!mesh.current) return;

    // Slow rotation of the entire particle field
    mesh.current.rotation.x -= delta * 0.02;
    mesh.current.rotation.y += delta * 0.03;

    // Parallax reaction to mouse pointer (creates depth)
    const mouseX = (pointer.x * viewport.width) / 2;
    const mouseY = (pointer.y * viewport.height) / 2;
    
    // Shift the particle cloud opposite to the mouse direction
    mesh.current.position.x = THREE.MathUtils.lerp(mesh.current.position.x, mouseX * -0.05, 0.05);
    mesh.current.position.y = THREE.MathUtils.lerp(mesh.current.position.y, mouseY * -0.05, 0.05);
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particlesPosition, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#71717a" // Zinc-500
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default function GlobalBackground() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none opacity-80" style={{ backgroundColor: '#ffffff' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        {/* Subtle lighting not needed for pointsMaterial, but good if we add objects later */}
        <Particles count={4000} />
      </Canvas>
    </div>
  );
}
