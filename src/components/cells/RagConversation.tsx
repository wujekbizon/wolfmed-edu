import RagWolfekResponse from './RagWolfekResponse'
import RagUserMessage from './RagUserMessage'
import type { RagConversationProps } from '@/types/ragCellUiTypes'

export default function RagConversation({ messages, pendingQuestion, progress }: RagConversationProps) {
  if (messages.length === 0 && !pendingQuestion && !progress) {
    return (
      <div className='flex min-h-full flex-col justify-center gap-1 px-1 py-4'>
        <p className='text-sm font-medium text-zinc-700'>Czego dziś się uczymy?</p>
        <p className='max-w-md text-xs leading-relaxed text-zinc-500'>Zapytaj Wolfka o temat z kursu lub dołącz swoje materiały przez @.</p>
      </div>
    )
  }

  return (
    <>
      {messages.map((message, index) => message.role === 'user'
        ? <RagUserMessage key={index} text={message.text} />
        : <div key={index} className='w-full max-w-3xl'>
            <RagWolfekResponse answer={message.text} sources={message.sources} />
          </div>)}
      {pendingQuestion && <RagUserMessage text={pendingQuestion} />}
      {progress && <div className='w-full max-w-3xl'>{progress}</div>}
    </>
  )
}
