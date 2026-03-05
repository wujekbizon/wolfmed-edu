"use client"

import { useState } from 'react'
import { FileText, ChevronDown, ChevronUp } from 'lucide-react'

interface TranscriptPanelProps {
  transcript: string
}

export default function TranscriptPanel({ transcript }: TranscriptPanelProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white/60 backdrop-blur-sm border border-white/70 rounded-xl overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-black/5 transition-colors"
      >
        <span className="flex items-center gap-2 text-xs font-medium text-zinc-500">
          <FileText className="w-3.5 h-3.5" />
          Transkrypcja
        </span>
        {open
          ? <ChevronUp className="w-4 h-4 text-zinc-400" />
          : <ChevronDown className="w-4 h-4 text-zinc-400" />
        }
      </button>

      {open && (
        <div className="border-t border-zinc-100 bg-white/40 px-4 py-3 max-h-48 overflow-y-auto scrollbar-thin scrollbar-webkit">
          <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-line">
            {transcript}
          </p>
        </div>
      )}
    </div>
  )
}
