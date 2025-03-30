'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Lecture } from '@teaching-playground/core'
import { LectureCard } from './LectureCard'
import LectureFilter, { LectureFilterType } from './LectureFilter'

interface FilteredLectureListProps {
  events: Lecture[]
}

export function FilteredLectureList({ events }: FilteredLectureListProps) {
  const [activeFilter, setActiveFilter] = useState<LectureFilterType>('scheduled')

  // Cache all events
  const { data: cachedEvents } = useQuery({
    queryKey: ['allLectures'],
    queryFn: async () => {
      // Sort events by date, most recent first
      return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    },
    initialData: events,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  })

  // Filter events based on active filter
  const filteredEventsQueryFn = async () => {
    if (activeFilter === 'all') return cachedEvents
    return cachedEvents.filter((event) => event.status === activeFilter)
  }

  const { data: filteredEvents = [] } = useQuery({
    queryKey: ['filteredLectures', activeFilter],
    queryFn: filteredEventsQueryFn,
    enabled: !!cachedEvents,
    staleTime: 10 * 60 * 1000,
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-zinc-100">Current Lectures</h2>
        <LectureFilter 
          events={cachedEvents} 
          activeTab={activeFilter} 
          onTabChange={setActiveFilter}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((lecture) => (
            <LectureCard key={lecture.id} lecture={lecture} />
          ))
        ) : (
          <div className="col-span-full text-center text-zinc-400 py-8">
            No {activeFilter} lectures found
          </div>
        )}
      </div>
    </div>
  )
} 