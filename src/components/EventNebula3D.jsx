"use client";

import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, RoundedBox, Stars } from "@react-three/drei";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { EVENTS } from "@/data/events";

function NebulaCard({ event, position, index }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  const router = useRouter();
  const initialPos = useMemo(() => new THREE.Vector3(...position), [position]);

  useFrame((state) => {
    if (!groupRef.current) return;

    if (!hovered) {
      groupRef.current.position.x =
        initialPos.x + Math.sin(state.clock.elapsedTime * 0.3 + index * 2) * 0.3;
      groupRef.current.position.y =
        initialPos.y + Math.cos(state.clock.elapsedTime * 0.25 + index * 1.5) * 0.25;
      groupRef.current.position.z =
        initialPos.z + Math.sin(state.clock.elapsedTime * 0.2 + index) * 0.15;

      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.15 + index) * 0.08;
      groupRef.current.rotation.x =
        Math.cos(state.clock.elapsedTime * 0.1 + index) * 0.04;
    }

    const targetScale = hovered ? 1.12 : 1;
    const s = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.08);
    groupRef.current.scale.set(s, s, s);
  });

  const handleClick = (e) => {
    e.stopPropagation();
    router.push(`/events/${event.slug}`);
  };

  const cardColor = event.color || "#AE5CFF";

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      <RoundedBox args={[4, 2.4, 0.06]} radius={0.08} smoothness={4}>
        <meshStandardMaterial
          color={hovered ? cardColor : "#061A2F"}
          transparent
          opacity={hovered ? 0.95 : 0.7}
          roughness={0.3}
          metalness={0.4}
          emissive={hovered ? cardColor : "#000000"}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </RoundedBox>

      <RoundedBox args={[4.06, 2.46, 0.01]} radius={0.08} smoothness={4}>
        <meshBasicMaterial
          color={cardColor}
          transparent
          opacity={hovered ? 0.7 : 0.15}
        />
      </RoundedBox>

      {/* Type */}
      <Text
        position={[-1.5, 0.8, 0.05]}
        fontSize={0.11}
        color={cardColor}
        anchorX="left"
        letterSpacing={0.1}
      >
        {event.type}
      </Text>

      {/* Title */}
      <Text
        position={[-1.5, 0.3, 0.05]}
        fontSize={0.26}
        color="#FFFFFF"
        anchorX="left"
        maxWidth={3.5}
        fontWeight="bold"
      >
        {event.title}
      </Text>

      {/* Date */}
      <Text
        position={[-1.5, -0.15, 0.05]}
        fontSize={0.13}
        color="#AE5CFF"
        anchorX="left"
      >
        {event.date}
      </Text>

      {/* Description */}
      <Text
        position={[-1.5, -0.55, 0.05]}
        fontSize={0.1}
        color="#A0AEC0"
        anchorX="left"
        maxWidth={3}
        lineHeight={1.3}
      >
        {event.desc}
      </Text>

      {/* Explore label on hover */}
      {hovered && (
        <group position={[1.2, -0.7, 0.05]}>
          <RoundedBox args={[1.1, 0.3, 0.02]} radius={0.04} smoothness={2}>
            <meshBasicMaterial color={cardColor} />
          </RoundedBox>
          <Text position={[0, 0, 0.02]} fontSize={0.1} color="#FFFFFF" letterSpacing={0.04} fontWeight="bold">
            EXPLORE →
          </Text>
        </group>
      )}
    </group>
  );
}

function getPositions(count) {
  const positions = [
    [-4, 1.5, -2],
    [3, -0.5, -4],
    [-2, -2, -6],
    [5, 2, -8],
    [-5, 0, -10],
    [1, -1.5, -12],
    [-3, 2.5, -14],
    [4, -2.5, -16],
  ];
  return positions.slice(0, count);
}

function CameraController({ scrollY }) {
  const { camera } = useThree();

  useFrame(() => {
    const targetZ = 6 - scrollY * 0.012;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);
    camera.position.y = Math.sin(scrollY * 0.002) * 0.3;
  });

  return null;
}

function NebulaScene({ scrollY }) {
  const positions = useMemo(() => getPositions(EVENTS.length), []);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[8, 8, 5]} intensity={0.6} color="#AE5CFF" />
      <pointLight position={[-8, -8, -5]} intensity={0.3} color="#0A2540" />
      <fog attach="fog" args={["#020B18", 4, 22]} />

      <Stars
        radius={50}
        depth={60}
        count={800}
        factor={3}
        saturation={0.5}
        fade
        speed={0.5}
      />

      <CameraController scrollY={scrollY} />

      {EVENTS.map((event, i) => (
        <NebulaCard
          key={event.slug}
          event={event}
          position={positions[i]}
          index={i}
        />
      ))}
    </>
  );
}

export default function EventNebula3D() {
  const [scrollY, setScrollY] = useState(0);

  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  return (
    <div className="fixed inset-0 top-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 55 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "default",
          failIfMajorPerformanceCaveat: false,
        }}
        style={{ background: "transparent" }}
      >
        <NebulaScene scrollY={scrollY} />
      </Canvas>
    </div>
  );
}
