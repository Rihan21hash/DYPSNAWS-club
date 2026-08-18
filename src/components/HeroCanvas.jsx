"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";

function FloatingShape({ position, geometry, color, speed = 1, scale = 1, wireframe = false }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.002 * speed;
      meshRef.current.rotation.y += 0.003 * speed;
      meshRef.current.rotation.z += 0.001 * speed;
    }
  });

  return (
    <Float speed={1.5 * speed} rotationIntensity={0.5} floatIntensity={1.5}>
      <mesh ref={meshRef} position={position} scale={scale}>
        {geometry}
        <meshStandardMaterial
          color={color}
          transparent
          opacity={wireframe ? 0.25 : 0.5}
          wireframe={wireframe}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>
    </Float>
  );
}

function Particles({ count = 60 }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, [count]);

  const ref = useRef();

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.0004;
      ref.current.rotation.x += 0.0002;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#A855F7" size={0.03} transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.6} color="#A855F7" />
      <pointLight position={[-5, -5, 5]} intensity={0.3} color="#6B21A8" />

      <FloatingShape
        position={[-3.5, 2, -3]}
        geometry={<torusGeometry args={[1, 0.4, 16, 32]} />}
        color="#A855F7"
        speed={0.8}
        scale={0.7}
      />
      <FloatingShape
        position={[3.5, -1, -4]}
        geometry={<icosahedronGeometry args={[1.2, 0]} />}
        color="#C084FC"
        speed={1.2}
        scale={0.6}
      />
      <FloatingShape
        position={[-3, -2, -2]}
        geometry={<octahedronGeometry args={[1, 0]} />}
        color="#6B21A8"
        speed={0.6}
        scale={0.5}
      />
      <FloatingShape
        position={[4, 2.5, -5]}
        geometry={<dodecahedronGeometry args={[0.8, 0]} />}
        color="#A855F7"
        speed={1}
        scale={0.8}
        wireframe
      />
      <FloatingShape
        position={[0, 3, -6]}
        geometry={<sphereGeometry args={[1.5, 16, 16]} />}
        color="#A855F7"
        speed={0.3}
        scale={1}
        wireframe
      />

      <Particles count={60} />
    </>
  );
}

export default function HeroCanvas() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "default",
          failIfMajorPerformanceCaveat: false,
        }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
