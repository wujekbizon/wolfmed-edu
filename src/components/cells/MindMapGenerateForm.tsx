"use client"

import { useActionState, useEffect, useRef } from "react"
import { EMPTY_FORM_STATE } from "@/constants/formState"
import { generateMindMapAction } from "@/actions/mindmap"
import { useToastMessage } from "@/hooks/useToastMessage"
import { useCellsStore } from "@/store/useCellsStore"
import FieldError from "@/components/FieldError"
import SubmitButton from "@/components/SubmitButton"
import { PulseIcon } from "@/components/mindmap/icons/categoryIcons"
import type { Cell } from "@/types/cellTypes"

export default function MindMapGenerateForm({ cell }: { cell: Cell }) {
  const [state, action] = useActionState(generateMindMapAction, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(state)
  const updateCell = useCellsStore((s) => s.updateCell)
  const lastApplied = useRef(0)

  useEffect(() => {
    if (
      state.status === "SUCCESS" &&
      state.values?.content &&
      state.timestamp !== lastApplied.current
    ) {
      lastApplied.current = state.timestamp
      updateCell(cell.id, String(state.values.content))
    }
  }, [state, cell.id, updateCell])

  return (
    <form
      action={action}
      className="relative flex h-full flex-col items-center justify-center gap-4 p-6 text-center"
      style={{ backgroundImage: "radial-gradient(#3f3f46 1px, transparent 1px)", backgroundSize: "22px 22px" }}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ff9898]/15 text-[#f58a8a] shadow-[0_0_24px_rgba(245,138,138,0.35)]">
        <PulseIcon size={28} />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-zinc-100">Mapa Myśli</h3>
        <p className="max-w-sm text-sm text-zinc-400">
          Wpisz temat, a AI zbuduje interaktywną mapę myśli — np. „Niewydolność serca”,
          „Podstawy pielęgniarstwa” czy „Odleżyny”.
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-1">
        <input
          type="text"
          name="topic"
          placeholder="Temat mapy"
          autoComplete="off"
          defaultValue={state.values?.topic?.toString() || ""}
          className="w-full rounded-lg border border-white/10 bg-zinc-800/80 px-4 py-2.5 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-500 focus:ring-2 focus:ring-[#ff9898]/50"
        />
        <FieldError name="topic" formState={state} />
      </div>

      <SubmitButton
        label="Wygeneruj mapę"
        loading="Generowanie..."
        className="max-w-sm"
      />
      {noScriptFallback}
    </form>
  )
}
