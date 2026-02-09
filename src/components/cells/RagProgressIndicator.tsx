'use client'

import { useState } from 'react'
import type { ProgressStage, LogEntry } from '@/lib/progress-events'

interface RagProgressIndicatorProps {
  stage: ProgressStage
  progress: number
  message: string
  tool: string | null
  logs: LogEntry[]
  error: string | null
}

const STAGE_ORDER: ProgressStage[] = [
  'parsing',
  'resolving',
  'fetching',
  'searching',
  'calling_tool',
  'executing',
  'finalizing',
  'complete',
]

function getStageIndex(stage: ProgressStage): number {
  return STAGE_ORDER.indexOf(stage)
}

function StageIcon({ stage, currentStage }: { stage: ProgressStage; currentStage: ProgressStage }) {
  const stageIndex = getStageIndex(stage)
  const currentIndex = getStageIndex(currentStage)

  if (currentStage === 'error') {
    return <span className="text-red-500">!</span>
  }

  if (stageIndex < currentIndex || currentStage === 'complete') {
    return <span className="text-emerald-500">&#10003;</span>
  }

  if (stageIndex === currentIndex) {
    return (
      <span className="inline-block w-3 h-3 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
    )
  }

  return <span className="text-zinc-300">&#9679;</span>
}

export default function RagProgressIndicator({
  stage,
  progress,
  message,
  tool,
  logs,
  error,
}: RagProgressIndicatorProps) {
  const [showLogs, setShowLogs] = useState(false)

  if (stage === 'idle') {
    return null
  }

  return (
    <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg space-y-3">
      {/* Header with tool name */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {stage !== 'complete' && stage !== 'error' && (
            <span className="inline-block w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
          )}
          {stage === 'complete' && <span className="text-emerald-500 text-lg">&#10003;</span>}
          {stage === 'error' && <span className="text-red-500 text-lg">&#10007;</span>}
          <span className="font-medium text-zinc-800">
            {tool ? tool : 'RAG Query'}
          </span>
        </div>
        <span className="text-xs text-zinc-500 font-mono">{progress}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-zinc-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ease-out ${
            stage === 'error' ? 'bg-red-400' : 'bg-emerald-400'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Current stage message */}
      <div className="flex items-center gap-2 text-sm text-zinc-600">
        <StageIcon stage={stage} currentStage={stage} />
        <span>{message}</span>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Expandable logs */}
      {logs.length > 0 && (
        <div className="pt-2 border-t border-zinc-200">
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700"
          >
            <span className={`transition-transform ${showLogs ? 'rotate-90' : ''}`}>&#9654;</span>
            {showLogs ? 'Ukryj szczegóły' : 'Pokaż szczegóły'} ({logs.length})
          </button>

          {showLogs && (
            <div className="mt-2 p-2 bg-zinc-900 rounded text-xs font-mono max-h-40 overflow-y-auto">
              {logs.map((log, i) => (
                <div
                  key={i}
                  className={`${
                    log.level === 'error'
                      ? 'text-red-400'
                      : log.level === 'warn'
                        ? 'text-yellow-400'
                        : 'text-zinc-400'
                  }`}
                >
                  <span className="text-zinc-600">
                    {new Date(log.timestamp).toLocaleTimeString('pl-PL')}
                  </span>{' '}
                  <span className="text-zinc-500">[{log.level.toUpperCase()}]</span> {log.message}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
