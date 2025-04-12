'use client'

import { useAuthStore } from '@/store/useAuthStore'
import TeachingPlaygroundHero from './TeachingPlaygroundHero'
import type { Lecture } from '@teaching-playground/core'

interface TeachingPlaygroundContentProps {
  children: React.ReactNode
  events: Lecture[]
}

export default function TeachingPlaygroundContent({ children, events }: TeachingPlaygroundContentProps) {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <TeachingPlaygroundHero />
  }

  return children
} 