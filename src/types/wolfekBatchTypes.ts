import type { FormState } from './actionTypes'
import type { WolfekBuiltRequest, WolfekDecision, WolfekQuestionRequest, WolfekQuestionState } from './wolfekResponseTypes'

export type WolfekPreparedQuestion = { id: string; prompt: string }
export type WolfekPreparedQuestionButtonProps = {
  question: WolfekPreparedQuestion; pending: boolean; onSelect: (id: string) => void; active?: boolean
}
export type WolfekBatchRequest = WolfekQuestionRequest & { visitId: string }
export type WolfekPreparedBatch = {
  id: string; visitId: string; contextVersion: string; states: Record<string, WolfekQuestionState>
}
export type WolfekBatchState = FormState & { batch: WolfekPreparedBatch | null }
export type WolfekBatchReceipt = {
  request: WolfekBatchRequest; contextVersion: string; states: Record<string, WolfekQuestionState>; consumed: boolean
}
export type WolfekBuiltBatch = WolfekBuiltRequest & { preparedQuestions: WolfekPreparedQuestion[] }
export type WolfekBatchDecisions = Record<string, WolfekDecision>
export type WolfekBatchEvaluator = (
  payload: WolfekBuiltRequest['payload'], parse: (raw: unknown) => WolfekBatchDecisions | null,
) => Promise<WolfekBatchDecisions | null>
export type WolfekVisitContext = { id: string; viewer: string; ready: boolean; getVisitId: () => string }
