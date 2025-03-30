import Link from 'next/link'
import { Room } from '@teaching-playground/core'

interface RoomListProps {
  rooms: Room[]
}

export function RoomList({ rooms }: RoomListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => (
        <Link
          key={room.id}
          href={`/tp/rooms/${room.id}`}
          className="block bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors"
        >
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-medium text-zinc-100">
                  {room.name}
                </h2>
                <p className="text-sm text-zinc-400 mt-1">
                  {room.participants.length} / {room.capacity} participants
                </p>
              </div>
              <span
                className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${
                    room.status === 'available'
                      ? 'bg-green-500/10 text-green-400'
                      : room.status === 'occupied'
                      ? 'bg-yellow-500/10 text-yellow-400'
                      : 'bg-red-500/10 text-red-400'
                  }
                `}
              >
                {room.status}
              </span>
            </div>

            <div className="mt-4 flex gap-2">
              {room.features.hasVideo && (
                <span className="text-zinc-400" title="Video">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </span>
              )}
              {room.features.hasAudio && (
                <span className="text-zinc-400" title="Audio">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </span>
              )}
              {room.features.hasChat && (
                <span className="text-zinc-400" title="Chat">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </span>
              )}
              {room.features.hasWhiteboard && (
                <span className="text-zinc-400" title="Whiteboard">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                    />
                  </svg>
                </span>
              )}
              {room.features.hasScreenShare && (
                <span className="text-zinc-400" title="Screen Sharing">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </span>
              )}
            </div>

            {room.currentLecture && (
              <div className="mt-4 pt-4 border-t border-zinc-700">
                <p className="text-sm text-zinc-400">
                  Current Lecture: {room.currentLecture.name}
                </p>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
} 