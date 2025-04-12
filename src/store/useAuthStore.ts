import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TeachingPlayground, type User } from '@teaching-playground/core'
import { usePlaygroundStore } from './usePlaygroundStore'

// Create a singleton instance of TeachingPlayground
let playgroundInstance: TeachingPlayground | null = null

const getPlaygroundInstance = () => {
  if (!playgroundInstance) {
    playgroundInstance = new TeachingPlayground({
      roomConfig: {},
      commsConfig: {},
      eventConfig: {},
      dataConfig: {},
    })
    console.log('Created singleton TeachingPlayground instance')
  }
  return playgroundInstance
}

interface AuthState {
  isAuthenticated: boolean
  username: string | null
  userRole: 'teacher' | 'student' | null
  login: (username: string, password: string) => boolean
  logout: () => void
}

const TEACHER_USERNAME = process.env.NEXT_PUBLIC_TEACHER_USERNAME
const TEACHER_PASSWORD = process.env.NEXT_PUBLIC_TEACHER_PASSWORD
const STUDENT_USERNAME = process.env.NEXT_PUBLIC_STUDENT_USERNAME
const STUDENT_PASSWORD = process.env.NEXT_PUBLIC_STUDENT_PASSWORD

const createUser = (username: string, role: 'teacher' | 'student'): User => ({
  id: role === 'teacher' ? 'teacher_123' : 'student_123',
  username,
  role,
  status: 'online',
})

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      username: null,
      userRole: null,
      login: (username: string, password: string) => {
        console.log('Login attempt:', { username, password })
        console.log('Expected credentials:', {
          teacher: { username: TEACHER_USERNAME, password: TEACHER_PASSWORD },
          student: { username: STUDENT_USERNAME, password: STUDENT_PASSWORD }
        })

        const isTeacher = username === TEACHER_USERNAME && password === TEACHER_PASSWORD
        const isStudent = username === STUDENT_USERNAME && password === STUDENT_PASSWORD
        
        if (isTeacher || isStudent) {
          const role = isTeacher ? 'teacher' : 'student'
          console.log('Login successful:', { role })
          
          set({ isAuthenticated: true, username, userRole: role })
          
          const user = createUser(username, role)
          const playground = getPlaygroundInstance() // Use singleton instance
          playground.setCurrentUser(user)
          usePlaygroundStore.getState().setPlayground(playground)
          return true
        }
        console.log('Login failed: Invalid credentials')
        return false
      },
      logout: () => {
        set({ isAuthenticated: false, username: null, userRole: null })
        usePlaygroundStore.getState().reset()
      },
    }),
    {
      name: 'auth-storage',
    }
  )
) 