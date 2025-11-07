"use client";

import { Vector2, Size2D, ShapeType } from "@/domain/bio";
import { useEffect, useState } from "react";

interface VirusSVGProps {
  id: string;
  type: ShapeType;
  position: Vector2;
  size: Size2D;
  velocity: Vector2;
  radius: number;
  color: string;
}

export const VirusSVG: React.FC<VirusSVGProps> = ({
  id,
  position,
  size,
  velocity,
  radius,
  color,
}) => {
  const spikeCount = 12;
  const spikeLength = radius * 0.6;
  const [wiggle, setWiggle] = useState(0);

  // Use useEffect for client-side-only logic (e.g., animations)
  useEffect(() => {
    const interval = setInterval(() => {
      setWiggle(Math.sin(Date.now() * 0.004 + id.length) * 1.5);
    }, 100); // Update wiggle every 100ms

    return () => clearInterval(interval);
  }, [id]);

  const adjustedRadius = radius + wiggle;

  // Precompute virus bounding box
  const virusExtent = adjustedRadius + spikeLength;
  const svgSize = virusExtent * 2; // width & height of this svg

  const spikes = Array.from({ length: spikeCount }).map((_, i) => {
    const angle = (i / spikeCount) * Math.PI * 2;
    const innerX = parseFloat((adjustedRadius * Math.cos(angle) + virusExtent).toFixed(6));
    const innerY = parseFloat((adjustedRadius * Math.sin(angle) + virusExtent).toFixed(6));
    const outerX = parseFloat(((adjustedRadius + spikeLength) * Math.cos(angle) + virusExtent).toFixed(6));
    const outerY = parseFloat(((adjustedRadius + spikeLength) * Math.sin(angle) + virusExtent).toFixed(6));
    return { innerX, innerY, outerX, outerY };
  });

  return (
    <svg
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
      }}
      key={id}
      x={position.x - virusExtent}
      y={position.y - virusExtent}
      width={svgSize}
      height={svgSize}
      viewBox={`0 0 ${svgSize} ${svgSize}`}
    >
      {/* Spikes */}
      {spikes.map((s, idx) => (
        <line
          key={idx}
          x1={s.innerX}
          y1={s.innerY}
          x2={s.outerX}
          y2={s.outerY}
          stroke={color}
          strokeWidth="1"
          className="animate-pulse"
        />
      ))}

      {/* Virus core */}
      <circle
        cx={virusExtent}
        cy={virusExtent}
        r={radius * 0.9}
        fill={color}
        stroke="black"
        strokeWidth="0.5"
      />

      {/* Inner genetic material */}
      <circle
        cx={virusExtent}
        cy={virusExtent}
        r={radius * 0.4}
        fill="rgba(0,0,0,0.15)"
      />
    </svg>
  );
};