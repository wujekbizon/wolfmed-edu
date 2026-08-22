import type { ReactNode } from 'react'
import RagResponse from './RagResponse'
import RagUserMessage from './RagUserMessage'
import type { RagMessage } from '@/types/ragCellTypes'

interface RagConversationProps {
  messages: RagMessage[]
  pendingQuestion: string | null
  progress: ReactNode
}

export default function RagConversation({
  messages,
  pendingQuestion,
  progress,
}: RagConversationProps) {
  if (messages.length === 0 && !pendingQuestion) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-zinc-400 text-center">
          Zadaj pytanie aby rozpocząć rozmowę z asystentem AI
        </p>
      </div>
    )
  }

  return (
    <>
      {messages.map((message, index) =>
        message.role === 'user' ? (
          <RagUserMessage key={index} text={message.text} />
        ) : (
          <div key={index} className="flex justify-start">
            <div className="w-full sm:w-auto sm:max-w-[80%]">
              <RagResponse answer={message.text} sources={message.sources} />
            </div>
          </div>
        )
      )}

      {pendingQuestion && <RagUserMessage text={pendingQuestion} />}

      {progress && (
        <div className="flex justify-start">
          <div className="w-full sm:max-w-[80%]">{progress}</div>
        </div>
      )}
    </>
  )
}
