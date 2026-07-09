import type { ReactNode } from "react"

export interface MindMapIconProps {
  size?: number
  color?: string
}

/**
 * Shared wrapper for the mind-map category icons: 24x24 viewBox, 1.5px stroke,
 * round caps, currentColor — same visual language as the mockup and the rest of
 * the icon set in components/icons.
 */
export default function IconBase({
  size = 16,
  color,
  children,
}: MindMapIconProps & { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      color={color}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}
