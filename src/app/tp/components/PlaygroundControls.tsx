'use client'

import { useState } from 'react'
import { usePlaygroundStore } from '@/store/usePlaygroundStore'
import { useAuthStore } from '@/store/useAuthStore'
import type { Lecture } from '@teaching-playground/core'
import { formatLectureDate } from '@/helpers/formatDate'
import UpdateLectureForm from './UpdateLectureForm'
import CreateLectureForm from './CreateLectureForm'
import CancelLectureForm from './CancelLectureForm'
import EndLectureForm from './EndLectureForm'
import clsx from 'clsx'
import LectureFilter, { LectureFilterType } from './LectureFilter'

const statusStyles: Record<Lecture['status'], string> = {
  scheduled: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'in-progress': 'text-green-400 bg-green-500/10 border-green-500/20',
  completed: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
  cancelled: 'text-red-400 bg-red-500/10 border-red-500/20 line-through',
  delayed: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
} as const

export default function PlaygroundControls({ events }: { events: Lecture[] }) {
  const [activeTab, setActiveTab] = useState<LectureFilterType>('all')
  const { isAuthenticated } = useAuthStore()
  const {
    error,
    isCreateModalOpen,
    selectedLecture,
    setCreateModalOpen,
    setSelectedLecture,
  } = usePlaygroundStore()

  if (!isAuthenticated) {
    return null
  }

  const filteredEvents = events
    .filter((event) => activeTab === 'all' || event.status === activeTab)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <>
      {error && (
        <div className="bg-red-500/10 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}
      <section className="bg-zinc-800 shadow-lg rounded-lg p-6 border border-zinc-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-zinc-100">Playground Controls</h2>
        </div>
        <div className="space-x-4">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-md hover:bg-blue-500/20 transition-colors"
          >
            Create New Lecture
          </button>
        </div>
      </section>

      <section className="bg-zinc-800 shadow-lg rounded-lg p-6 mt-8 border border-zinc-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-zinc-100">Current Lectures</h2>
          <LectureFilter activeTab={activeTab} onTabChange={setActiveTab} events={events} />
        </div>

        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className={clsx(
                'border rounded-lg p-4',
                'flex justify-between items-start',
                'transition-colors duration-200',
                statusStyles[event.status]
              )}
            >
              <div>
                <h3 className={clsx('font-medium', event.status === 'cancelled' && 'line-through text-zinc-500')}>
                  {event.name}
                </h3>
                <div className="text-sm text-zinc-400 mt-1">
                  <p>Date: {formatLectureDate(event.date)}</p>
                  <p>Room: {event.roomId}</p>
                  <p>Participants: {event.maxParticipants}</p>
                  <p>Status: {event.status}</p>
                </div>
              </div>
              <div className="space-x-2">
                {event.status === 'scheduled' && (
                  <>
                    <button
                      onClick={() => setSelectedLecture(event)}
                      className="px-3 py-1 text-sm bg-blue-500/10 text-blue-400 rounded-md hover:bg-blue-500/20 transition-colors"
                    >
                      Edit
                    </button>
                    <CancelLectureForm event={event} />
                  </>
                )}
                {event.status === 'in-progress' && <EndLectureForm event={event} />}
              </div>
            </div>
          ))}
          {filteredEvents.length === 0 && (
            <p className="text-zinc-400 text-center py-4">No {activeTab} lectures found</p>
          )}
        </div>
      </section>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-zinc-800 rounded-lg p-6 max-w-md w-full border border-zinc-700">
            <h3 className="text-lg text-zinc-100 font-medium mb-4">Create New Lecture</h3>
            <CreateLectureForm />
          </div>
        </div>
      )}

      {selectedLecture && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-zinc-800 rounded-lg p-6 max-w-md w-full border border-zinc-700">
            <h3 className="text-lg text-zinc-100 font-medium mb-4">Edit Lecture</h3>
            <UpdateLectureForm lecture={selectedLecture} />
          </div>
        </div>
      )}
    </>
  )
}
