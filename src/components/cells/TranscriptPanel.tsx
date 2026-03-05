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
        className="w-full flex items-center justify-between px-5 py-3 border-t border-zinc-100 hover:bg-zinc-50/70 transition-colors shrink-0"
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
        <div className="border-t border-zinc-100 bg-zinc-50/50 px-5 py-4 max-h-48 overflow-y-auto scrollbar-thin scrollbar-webkit">
          <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-line">
            {transcript}
          </p>
        </div>
      )}
    </>
  )
}
