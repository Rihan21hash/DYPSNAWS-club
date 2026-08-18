"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, RoundedBox, Html } from "@react-three/drei";
import { useRouter } from "next/navigation";
import * as THREE from "three";

function EventCard({ event, index, totalCount, scrollProgress }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  const router = useRouter();

  const yPos = index * -2.8;

  const handleClick = (e) => {
    e.stopPropagation();
    router.push(`/events/${event.slug}`);
  };

  useFrame((state) => {
    if (!groupRef.current) return;

    const targetY = yPos + scrollProgress * (totalCount * 2.8);
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY,
      0.06
    );

    const targetX = hovered ? 1.0 : 0;
    const targetRotY = hovered ? -0.12 : 0;
    const targetScale = hovered ? 1.06 : 1;

    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      targetX,
      0.08
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotY,
      0.08
    );
    const s = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.08);
    groupRef.current.scale.set(s, s, s);

    groupRef.current.rotation.z =
      Math.sin(state.clock.elapsedTime * 0.25 + index) * 0.015;
  });

  const cardColor = event.color || "#AE5CFF";

  return (
    <group
      ref={groupRef}
      position={[0, yPos, 0]}
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
      <RoundedBox args={[5.5, 2.2, 0.06]} radius={0.08} smoothness={4}>
        <meshStandardMaterial
          color={hovered ? cardColor : "#061A2F"}
          transparent
          opacity={hovered ? 0.95 : 0.8}
          roughness={0.4}
          metalness={0.3}
        />
      </RoundedBox>

      <RoundedBox args={[5.56, 2.26, 0.01]} radius={0.08} smoothness={4}>
        <meshBasicMaterial
          color={cardColor}
          transparent
          opacity={hovered ? 0.6 : 0.2}
        />
      </RoundedBox>

      {/* Type label */}
      <Text
        position={[-2.2, 0.75, 0.05]}
        fontSize={0.13}
        color={cardColor}
        anchorX="left"
        letterSpacing={0.08}
      >
        {event.type || "EVENT"}
      </Text>

      {/* Title */}
      <Text
        position={[-2.2, 0.3, 0.05]}
        fontSize={0.28}
        color="#FFFFFF"
        anchorX="left"
        maxWidth={4.2}
        fontWeight="bold"
      >
        {event.title}
      </Text>

      {/* Date */}
      <Text
        position={[-2.2, -0.15, 0.05]}
        fontSize={0.13}
        color="#AE5CFF"
        anchorX="left"
      >
        {event.date}
      </Text>

      {/* Description - truncated */}
      <Text
        position={[-2.2, -0.5, 0.05]}
        fontSize={0.11}
        color="#A0AEC0"
        anchorX="left"
        maxWidth={4}
        lineHeight={1.4}
      >
        {(event.desc || "").length > 100 ? event.desc.slice(0, 100) + "..." : event.desc}
      </Text>

      {/* Status badge - top right */}
      <Html position={[2.3, 0.82, 0.05]} center>
        <span
          style={{
            display: "inline-block",
            padding: "3px 10px",
            borderRadius: "999px",
            fontSize: "9px",
            letterSpacing: "0.1em",
            fontWeight: 700,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            color: event.status === "Completed" ? "#22c55e" : event.status === "Ongoing" ? "#AE5CFF" : "#4a9eff",
            background: event.status === "Completed" ? "rgba(34,197,94,0.15)" : event.status === "Ongoing" ? "rgba(174,92,255,0.15)" : "rgba(74,158,255,0.15)",
            border: `1px solid ${event.status === "Completed" ? "rgba(34,197,94,0.3)" : event.status === "Ongoing" ? "rgba(174,92,255,0.3)" : "rgba(74,158,255,0.3)"}`,
          }}
        >
          {(event.status || "Upcoming").toUpperCase()}
        </span>
      </Html>

      {hovered && (
        <Html position={[1.8, -0.6, 0.08]} center>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/events/${event.slug}`);
            }}
            className="px-5 py-2 text-[11px] font-bold tracking-[0.1em] text-white bg-[#AE5CFF] rounded-full whitespace-nowrap transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(174,92,255,0.5)]"
            style={{
              pointerEvents: "auto",
            }}
          >
            VIEW EVENT →
          </button>
        </Html>
      )}
    </group>
  );
}

export default function EventStack3DDesktop({ events }) {
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const eventsSection = document.getElementById("events");
    if (!eventsSection) return;
    const rect = eventsSection.getBoundingClientRect();
    const sectionHeight = eventsSection.offsetHeight - window.innerHeight;
    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / sectionHeight));
    setScrollProgress(progress);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "default",
          failIfMajorPerformanceCaveat: false,
        }}
        style={{ background: "transparent", pointerEvents: "auto" }}
        frameloop="demand"
        onCreated={({ invalidate }) => {
          const animate = () => {
            invalidate();
            requestAnimationFrame(animate);
          };
          animate();
        }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[4, 4, 8]} intensity={0.7} color="#AE5CFF" />
        <pointLight position={[-4, -4, 8]} intensity={0.3} color="#0A2540" />
        <fog attach="fog" args={["#020B18", 6, 18]} />

        {events.map((event, i) => (
          <EventCard
            key={event.slug}
            event={event}
            index={i}
            totalCount={events.length}
            scrollProgress={scrollProgress}
          />
        ))}
      </Canvas>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 text-xs text-[#AE5CFF]/70 tracking-[0.15em] font-semibold pointer-events-none">
        <div className="w-8 h-px bg-[#AE5CFF]/40" />
        SCROLL TO EXPLORE
        <div className="w-8 h-px bg-[#AE5CFF]/40" />
      </div>
    </div>
  );
}
