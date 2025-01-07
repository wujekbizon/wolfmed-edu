'use client'

import { useState } from 'react'
import { TeachingPlayground } from '../../../../packages/core/src/engine/TeachingPlayground'
import { User } from '../../../../packages/core/src/interfaces/user.interface'
import { Lecture } from '../../../../packages/core/src/interfaces/event.interface'
import PlaygroundForm from './PlaygroundForm'
import { formatLectureDate } from '@/helpers/formatDate'

const dummyTeacher: User = {
  id: 'teacher_123',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'teacher',
  status: 'active',
}

export default function PlaygroundControls({ initialEvents }: { initialEvents: Lecture[] }) {
  const [playground, setPlayground] = useState<TeachingPlayground | null>(null)
  const [events, setEvents] = useState(initialEvents)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const initializePlayground = () => {
    const tp = new TeachingPlayground({
      roomConfig: {},
      commsConfig: {},
      eventConfig: {},
      dataConfig: {},
    })
    tp.setCurrentUser(dummyTeacher)
    setPlayground(tp)
  }

  const cancelLecture = async (lectureId: string) => {
    if (!playground) return
    setError(null)

    try {
      await playground.cancelLecture(lectureId)
      setEvents(events.map((event) => (event.id === lectureId ? { ...event, status: 'cancelled' } : event)))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to cancel lecture')
    }
  }

  const updateLecture = async (lectureId: string, updates: Partial<Lecture>) => {
    if (!playground) return
    setError(null)

    try {
      const updatedLecture = await playground.updateLecture(lectureId, updates)
      setEvents(events.map((event) => (event.id === lectureId ? updatedLecture : event)))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update lecture')
    }
  }

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
            onClick={initializePlayground}
            disabled={!!playground}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            Initialize Playground
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!playground}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
          >
            Create New Lecture
          </button>
        </div>
      </section>

      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Current Lectures</h2>
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="border rounded p-4 hover:bg-gray-50 flex justify-between items-start">
              <div>
                <h3 className="font-medium">{event.name}</h3>
                <div className="text-sm text-gray-500 mt-1">
                  <p>Date: {formatLectureDate(event.date)}</p>
                  <p>Status: {event.status}</p>
                  <p>Room: {event.roomId}</p>
                </div>
              </div>
              <div className="space-x-2">
                <button
                  //onClick={() => setSelectedEvent(event)}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  disabled={event.status === 'cancelled'}
                >
                  Edit
                </button>
                <button
                  onClick={() => cancelLecture(event.id)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  disabled={event.status === 'cancelled'}
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
          {events.length === 0 && <p className="text-gray-500">No lectures created yet.</p>}
        </div>
      </section>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Create New Lecture</h3>
            <PlaygroundForm onCancel={() => setIsCreateModalOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
