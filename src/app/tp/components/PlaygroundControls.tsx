'use client'

import { useState } from 'react'
import { usePlaygroundStore } from '@/store/usePlaygroundStore'
import type { Lecture } from '@teaching-playground/core'
import { formatLectureDate } from '@/helpers/formatDate'
import UpdateLectureForm from './UpdateLectureForm'
import CreateLectureForm from './CreateLectureForm'
import CancelLectureForm from './CancelLectureForm'
import EndLectureForm from './EndLectureForm'
import clsx from 'clsx'
import LectureFilter, { LectureFilterType } from './LectureFilter'

const dummyTeacher = {
  id: 'teacher_123',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'teacher' as const,
  status: 'active' as const,
}

const statusStyles: Record<Lecture['status'], string> = {
  scheduled: 'text-blue-600 bg-blue-50 border-blue-200',
  'in-progress': 'text-green-600 bg-green-50 border-green-200',
  completed: 'text-gray-600 bg-gray-50 border-gray-200',
  cancelled: 'text-red-600 bg-red-50 border-red-200 line-through',
  delayed: 'text-yellow-600 bg-yellow-50 border-yellow-200',
} as const

export default function PlaygroundControls({ events }: { events: Lecture[] }) {
  const [activeTab, setActiveTab] = useState<LectureFilterType>('all')
  const {
    playground,
    error,
    isCreateModalOpen,
    selectedLecture,
    initializePlayground,
    setCreateModalOpen,
    setSelectedLecture,
  } = usePlaygroundStore()

  const filteredEvents = events
    .filter((event) => activeTab === 'all' || event.status === activeTab)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Playground Controls</h2>
        <div className="space-x-4">
          <button
            onClick={() => initializePlayground(dummyTeacher)}
            disabled={!!playground}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            Initialize Playground
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            disabled={!playground}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
          >
            Create New Lecture
          </button>
        </div>
      </section>

      <section className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">Current Lectures</h2>
          <LectureFilter activeTab={activeTab} onTabChange={setActiveTab} events={events} />
        </div>

        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className={clsx('border rounded-lg p-4', 'flex justify-between items-start', statusStyles[event.status])}
            >
              <div>
                <h3 className={clsx('font-medium', event.status === 'cancelled' && 'line-through text-gray-500')}>
                  {event.name}
                </h3>
                <div className="text-sm text-gray-500 mt-1">
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
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
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
            <p className="text-gray-500 text-center py-4">No {activeTab} lectures found</p>
          )}
        </div>
      </section>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-zinc-900 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg text-white font-medium mb-4">Create New Lecture</h3>
            <CreateLectureForm />
          </div>
        </div>
      )}

      {selectedLecture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Edit Lecture</h3>
            <UpdateLectureForm lecture={selectedLecture} />
          </div>
        </div>
      )}
    </>
  )
}
