'use client'

import { useRagCellForm } from '@/hooks/useRagCellForm'
import type { RagCellProps } from '@/types/ragCellUiTypes'
import RagComposer from './RagComposer'
import RagConversation from './RagConversation'
import RagWolfekHeader from './RagWolfekHeader'
import RagWolfekProgress from './RagWolfekProgress'

export default function RagCellForm({ cell }: RagCellProps) {
  const form = useRagCellForm({ cell })

  return (
    <div className='flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-rose-100 bg-linear-to-br from-zinc-50 via-[#fcfafb] to-zinc-50'>
      <RagWolfekHeader pending={form.isPending} />
      <div ref={form.conversationRef} className='min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 scrollbar-thin scrollbar-webkit sm:p-4'>
        <div ref={form.conversationContentRef} className='mx-auto min-h-full w-full max-w-4xl space-y-4'>
          <RagConversation messages={form.conversation.messages}
            pendingQuestion={form.conversation.pendingQuestion}
            progress={form.isPending && <RagWolfekProgress />} />
        </div>
      </div>
      <RagComposer cellId={cell.id}
        topic={form.conversation.messages.length === 0 ? form.conversation.topic : ''}
        state={form.state} isPending={form.isPending} input={form.input}
        selection={form.selection} onSubmit={form.handleSubmit}
        noScriptFallback={form.noScriptFallback} />
    </div>
  )
}
