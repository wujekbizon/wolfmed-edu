import type { ComponentType } from "react"
import type { Category } from "@/lib/mindmap/types"
import {
  Heart,
  Activity,
  Microscope,
  Pill,
  Stethoscope,
  Syringe,
  Share2,
  Dna,
  ShieldCheck,
  Circle,
} from "lucide-react"
import type { MindMapIconProps } from "./IconBase"

// lucide-react icons, mapped to our fixed Category set (not medical specialties).
// Accessed everywhere via getCategoryIcon, so this is the only place to change.
export const CATEGORY_ICONS: Record<Category, ComponentType<MindMapIconProps>> = {
  anatomy: Heart,
  physiology: Activity,
  pathology: Microscope,
  pharmacology: Pill,
  diagnostics: Stethoscope,
  treatment: Syringe,
  epidemiology: Share2,
  genetics: Dna,
  immunology: ShieldCheck,
  other: Circle,
}

/** Icon component for a category, falling back to the neutral circle. */
export function getCategoryIcon(category?: Category): ComponentType<MindMapIconProps> {
  return category ? CATEGORY_ICONS[category] : CATEGORY_ICONS.other
}

export type { MindMapIconProps }
export { default as IconBase } from "./IconBase"
export { ExplainIcon, CloseIcon, DownloadIcon } from "./uiIcons"
