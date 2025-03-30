import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TeachingPlayground, type User } from '@teaching-playground/core'
import { usePlaygroundStore } from './usePlaygroundStore'

interface AuthState {
  isAuthenticated: boolean
  username: string | null
  login: (username: string, password: string) => boolean
  logout: () => void
}

if (!process.env.NEXT_PUBLIC_TEACHER_USERNAME || !process.env.NEXT_PUBLIC_TEACHER_PASSWORD) {
  console.warn('Teacher credentials not found in environment variables')
}

const TEACHER_USERNAME = process.env.NEXT_PUBLIC_TEACHER_USERNAME
const TEACHER_PASSWORD = process.env.NEXT_PUBLIC_TEACHER_PASSWORD

const createDummyTeacher = (username: string): User => ({
  id: 'teacher_123',
  name: username,
  email: `${username}@example.com`,
  role: 'teacher' as const,
  status: 'active' as const,
})

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      username: null,
      login: (username: string, password: string) => {
        const isValid = username === TEACHER_USERNAME && password === TEACHER_PASSWORD
        if (isValid) {
          set({ isAuthenticated: true, username })
          // Initialize playground after successful login
          const teacher = createDummyTeacher(username)
          const playground = new TeachingPlayground({
            roomConfig: {},
            commsConfig: {},
            eventConfig: {},
            dataConfig: {},
          })
          playground.setCurrentUser(teacher)
          usePlaygroundStore.getState().setPlayground(playground)
        }
        return isValid
      },
      logout: () => {
        set({ isAuthenticated: false, username: null })
        // Reset playground on logout
        usePlaygroundStore.getState().reset()
      },
    }),
    {
      name: 'auth-storage',
    }
  )
) 