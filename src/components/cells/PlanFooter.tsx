import { Mic } from 'lucide-react'
import RagProgressIndicator from '@/components/cells/RagProgressIndicator'
import type { ProgressStage, LogEntry } from '@/types/progressTypes'

interface PlanFooterProps {
  summary?: string
  examRelevance?: string | undefined
  isPending: boolean
  onGenerate: () => void
  stage: ProgressStage
  progress: number
  progressMessage: string
  tool: string | null
  userLogs: LogEntry[]
  technicalLogs: LogEntry[]
  progressError: string | null
}

export default function PlanFooter({
  summary,
  examRelevance,
  isPending,
  onGenerate,
  stage,
  progress,
  progressMessage,
  tool,
  userLogs,
  technicalLogs,
  progressError,
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
        <button
          type="button"
          onClick={onGenerate}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ff9898] to-fuchsia-400 text-white text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Mic className="w-4 h-4" />
          {isPending ? 'Generowanie...' : 'Generuj wykład'}
        </button>

        {isPending && (
          <RagProgressIndicator
            stage={stage}
            progress={progress}
            message={progressMessage}
            tool={tool}
            userLogs={userLogs}
            technicalLogs={technicalLogs}
            error={progressError}
          />
        )}
      </div>
    </div>
  )
}
