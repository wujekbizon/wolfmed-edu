import type { FC } from "react"
import type { Category } from "@/lib/mindmap/types"
import type { MindMapIconProps } from "./IconBase"
import {
  PulseIcon,
  DisorderIcon,
  TreatmentIcon,
  CapsuleIcon,
  BoltIcon,
  ChecklistIcon,
  SpreadIcon,
  HelixIcon,
  ShieldIcon,
  DotIcon,
} from "./categoryIcons"

export const CATEGORY_ICONS: Record<Category, FC<MindMapIconProps>> = {
  anatomy: PulseIcon,
  pathology: DisorderIcon,
  treatment: TreatmentIcon,
  pharmacology: CapsuleIcon,
  physiology: BoltIcon,
  diagnostics: ChecklistIcon,
  epidemiology: SpreadIcon,
  genetics: HelixIcon,
  immunology: ShieldIcon,
  other: DotIcon,
}

/** Icon component for a category, falling back to the neutral dot. */
export function getCategoryIcon(category?: Category): FC<MindMapIconProps> {
  return category ? CATEGORY_ICONS[category] : CATEGORY_ICONS.other
}

export type { MindMapIconProps }
export { default as IconBase } from "./IconBase"
