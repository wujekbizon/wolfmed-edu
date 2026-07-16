import type { Procedure } from '@/types/dataTypes'

/**
 * Minimal, shape-agnostic input for the AI quiz generator. The only place
 * that knows the current Procedure data layout — when the procedure model
 * changes, only this adapter needs to change.
 */
export function toProcedureQuizInput(procedure: Procedure): {
  procedureId: string
  procedureName: string
  steps: string[]
} {
  return {
    procedureId: procedure.id,
    procedureName: procedure.data.name,
    steps: procedure.data.algorithm.map((entry) => entry.step),
  }
}
