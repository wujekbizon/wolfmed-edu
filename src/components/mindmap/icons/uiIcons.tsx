import type { MindMapIconProps } from "./IconBase"

/** Lightbulb — the "Wyjaśnij (AI)" action in the toolbar and detail card. */
export function ExplainIcon({ size = 16 }: MindMapIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.4 1 2.3h6c0-.9.4-1.8 1-2.3A7 7 0 0 0 12 2z" />
      <path d="M9.5 20h5" />
      <path d="M10.5 22h3" />
    </svg>
  )
}

/** Close (×) — dismisses the leaf detail card. */
export function CloseIcon({ size = 16 }: MindMapIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

/** Download arrow — exports the map as PNG. */
export function DownloadIcon({ size = 13 }: MindMapIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  )
}
