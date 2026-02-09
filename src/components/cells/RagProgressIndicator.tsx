'use client'

import { useState } from 'react'
import type { ProgressStage, LogEntry } from '@/lib/progress-events'

interface RagProgressIndicatorProps {
  stage: ProgressStage
  progress: number
  message: string
  tool: string | null
  userLogs: LogEntry[]
  technicalLogs: LogEntry[]
  error: string | null
}

const TOOL_LABELS: Record<string, string> = {
  notatka_tool: 'notatka',
  utworz_test: 'test',
  diagram_tool: 'diagram',
  podsumuj: 'podsumowanie',
}

function getToolLabel(tool: string | null): string {
  if (!tool) return 'wyszukiwanie'
  return TOOL_LABELS[tool] || tool.replace('_tool', '').replace('_', ' ')
}

export default function RagProgressIndicator({
  stage,
  progress,
  message,
  tool,
  userLogs,
  technicalLogs,
  error,
}: RagProgressIndicatorProps) {
  const [showDetails, setShowDetails] = useState(false)

  if (stage === 'idle') {
    return null
  }

  const isComplete = stage === 'complete'
  const isError = stage === 'error'
  const toolLabel = getToolLabel(tool)

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
      {/* Header: spinner + tool icon + name + badge */}
      <div className="flex items-center gap-2">
        {!isComplete && !isError && (
          <span className="inline-block w-4 h-4 border-2 border-slate-400 border-t-slate-200 rounded-full animate-spin" />
        )}
        {isComplete && (
          <span className="flex items-center justify-center w-4 h-4 bg-emerald-500 rounded-full">
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        )}
        {isError && (
          <span className="flex items-center justify-center w-4 h-4 bg-red-500 rounded-full">
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
        )}

        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 11-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 016.336-4.486l-3.276 3.276a3.004 3.004 0 002.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852z" />
        </svg>

        <span className="font-medium text-slate-800">{toolLabel}</span>

        <span className="px-1.5 py-0.5 text-[10px] font-medium text-slate-500 bg-slate-200 rounded">
          call
        </span>
      </div>

      {/* Progress section */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Progress</span>
          <span className="font-mono">{progress}/100</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ease-out rounded-full ${
              isError ? 'bg-red-500' : 'bg-slate-800'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* User-friendly terminal - shows what user cares about */}
      {userLogs.length > 0 && (
        <div className="p-3 bg-slate-800 rounded-lg font-mono text-xs space-y-1">
          {userLogs.slice(-4).map((log, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-sky-400 select-none">{'>_'}</span>
              <span className={
                log.level === 'error' ? 'text-red-400' :
                log.level === 'warn' ? 'text-amber-400' :
                'text-sky-400'
              }>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Error message for user */}
      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Show technical details toggle */}
      {technicalLogs.length > 0 && (
        <>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            <svg
              className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {showDetails ? 'Ukryj szczegóły' : 'Pokaż szczegóły'}
          </button>

          {/* Technical details - what's happening under the hood */}
          {showDetails && (
            <div className="p-3 bg-slate-900 rounded-lg font-mono text-xs max-h-48 overflow-y-auto space-y-1 border border-slate-700">
              <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-2">
                Dziennik techniczny
              </div>
              {technicalLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px]">
                  <span className="text-slate-600 shrink-0 w-16">
                    {new Date(log.timestamp).toLocaleTimeString('pl-PL', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                  <span className={
                    log.level === 'error' ? 'text-red-400' :
                    log.level === 'warn' ? 'text-amber-400' :
                    'text-emerald-400'
                  }>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
