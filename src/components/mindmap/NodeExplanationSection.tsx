"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { ExplainIcon } from "@/components/mindmap/icons"

export default function NodeExplanationSection({ explanation }: { explanation: string }) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="mt-3 shrink-0 rounded-xl border border-white/10 bg-white/5">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-zinc-300 transition-colors hover:text-zinc-100"
      >
        <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide">
          <ExplainIcon size={13} />
          Wyjaśnienie AI
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <p className="max-h-44 overflow-y-auto whitespace-pre-wrap px-3 pb-3 text-sm leading-relaxed text-zinc-300">
          {explanation}
        </p>
      )}
    </div>
  )
}
