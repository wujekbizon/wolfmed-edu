import type { ReactNode } from 'react'
import type { FormState } from './actionTypes'
import type { SourceRef } from './retrievalTypes'
import type { RagMessage } from './ragCellTypes'
import type { RagCellInput } from '@/hooks/useRagCellInput'
import type { CommandSelection } from '@/hooks/useCommandSelection'

export type RagCellProps = { cell: { id: string; content: string } }
export type RagComposerProps = {
  cellId: string
  topic: string
  state: FormState
  isPending: boolean
  input: RagCellInput
  selection: CommandSelection
  onSubmit: (data: FormData) => void
  noScriptFallback: ReactNode
}
export type RagConversationProps = {
  messages: RagMessage[]
  pendingQuestion: string | null
  progress: ReactNode
}
export type RagWolfekResponseProps = { answer: string; sources?: SourceRef[] | undefined }
export type RagWolfekHeaderProps = { pending: boolean }
export type RagCopyButtonProps = { text: string }
