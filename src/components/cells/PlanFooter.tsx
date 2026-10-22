import { Mic, FileText, CheckCircle } from 'lucide-react'
import RagWolfekProgress from '@/components/cells/RagWolfekProgress'
import type { PlanFooterProps } from '@/types/lectureTypes'

export default function PlanFooter({
  summary,
  examRelevance,
  isPending,
  lectureGenerated,
  onGenerate,
  onSaveScript,
}: PlanFooterProps) {
  return (
    <div className="border-t border-zinc-200 bg-zinc-50/50 px-5 py-4 space-y-3 shrink-0">
      {summary && (
        <div>
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Weryfikacja wiedzy</p>
          <p className="text-sm text-zinc-600">{summary}</p>
        </div>
      )}

      {examRelevance && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <p className="text-xs font-medium text-amber-600 mb-0.5">LEK</p>
          <p className="text-xs text-amber-700">{examRelevance}</p>
        </div>
      )}

      <div className="pt-1 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onGenerate}
            disabled={isPending || lectureGenerated}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ff9898] to-fuchsia-400 text-white text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {lectureGenerated ? (
              <><CheckCircle className="w-4 h-4" />Wykład wygenerowany</>
            ) : isPending ? (
              <><Mic className="w-4 h-4" />Generowanie...</>
            ) : (
              <><Mic className="w-4 h-4" />Generuj wykład</>
            )}
          </button>

          {onSaveScript && (
            <button
              type="button"
              onClick={onSaveScript}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 text-sm rounded-lg hover:bg-zinc-50 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Zapisz skrypt do notatki
            </button>
          )}
        </div>

        {isPending && <RagWolfekProgress />}
      </div>
    </div>
  )
}
