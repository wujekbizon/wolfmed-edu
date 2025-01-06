'use client'

import { useState } from 'react'

import { TeachingPlayground } from 'packages/core/src/engine/TeachingPlayground'
import { User } from 'packages/core/src/interfaces/user.interface'

const dummyTeacher: User = {
  id: 'teacher_123',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'teacher',
  status: 'active',
}

export default function TpPage() {
  const [playground, setPlayground] = useState<TeachingPlayground | null>(null)
  const [events, setEvents] = useState<any[]>([])

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

  const createLecture = async () => {
    if (!playground) return

    try {
      const lecture = await playground.scheduleLecture({
        name: `Lecture ${Date.now()}`,
        date: new Date().toISOString(),
        roomId: 'room_1',
        description: 'Test lecture',
        maxParticipants: 30,
      })

      const updatedEvents = await playground.getTeacherLectures()
      setEvents(updatedEvents)
    } catch (error) {
      console.error('Failed to create lecture:', error)
    }
  }

  return (
    <div className="space-y-8">
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
            onClick={createLecture}
            disabled={!playground}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
          >
            Create Test Lecture
          </button>
        </div>
      </section>

      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Current Lectures</h2>
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="border rounded p-4 hover:bg-gray-50">
              <h3 className="font-medium">{event.name}</h3>
              <div className="text-sm text-gray-500 mt-1">
                <p>Date: {new Date(event.date).toLocaleString()}</p>
                <p>Status: {event.status}</p>
                <p>Room: {event.roomId}</p>
              </div>
            </div>
          ))}
          {events.length === 0 && <p className="text-gray-500">No lectures created yet.</p>}
        </div>
      </section>

      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">System Status</h2>
        <pre className="bg-gray-50 p-4 rounded">
          {playground ? JSON.stringify(playground.getSystemStatus(), null, 2) : 'Playground not initialized'}
        </pre>
      </section>
    </div>
  )
}
