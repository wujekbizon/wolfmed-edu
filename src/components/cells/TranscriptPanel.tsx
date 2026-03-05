"use client"

import { useState } from 'react'
import { FileText, ChevronDown, ChevronUp } from 'lucide-react'

interface TranscriptPanelProps {
  transcript: string
}

export default function TranscriptPanel({ transcript }: TranscriptPanelProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-5 py-3 border-t border-white/10 hover:bg-white/5 transition-colors shrink-0"
      >
        <span className="flex items-center gap-2 text-xs font-medium text-white/50">
          <FileText className="w-3.5 h-3.5" />
          Transkrypcja
        </span>
        {open
          ? <ChevronUp className="w-4 h-4 text-white/30" />
          : <ChevronDown className="w-4 h-4 text-white/30" />
        }
      </button>

      {open && (
        <div className="border-t border-white/10 bg-black/20 px-5 py-4 max-h-48 overflow-y-auto scrollbar-thin scrollbar-webkit">
          <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">
            {transcript}
          </p>
        </div>
      )}
    </>
  )
}
