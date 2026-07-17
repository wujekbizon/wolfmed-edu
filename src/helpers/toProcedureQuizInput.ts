import type { Procedure } from '@/types/dataTypes'
import type { PielegniastwoProcedure } from '@/types/pielegniastwoTypes'

type AnyProcedureData = Procedure['data'] | PielegniastwoProcedure

/**
 * Minimal, shape-agnostic input for the AI quiz generator — the only place
 * that knows procedure data layouts. Handles both bodies: the flat
 * opiekun-medyczny `algorithm` and the sectioned pielęgniarstwo checklist
 * (flattened in section order).
 */
export function toProcedureQuizInput(procedure: {
  id: string
  data: unknown
}): {
  procedureId: string
  procedureName: string
  steps: string[]
} {
  const data = procedure.data as AnyProcedureData

  const steps =
    'algorithm' in data
      ? data.algorithm.map((entry) => entry.step)
      : data.sections.flatMap((section) =>
          section.steps.map((entry) => entry.step)
        )

  return {
    procedureId: procedure.id,
    procedureName: data.name,
    steps,
  }
}
