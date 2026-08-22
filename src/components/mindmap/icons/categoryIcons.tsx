import IconBase, { type MindMapIconProps } from "./IconBase"

// anatomy — pulse line (the mockup root motif)
export function PulseIcon(props: MindMapIconProps) {
  return (
    <IconBase {...props}>
      <path d="M2 12h5l2-6 4 12 2-6h7" />
    </IconBase>
  )
}

// pathology — circle with "i" (disorder / info)
export function DisorderIcon(props: MindMapIconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </IconBase>
  )
}

// treatment — cross in circle
export function TreatmentIcon(props: MindMapIconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </IconBase>
  )
}

// pharmacology — capsule (two half-pills)
export function CapsuleIcon(props: MindMapIconProps) {
  return (
    <IconBase {...props}>
      <path d="M10.5 13.5 4.5 19.5a4.24 4.24 0 0 1-6-6l6-6a4.24 4.24 0 0 1 6 6z" />
      <path d="M8 8l6 6" />
    </IconBase>
  )
}

// physiology — lightning bolt
export function BoltIcon(props: MindMapIconProps) {
  return (
    <IconBase {...props}>
      <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
    </IconBase>
  )
}

// diagnostics — checklist square
export function ChecklistIcon(props: MindMapIconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M8 12l3 3 5-6" />
    </IconBase>
  )
}

// epidemiology — three connected dots
export function SpreadIcon(props: MindMapIconProps) {
  return (
    <IconBase {...props}>
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="6" r="2" />
      <circle cx="19" cy="12" r="2" />
      <path d="M6.7 11 10.3 7.3M13.7 7.3 17.3 11" />
    </IconBase>
  )
}

// genetics — helix (two crossing curves)
export function HelixIcon(props: MindMapIconProps) {
  return (
    <IconBase {...props}>
      <path d="M8 3c0 5 8 5 8 9s-8 4-8 9" />
      <path d="M16 3c0 5-8 5-8 9s8 4 8 9" />
      <path d="M9 7h6M9 17h6" />
    </IconBase>
  )
}

// immunology — shield
export function ShieldIcon(props: MindMapIconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 2 20 5v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V5z" />
    </IconBase>
  )
}

// other — dot
export function DotIcon(props: MindMapIconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
    </IconBase>
  )
}
