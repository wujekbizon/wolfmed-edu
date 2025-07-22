import { Vector2, Size2D, ShapeType } from "@/domain/bio";

interface HumanCellSVGProps {
  id: string;
  type: ShapeType;
  position: Vector2;
  size: Size2D;
  velocity: Vector2;
  radius: number;
  color: string;
  reproductionCooldown?: number;
}

export function HumanCellSVG({
  id,
  type,
  position,
  size,
  velocity,
  radius,
  color,
  reproductionCooldown = 10,
}: HumanCellSVGProps) {
  const strokeW = 2; 

  const actualRadius = Math.min(size.width, size.height) / 2 - strokeW;

  const nucleusRadius = actualRadius * 0.35;
  const nucleolusRadius = actualRadius * 0.12;
  const organelleRadius = Math.max(2, actualRadius * 0.08);

  const cx = size.width / 2;
  const cy = size.height / 2;

  return (
    <svg
      id={id}
      data-type={type}
      width={size.width}
      height={size.height}
      style={{
        position: "absolute",
        left: position.x - size.width / 2,
        top: position.y - size.height / 2,
      }}
      viewBox={`0 0 ${size.width} ${size.height}`}
    >
      {/* Cell membrane */}
      <circle
        cx={cx}
        cy={cy}
        r={actualRadius}
        fill={color}
        stroke="#3388aa"
        strokeWidth={strokeW}
      />

      {/* Cytoplasm gradient */}
      <defs>
        <radialGradient id={`cytoplasmGradient-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} />
        </radialGradient>
      </defs>
      <circle
        cx={cx}
        cy={cy}
        r={actualRadius * 0.95}
        fill={`url(#cytoplasmGradient-${id})`}
      />

      {/* Nucleus */}
      <circle
        cx={cx + actualRadius * 0.2}
        cy={cy - actualRadius * 0.1}
        r={nucleusRadius}
        fill="#7da4d6"
        stroke="#456a96"
        strokeWidth={strokeW}
      />

      {/* Nucleolus */}
      <circle
        cx={cx + actualRadius * 0.2}
        cy={cy - actualRadius * 0.1}
        r={nucleolusRadius}
        fill="#3f5b82"
      />

      {/* Organelles */}
      <circle
        cx={cx - actualRadius * 0.3}
        cy={cy - actualRadius * 0.2}
        r={organelleRadius}
        fill="rgba(255, 158, 128, 0.5)"
      />
      <circle
        cx={cx + actualRadius * 0.4}
        cy={cy - actualRadius * 0.25}
        r={organelleRadius * 0.8}
        fill="rgba(255, 204, 128, 0.5)"
      />
      <circle
        cx={cx - actualRadius * 0.2}
        cy={cy + actualRadius * 0.3}
        r={organelleRadius * 1.2}
        fill="rgba(161, 227, 161, 0.5)"
      />
      <circle
        cx={cx + actualRadius * 0.35}
        cy={cy + actualRadius * 0.2}
        r={organelleRadius}
        fill="rgba(213, 161, 227, 0.5)"
      />
      <circle
        cx={cx - actualRadius * 0.4}
        cy={cy + actualRadius * 0.1}
        r={organelleRadius * 0.8}
        fill="rgba(244, 161, 214, 0.517)"
      />

      {/* Shine */}
      <ellipse
        cx={cx}
        cy={cy - actualRadius * 0.2}
        rx={actualRadius * 0.4}
        ry={actualRadius * 0.2}
        fill="white"
        opacity="0.2"
      />
    </svg>
  );
}
