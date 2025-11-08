'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

interface RoomDefaults {
  // Room Features
  hasVideo: boolean
  hasAudio: boolean
  hasChat: boolean
  hasWhiteboard: boolean
  hasScreenShare: boolean

  // Stream Settings
  defaultQuality: 'low' | 'medium' | 'high'
  maxParticipants: number

  // Auto-Features
  autoEnableCamera: boolean
  autoMuteOnJoin: boolean

  // Notifications
  notifyHandRaise: boolean
  notifyParticipantJoin: boolean
  notifyParticipantLeave: boolean
  notifyKicked: boolean
}

const DEFAULT_SETTINGS: RoomDefaults = {
  hasVideo: true,
  hasAudio: true,
  hasChat: true,
  hasWhiteboard: false,
  hasScreenShare: true,
  defaultQuality: 'high',
  maxParticipants: 30,
  autoEnableCamera: false,
  autoMuteOnJoin: true,
  notifyHandRaise: true,
  notifyParticipantJoin: true,
  notifyParticipantLeave: false,
  notifyKicked: true,
}

export default function SettingsPage() {
  const { user } = useUser()
  const [settings, setSettings] = useState<RoomDefaults>(DEFAULT_SETTINGS)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('tp-room-defaults')
    if (saved) {
      try {
        setSettings(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse saved settings:', e)
      }
    }
  }, [])

  const handleToggle = (key: keyof RoomDefaults) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleQualityChange = (quality: 'low' | 'medium' | 'high') => {
    setSettings(prev => ({ ...prev, defaultQuality: quality }))
  }

  const handleMaxParticipantsChange = (value: number) => {
    setSettings(prev => ({ ...prev, maxParticipants: value }))
  }

  const handleSave = () => {
    setIsSaving(true)
    // Save to localStorage
    localStorage.setItem('tp-room-defaults', JSON.stringify(settings))

    // Simulate save delay
    setTimeout(() => {
      setIsSaving(false)
      setSaveMessage('Settings saved successfully!')
      setTimeout(() => setSaveMessage(null), 3000)
    }, 500)
  }

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS)
    localStorage.removeItem('tp-room-defaults')
    setSaveMessage('Settings reset to defaults')
    setTimeout(() => setSaveMessage(null), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Settings</h1>
        <p className="text-zinc-400 mt-2">
          Configure default preferences for your teaching rooms
        </p>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg">
          {saveMessage}
        </div>
      )}

      {/* Room Features */}
      <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-6">
        <h2 className="text-xl font-semibold text-zinc-100 mb-4">
          Default Room Features
        </h2>
        <p className="text-sm text-zinc-400 mb-6">
          These settings will be applied when creating new rooms
        </p>

        <div className="space-y-4">
          <ToggleRow
            label="Video"
            description="Enable video streaming"
            enabled={settings.hasVideo}
            onToggle={() => handleToggle('hasVideo')}
          />
          <ToggleRow
            label="Audio"
            description="Enable audio streaming"
            enabled={settings.hasAudio}
            onToggle={() => handleToggle('hasAudio')}
          />
          <ToggleRow
            label="Chat"
            description="Enable text chat"
            enabled={settings.hasChat}
            onToggle={() => handleToggle('hasChat')}
          />
          <ToggleRow
            label="Whiteboard"
            description="Enable collaborative whiteboard"
            enabled={settings.hasWhiteboard}
            onToggle={() => handleToggle('hasWhiteboard')}
          />
          <ToggleRow
            label="Screen Share"
            description="Enable screen sharing"
            enabled={settings.hasScreenShare}
            onToggle={() => handleToggle('hasScreenShare')}
          />
        </div>
      </div>

      {/* Stream Settings */}
      <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-6">
        <h2 className="text-xl font-semibold text-zinc-100 mb-4">
          Stream Settings
        </h2>

        <div className="space-y-6">
          {/* Default Quality */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Default Video Quality
            </label>
            <div className="flex gap-3">
              {(['low', 'medium', 'high'] as const).map((quality) => (
                <button
                  key={quality}
                  onClick={() => handleQualityChange(quality)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    settings.defaultQuality === quality
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  }`}
                >
                  {quality.charAt(0).toUpperCase() + quality.slice(1)}
                  <span className="block text-xs text-zinc-400 mt-1">
                    {quality === 'low' && '640x480'}
                    {quality === 'medium' && '1280x720'}
                    {quality === 'high' && '1920x1080'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Max Participants */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Maximum Participants
            </label>
            <input
              type="number"
              min="2"
              max="100"
              value={settings.maxParticipants}
              onChange={(e) => handleMaxParticipantsChange(parseInt(e.target.value))}
              className="w-32 px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Recommended: 2-30 for optimal performance
            </p>
          </div>
        </div>
      </div>

      {/* Auto-Features */}
      <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-6">
        <h2 className="text-xl font-semibold text-zinc-100 mb-4">
          Auto-Features
        </h2>
        <p className="text-sm text-zinc-400 mb-6">
          Automatic behaviors when joining a room
        </p>

        <div className="space-y-4">
          <ToggleRow
            label="Auto-enable Camera"
            description="Automatically turn on camera when joining a room"
            enabled={settings.autoEnableCamera}
            onToggle={() => handleToggle('autoEnableCamera')}
          />
          <ToggleRow
            label="Auto-mute on Join"
            description="Automatically mute microphone when joining a room"
            enabled={settings.autoMuteOnJoin}
            onToggle={() => handleToggle('autoMuteOnJoin')}
          />
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-6">
        <h2 className="text-xl font-semibold text-zinc-100 mb-4">
          Notification Preferences
        </h2>
        <p className="text-sm text-zinc-400 mb-6">
          Choose which events trigger system notifications
        </p>

        <div className="space-y-4">
          <ToggleRow
            label="Hand Raise Notifications"
            description="Get notified when a student raises their hand"
            enabled={settings.notifyHandRaise}
            onToggle={() => handleToggle('notifyHandRaise')}
          />
          <ToggleRow
            label="Participant Join"
            description="Get notified when someone joins the room"
            enabled={settings.notifyParticipantJoin}
            onToggle={() => handleToggle('notifyParticipantJoin')}
          />
          <ToggleRow
            label="Participant Leave"
            description="Get notified when someone leaves the room"
            enabled={settings.notifyParticipantLeave}
            onToggle={() => handleToggle('notifyParticipantLeave')}
          />
          <ToggleRow
            label="Kick Notifications"
            description="Get notified when a participant is removed"
            enabled={settings.notifyKicked}
            onToggle={() => handleToggle('notifyKicked')}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 font-medium rounded-lg transition-colors"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  )
}

interface ToggleRowProps {
  label: string
  description: string
  enabled: boolean
  onToggle: () => void
}

function ToggleRow({ label, description, enabled, onToggle }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-zinc-700 last:border-0">
      <div className="flex-1">
        <h3 className="text-sm font-medium text-zinc-100">{label}</h3>
        <p className="text-xs text-zinc-500 mt-1">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-zinc-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}
