"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, Lightformer, ContactShadows, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

// A light that physically follows the user's mouse cursor in 3D space
function MouseLight() {
  const lightRef = useRef<THREE.PointLight>(null);
  
  useFrame((state) => {
    if (lightRef.current) {
      // Map 2D screen pointer (-1 to 1) to 3D space dimensions
      const x = (state.pointer.x * state.viewport.width) / 2;
      const y = (state.pointer.y * state.viewport.height) / 2;
      
      // Smoothly interpolate the light's position towards the mouse
      lightRef.current.position.lerp(new THREE.Vector3(x, y, 3), 0.1);
    }
  });

  return (
    <pointLight ref={lightRef} intensity={8} color="#00d084" distance={15} />
  );
}

function AbstractShape() {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    // 1. Continuous rotation of the actual mesh
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.15;
      meshRef.current.rotation.y += delta * 0.2;
      
      // Animate scale on hover
      const targetScale = hovered ? 1.05 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }

    // 2. Mouse tracking: tilt the entire group towards the mouse pointer
    if (groupRef.current) {
      const targetX = (state.pointer.y * Math.PI) / 4; // Tilt up/down
      const targetY = (state.pointer.x * Math.PI) / 4; // Tilt left/right
      
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
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
            color="#dcfce7" // Subtle green tint
          />
        </mesh>
      </Float>
    </group>
  );
}

export default function HeroShape() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center opacity-90">
      {/* 
        We use pointer-events-auto on the inner container so the Canvas 
        can capture mouse events, but it doesn't block the rest of the screen.
      */}
      <div className="w-full h-full max-w-[1000px] max-h-[1000px] pointer-events-auto">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1.5} />
          
          {/* Interactive Mouse Light */}
          <MouseLight />
          
          <AbstractShape />
          
          {/* Procedural Environment for realistic glass reflections */}
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
