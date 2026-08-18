"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";

function EventObject({ color, type }) {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.004;
      meshRef.current.rotation.y += 0.006;
      meshRef.current.rotation.z += 0.002;
    }
  });

  const getGeometry = () => {
    switch (type) {
      case "HACKATHON":
        return <icosahedronGeometry args={[1.8, 1]} />;
      case "CERTIFICATION":
        return <octahedronGeometry args={[1.8, 0]} />;
      case "SUMMIT":
        return <dodecahedronGeometry args={[1.6, 0]} />;
      case "FESTIVAL":
        return <torusKnotGeometry args={[1.2, 0.4, 64, 16]} />;
      default:
        return <torusGeometry args={[1.4, 0.5, 16, 32]} />;
    }
  };

  const objectColor = color || "#AE5CFF";

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1.5}>
      <mesh ref={meshRef}>
        {getGeometry()}
        <meshStandardMaterial
          color={objectColor}
          transparent
          opacity={0.5}
          wireframe
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      {/* Inner solid glow */}
      <mesh ref={useRef()} scale={0.6}>
        {getGeometry()}
        <meshStandardMaterial
          color={objectColor}
          transparent
          opacity={0.15}
          roughness={0.5}
          metalness={0.3}
          emissive={objectColor}
          emissiveIntensity={0.4}
        />
      </mesh>
    </Float>
  );
}

export default function EventDetailHero({ event }) {
  return (
    <div className="absolute top-0 right-0 w-full md:w-1/2 h-screen z-0 opacity-70">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "default",
          failIfMajorPerformanceCaveat: false,
        }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 3, 5]} intensity={0.7} color={event?.color || "#AE5CFF"} />
        <pointLight position={[-3, -3, 5]} intensity={0.3} color="#0A2540" />
        <EventObject color={event?.color || "#AE5CFF"} type={event?.type} />
      </Canvas>
    </div>
  );
}
