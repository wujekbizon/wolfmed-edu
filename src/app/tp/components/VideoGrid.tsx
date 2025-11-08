'use client'

import { useEffect, useRef } from 'react'
import VideoTile from './VideoTile'

export type VideoLayout = 'gallery' | 'speaker' | 'sidebar'

interface Participant {
  id: string
  username: string
  stream?: MediaStream
  isLocal?: boolean
  isSpeaking?: boolean
  connectionQuality?: 'excellent' | 'good' | 'poor'
  audioEnabled?: boolean
  videoEnabled?: boolean
  isScreenSharing?: boolean
}

interface VideoGridProps {
  participants: Participant[]
  layout: VideoLayout
  activeSpeakerId?: string | undefined
  onParticipantClick?: (participantId: string) => void
}

export default function VideoGrid({
  participants,
  layout,
  activeSpeakerId,
  onParticipantClick
}: VideoGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)

  // Calculate grid dimensions based on participant count
  const getGridLayout = (count: number) => {
    if (count === 1) return 'grid-cols-1'
    if (count === 2) return 'grid-cols-2'
    if (count <= 4) return 'grid-cols-2 grid-rows-2'
    if (count <= 6) return 'grid-cols-3 grid-rows-2'
    if (count <= 9) return 'grid-cols-3 grid-rows-3'
    return 'grid-cols-4 grid-rows-3'
  }

  // Gallery layout - all participants equal size in grid
  const renderGalleryLayout = () => {
    const gridLayout = getGridLayout(participants.length)

    return (
      <div
        ref={gridRef}
        className={`grid ${gridLayout} gap-2 w-full h-full p-2`}
      >
        {participants.map((participant) => (
          <VideoTile
            key={participant.id}
            participant={participant}
            onClick={() => onParticipantClick?.(participant.id)}
            isHighlighted={participant.id === activeSpeakerId}
          />
        ))}
      </div>
    )
  }

  // Speaker layout - main speaker large, others small at bottom
  const renderSpeakerLayout = () => {
    const speaker = participants.find(p => p.id === activeSpeakerId) || participants[0]
    const others = participants.filter(p => p.id !== speaker?.id)

    return (
      <div ref={gridRef} className="flex flex-col w-full h-full gap-2 p-2">
        {/* Main speaker */}
        {speaker && (
          <div className="flex-1 min-h-0">
            <VideoTile
              participant={speaker}
              onClick={() => onParticipantClick?.(speaker.id)}
              isHighlighted={true}
            />
          </div>
        )}

        {/* Other participants strip */}
        {others.length > 0 && (
          <div className="h-32 flex gap-2 overflow-x-auto">
            {others.map((participant) => (
              <div key={participant.id} className="w-40 flex-shrink-0">
                <VideoTile
                  participant={participant}
                  onClick={() => onParticipantClick?.(participant.id)}
                  isHighlighted={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Sidebar layout - main speaker with sidebar of others
  const renderSidebarLayout = () => {
    const speaker = participants.find(p => p.id === activeSpeakerId) || participants[0]
    const others = participants.filter(p => p.id !== speaker?.id)

    return (
      <div ref={gridRef} className="flex w-full h-full gap-2 p-2">
        {/* Main speaker */}
        {speaker && (
          <div className="flex-1 min-w-0">
            <VideoTile
              participant={speaker}
              onClick={() => onParticipantClick?.(speaker.id)}
              isHighlighted={true}
            />
          </div>
        )}

        {/* Sidebar with other participants */}
        {others.length > 0 && (
          <div className="w-64 flex flex-col gap-2 overflow-y-auto">
            {others.map((participant) => (
              <div key={participant.id} className="aspect-video flex-shrink-0">
                <VideoTile
                  participant={participant}
                  onClick={() => onParticipantClick?.(participant.id)}
                  isHighlighted={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderLayout = () => {
    switch (layout) {
      case 'speaker':
        return renderSpeakerLayout()
      case 'sidebar':
        return renderSidebarLayout()
      case 'gallery':
      default:
        return renderGalleryLayout()
    }
  }

  return (
    <div className="w-full h-full bg-zinc-900 rounded-lg overflow-hidden">
      {participants.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-zinc-500">No participants in the room</p>
        </div>
      ) : (
        renderLayout()
      )}
    </div>
  )
}
