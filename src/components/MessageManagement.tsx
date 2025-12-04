'use client'

import { useActionState, useOptimistic, startTransition } from 'react'
import { markMessageAsReadAction } from '@/actions/messages'
import { formatDate } from '@/lib/blogUtils'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import SubmitButton from './SubmitButton'

interface Message {
  id: number
  email: string
  message: string
  isRead: boolean
  createdAt: Date
}

interface MessageManagementProps {
  initialMessages: Message[]
  initialPagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function MessageManagement({ initialMessages, initialPagination }: MessageManagementProps) {
  const [state, action] = useActionState(markMessageAsReadAction, EMPTY_FORM_STATE)

  const [optimisticMessages, markAsReadOptimistic] = useOptimistic(
    initialMessages,
    (currentMessages, messageId: number) =>
      currentMessages.map(msg =>
        msg.id === messageId ? { ...msg, isRead: true } : msg
      )
  )

  const toastMessage = useToastMessage(state)

  const handleMarkAsRead = (messageId: number) => {
    startTransition(() => {
      markAsReadOptimistic(messageId)
    })
  }

  const handleReply = (email: string, message: string) => {
    const subject = encodeURIComponent('Re: Your message to Wolfmed')
    const body = encodeURIComponent(`\n\n---\nOriginal message:\n${message}`)
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
  }

  return (
    <div className="space-y-6">
      {toastMessage}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">Wiadomości od użytkowników</h2>
        <p className="text-zinc-600 mt-1">
          Łącznie {initialPagination.total} wiadomości
        </p>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200">
        {optimisticMessages.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            Brak wiadomości
          </div>
        ) : (
          <div className="divide-y divide-zinc-200">
            {optimisticMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-6 hover:bg-zinc-50 transition-colors ${
                  !msg.isRead ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {!msg.isRead && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Nowe
                        </span>
                      )}
                      <span className="text-sm font-medium text-zinc-900">
                        {msg.email}
                      </span>
                      <span className="text-sm text-zinc-500">
                        {formatDate(msg.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-700 whitespace-pre-wrap">
                      {msg.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!msg.isRead && (
                      <>
                        <form action={action} onSubmit={() => handleMarkAsRead(msg.id)}>
                          <input type="hidden" name="messageId" value={msg.id} />
                          <SubmitButton
                            label="Oznacz jako przeczytane"
                            loading="Oznaczanie..."
                            className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          />
                        </form>
                        <button
                          onClick={() => handleReply(msg.email, msg.message)}
                          className="px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                        >
                          Odpowiedz
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {initialPagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-600">
            Strona {initialPagination.page} z {initialPagination.totalPages}
          </p>
          <div className="flex gap-2">
            {initialPagination.page > 1 && (
              <a
                href={`?page=${initialPagination.page - 1}`}
                className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50"
              >
                Poprzednia
              </a>
            )}
            {initialPagination.page < initialPagination.totalPages && (
              <a
                href={`?page=${initialPagination.page + 1}`}
                className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50"
              >
                Następna
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
