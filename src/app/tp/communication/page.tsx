'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

// Helper function to format relative time
function formatDistanceToNow(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return date.toLocaleDateString()
}

interface Announcement {
  id: string
  title: string
  content: string
  type: 'organization' | 'teacher' | 'student'
  priority: 'low' | 'medium' | 'high'
  author: {
    id: string
    name: string
    role: string
  }
  createdAt: string
  scheduledFor?: string
  isRead: boolean
}

// Mock data - replace with actual API calls later
const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: '1',
    title: 'Platform Maintenance Scheduled',
    content: 'The Teaching Playground will undergo scheduled maintenance on Sunday from 2 AM to 4 AM. All rooms will be temporarily unavailable during this time.',
    type: 'organization',
    priority: 'high',
    author: { id: 'admin1', name: 'Admin Team', role: 'admin' },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false
  },
  {
    id: '2',
    title: 'New Features: Participant Controls',
    content: 'We have added new participant control features including hand raise, mute all, and kick participant. Check the documentation for details.',
    type: 'teacher',
    priority: 'medium',
    author: { id: 'admin1', name: 'Product Team', role: 'admin' },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isRead: true
  },
  {
    id: '3',
    title: 'Best Practices for Online Teaching',
    content: 'Join our webinar on Friday at 3 PM to learn best practices for engaging students in virtual classrooms.',
    type: 'teacher',
    priority: 'low',
    author: { id: 'admin2', name: 'Training Team', role: 'admin' },
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    isRead: true
  }
]

export default function CommunicationPage() {
  const { user } = useUser()
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS)
  const [filter, setFilter] = useState<'all' | 'organization' | 'teacher' | 'student'>('all')
  const [showComposer, setShowComposer] = useState(false)
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'teacher' as 'organization' | 'teacher' | 'student',
    priority: 'medium' as 'low' | 'medium' | 'high'
  })

  const userRole = user?.publicMetadata?.role as 'teacher' | 'student' | 'admin' || 'student'
  const isAdmin = userRole === 'admin'
  const isTeacher = userRole === 'teacher' || isAdmin

  // Filter announcements based on user role
  const visibleAnnouncements = announcements.filter(announcement => {
    // Apply type filter
    if (filter !== 'all' && announcement.type !== filter) return false

    // Role-based visibility
    if (announcement.type === 'organization') return true
    if (announcement.type === 'teacher') return isTeacher
    if (announcement.type === 'student') return true

    return true
  })

  const unreadCount = announcements.filter(a => !a.isRead).length

  const handleMarkAsRead = (id: string) => {
    setAnnouncements(prev =>
      prev.map(a => (a.id === id ? { ...a, isRead: true } : a))
    )
  }

  const handleCreateAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      alert('Please fill in all fields')
      return
    }

    const announcement: Announcement = {
      id: Date.now().toString(),
      ...newAnnouncement,
      author: {
        id: user?.id || '',
        name: user?.fullName || user?.username || 'Unknown',
        role: userRole
      },
      createdAt: new Date().toISOString(),
      isRead: false
    }

    setAnnouncements(prev => [announcement, ...prev])
    setNewAnnouncement({
      title: '',
      content: '',
      type: 'teacher',
      priority: 'medium'
    })
    setShowComposer(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Communication</h1>
          <p className="text-zinc-400 mt-2">
            Announcements and messages for the teaching community
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowComposer(!showComposer)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Announcement
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Announcements"
          value={announcements.length}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          }
          color="blue"
        />
        <StatCard
          title="Unread"
          value={unreadCount}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          }
          color="yellow"
        />
        <StatCard
          title="High Priority"
          value={announcements.filter(a => a.priority === 'high').length}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          color="red"
        />
      </div>

      {/* Composer */}
      {showComposer && isAdmin && (
        <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-6">
          <h2 className="text-xl font-semibold text-zinc-100 mb-4">
            Create Announcement
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter announcement title"
                className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Content
              </label>
              <textarea
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter announcement content"
                rows={4}
                className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Audience
                </label>
                <select
                  value={newAnnouncement.type}
                  onChange={(e) => setNewAnnouncement(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="organization">Organization-wide</option>
                  <option value="teacher">Teachers Only</option>
                  <option value="student">Students</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Priority
                </label>
                <select
                  value={newAnnouncement.priority}
                  onChange={(e) => setNewAnnouncement(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateAnnouncement}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Publish Announcement
              </button>
              <button
                onClick={() => setShowComposer(false)}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'organization', 'teacher', 'student'] as const).map((type) => {
          // Don't show student filter if user is not admin/teacher
          if (type === 'student' && !isTeacher) return null

          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          )
        })}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {visibleAnnouncements.length === 0 ? (
          <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-zinc-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-zinc-500 text-lg">No announcements to display</p>
          </div>
        ) : (
          visibleAnnouncements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onMarkAsRead={handleMarkAsRead}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: 'blue' | 'yellow' | 'red'
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
    red: 'bg-red-500/10 text-red-400'
  }

  return (
    <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-4">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-zinc-400">{title}</p>
          <p className="text-2xl font-bold text-zinc-100">{value}</p>
        </div>
      </div>
    </div>
  )
}

interface AnnouncementCardProps {
  announcement: Announcement
  onMarkAsRead: (id: string) => void
}

function AnnouncementCard({ announcement, onMarkAsRead }: AnnouncementCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const priorityColors = {
    low: 'bg-zinc-600 text-zinc-200',
    medium: 'bg-yellow-600 text-yellow-100',
    high: 'bg-red-600 text-red-100'
  }

  const typeColors = {
    organization: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    teacher: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    student: 'bg-green-500/10 text-green-400 border-green-500/20'
  }

  return (
    <div className={`bg-zinc-800 rounded-lg border ${announcement.isRead ? 'border-zinc-700' : 'border-blue-500/30'} p-6`}>
      <div className="flex items-start gap-4">
        {/* Unread Indicator */}
        {!announcement.isRead && (
          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
        )}

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                {announcement.title}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-1 rounded text-xs font-medium border ${typeColors[announcement.type]}`}>
                  {announcement.type}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[announcement.priority]}`}>
                  {announcement.priority}
                </span>
                <span className="text-xs text-zinc-500">
                  by {announcement.author.name} • {formatDistanceToNow(new Date(announcement.createdAt))}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {!announcement.isRead && (
                <button
                  onClick={() => onMarkAsRead(announcement.id)}
                  className="p-2 text-zinc-400 hover:text-blue-400 transition-colors"
                  title="Mark as read"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className={`text-zinc-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
            {announcement.content}
          </div>

          {announcement.content.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-400 hover:text-blue-300 text-sm mt-2 transition-colors"
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
