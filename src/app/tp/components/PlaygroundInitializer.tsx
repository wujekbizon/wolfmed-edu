'use client'

import { useEffect } from 'react'
import { usePlaygroundStore } from '@/store/usePlaygroundStore'

interface PlaygroundInitializerProps {
  userId: string
  username: string
  role: 'teacher' | 'student' | 'admin'
  email?: string
  displayName?: string
}

export function PlaygroundInitializer({
  userId,
  username,
  role,
  email,
  displayName
}: PlaygroundInitializerProps) {
  const { setUser, setUsername, setIsAuthenticated } = usePlaygroundStore()

  useEffect(() => {
    // Initialize the playground store with Clerk user data
    setUser({
      id: userId,
      username: username,
      role: role,
      status: 'online',
      email: email || null,
      displayName: displayName || null
    })
    setUsername(username)
    setIsAuthenticated(true)

    console.log('Playground store initialized with user:', { userId, username, role })
  }, [userId, username, role, email, displayName, setUser, setUsername, setIsAuthenticated])

  return null
}
