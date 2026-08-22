"use client"

import { CloseIcon, ExplainIcon } from "@/components/mindmap/icons"

interface NodeExplanationPanelProps {
  label: string
  breadcrumb: string[]
  explanation: string
  isOpen: boolean
  onClose: () => void
  onExplain: () => void
}

// Slides in from the bottom on mobile and from the right on desktop. The panel
// stays mounted so it animates out too, and the transform is expressed in
// classes rather than motion variants because the direction is breakpoint-bound.
const POSITION =
  "absolute inset-x-0 bottom-0 z-20 flex max-h-[85%] flex-col rounded-t-2xl border border-white/10 bg-zinc-900/95 shadow-2xl backdrop-blur transition-all duration-300 ease-out md:inset-x-auto md:inset-y-3 md:right-3 md:max-h-none md:w-96 md:rounded-2xl lg:right-[21.5rem]"

export default function NodeExplanationPanel({
  label,
  breadcrumb,
  explanation,
  isOpen,
  onClose,
  onExplain,
}: NodeExplanationPanelProps) {
  // Mobile slides the sheet clear of the bottom edge (the cell clips it); desktop
  // uses a short slide, since at lg the panel sits beside the card and a
  // full-width travel would sweep across it.
  const visibility = isOpen
    ? "translate-y-0 opacity-100 md:translate-x-0"
    : "pointer-events-none translate-y-full opacity-0 md:translate-y-0 md:translate-x-6"

  return (
    <aside className={`${POSITION} ${visibility}`} aria-hidden={!isOpen}>
      <div className="flex items-start gap-3 border-b border-white/10 p-4">
        <span className="mt-0.5 shrink-0 text-[#f58a8a]">
          <ExplainIcon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          {breadcrumb.length > 0 && (
            <p className="truncate text-[11px] text-zinc-500">{breadcrumb.join(" › ")}</p>
          )}
          <h3 className="text-sm font-semibold leading-tight text-zinc-100">
            Wyjaśnienie AI — {label}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Zamknij wyjaśnienie"
          className="shrink-0 rounded-md p-1 text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-200"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 scrollbar-dark">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{explanation}</p>
      </div>

      <div className="shrink-0 border-t border-white/10 p-4">
        <button
          type="button"
          onClick={onExplain}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#f58a8a] px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-[#ff9898]"
        >
          <ExplainIcon />
          Wyjaśnij ponownie (AI)
        </button>
      </div>
    </aside>
  )
}
