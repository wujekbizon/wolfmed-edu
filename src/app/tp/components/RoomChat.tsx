'use client'

import { useState, useEffect, useRef } from 'react'

interface ChatMessage {
  userId: string
  username: string
  content: string
  timestamp: string
}

interface RoomChatProps {
  messages: Array<ChatMessage>
  onSendMessage: (content: string) => void
  isEnabled: boolean
}

export default function RoomChat({ messages, onSendMessage, isEnabled }: RoomChatProps) {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !isEnabled) return

    onSendMessage(inputValue.trim())
    setInputValue('')
  }

  if (!isEnabled) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-zinc-500 text-center p-4">
          <svg
            className="w-8 h-8 mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p>Chat is disabled</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-zinc-700">
        <h3 className="font-medium text-zinc-200">Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={`${message.userId}-${index}`} className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="font-medium text-zinc-200">
                {message.username}
              </span>
              <span className="text-xs text-zinc-500">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-zinc-300 mt-1">{message.content}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-700">
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-zinc-900 text-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
} 