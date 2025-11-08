'use client'

import { useEffect } from 'react'

interface RoomCleanupNoticeProps {
  visible: boolean
  reason: string
  onDismiss: () => void
}

export function RoomCleanupNotice({ visible, reason, onDismiss }: RoomCleanupNoticeProps) {
  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onDismiss()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [visible, onDismiss])

  if (!visible) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg max-w-md">
        <div className="flex items-start gap-3">
          {/* Info icon */}
          <svg
            className="w-5 h-5 mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>

          {/* Content */}
          <div className="flex-1">
            <p className="font-medium">Room Cleared</p>
            <p className="text-sm opacity-90 mt-1">{reason}</p>
          </div>

          {/* Close button */}
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
            aria-label="Dismiss notification"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
