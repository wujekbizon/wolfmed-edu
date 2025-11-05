"use client";

import { Vector2, Size2D, ShapeType } from "@/domain/bio";
import { useEffect, useState } from "react";

interface BacteriaSVGProps {
  id: string;
  type: ShapeType;
  position: Vector2;
  size: Size2D;
  velocity: Vector2;
  radius: number;
  color: string;
}

export const BacteriaSVG: React.FC<BacteriaSVGProps> = ({
  id,
  position,
  size,
  velocity,
  radius,
  color,
}) => {
  const strokeW = 1; // stroke width
  const padding = strokeW * 2; // extra margin for safety
  const [wiggle, setWiggle] = useState(0);

  // Use useEffect for client-side-only logic (e.g., animations)
  useEffect(() => {
    const interval = setInterval(() => {
      setWiggle(Math.sin(Date.now() * 0.005 + id.length) * 1.5);
    }, 100); // Update wiggle every 100ms

    return () => clearInterval(interval);
  }, [id]);

  const baseWidth = size.width + wiggle;
  const baseHeight = size.height + wiggle * 0.3;

  // Now the total size includes padding for stroke
  const totalWidth = baseWidth + padding * 2;
  const totalHeight = baseHeight + padding * 2;

  // Rod origin (shifted by padding)
  const x = padding;
  const y = padding;

  return (
    <svg
      width={baseWidth} // visible width stays the same
      height={baseHeight} // visible height stays the same
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      style={{
        position: "absolute",
        left: position.x - baseWidth / 2,
        top: position.y - baseHeight / 2,
        overflow: "visible",
      }}
    >
      {/* Rod-shaped bacterium body */}
      <rect
        x={x}
        y={y}
        rx={baseHeight / 2}
        ry={baseHeight / 2}
        width={baseWidth}
        height={baseHeight}
        fill={color}
        stroke="black"
        strokeWidth={strokeW}
      />

      {/* Internal nucleus-like blob */}
      <ellipse
        cx={x + baseWidth / 2}
        cy={y + baseHeight / 2}
        rx={baseWidth * 0.25}
        ry={baseHeight * 0.4}
        fill="rgba(0,0,0,0.15)"
      />

      {/* Little flagella lines */}
      <line
        x1={x + baseWidth}
        y1={y + baseHeight * 0.3}
        x2={x + baseWidth + 5}
        y2={y + baseHeight * 0.3 + wiggle}
        stroke="black"
        strokeWidth="0.5"
      />
      <line
        x1={x + baseWidth}
        y1={y + baseHeight * 0.7}
        x2={x + baseWidth + 5}
        y2={y + baseHeight * 0.7 - wiggle}
        stroke="black"
        strokeWidth="0.5"
      />
    </svg>
  );
};
