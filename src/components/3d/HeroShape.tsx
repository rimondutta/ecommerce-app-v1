"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, Lightformer, ContactShadows, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

function AbstractShape() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Rotate the shape smoothly over time
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.15;
      meshRef.current.rotation.y += delta * 0.2;
      
      // Animate scale on hover
      const targetScale = hovered ? 1.05 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        <torusKnotGeometry args={[1.5, 0.4, 256, 64]} />
        <MeshTransmissionMaterial
          backside
          backsideThickness={1}
          thickness={0.8}
          chromaticAberration={0.06}
          anisotropicBlur={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          roughness={0.1}
          transmission={1}
          ior={1.5}
          color="#dcfce7" // Subtle green tint to match previous design aesthetics
        />
      </mesh>
    </Float>
  );
}

export default function HeroShape() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center opacity-80">
      <div className="w-full h-full max-w-[800px] max-h-[800px] pointer-events-auto">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1.5} />
          <spotLight position={[-10, 10, -10]} intensity={1} color="#fef08a" />
          
          <AbstractShape />
          
          {/* Procedural Environment for reflections to avoid CSP fetch errors */}
          <Environment resolution={256}>
            <group rotation={[-Math.PI / 2, 0, 0]}>
              <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
              <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[10, 2, 1]} />
              <Lightformer intensity={2} rotation-y={-Math.PI / 2} position={[5, 1, -1]} scale={[10, 2, 1]} />
              <Lightformer intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[20, 10, 1]} />
            </group>
          </Environment>
          
          {/* Subtle shadow underneath */}
          <ContactShadows position={[0, -3, 0]} opacity={0.3} scale={15} blur={2.5} far={5} />
        </Canvas>
      </div>
    </div>
  );
}
