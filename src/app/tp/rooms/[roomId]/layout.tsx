'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { usePlaygroundStore } from '@/store/usePlaygroundStore'

interface RoomLayoutProps {
  children: React.ReactNode
  params: Promise<{
    roomId: string
  }>
}

export default function RoomLayout({ children, params }: RoomLayoutProps) {
  const router = useRouter()
  const playground = usePlaygroundStore((state) => state.playground)
  const isAuthenticated = usePlaygroundStore((state) => state.isAuthenticated)
  const [hasActiveLecture, setHasActiveLecture] = useState(false)
  const { roomId } = use(params)

  // useEffect(() => {
  //   async function checkLectureStatus() {
  //     try {
  //       if (!playground) return
  //       const room = await playground.roomSystem.getRoom(roomId)
  //       setHasActiveLecture(!!room.currentLecture)
        
  //       if (room.currentLecture && !isAuthenticated) {
  //         router.push('/tp/login')
  //       }
  //     } catch (error) {
  //       console.error('Failed to check room status:', error)
  //     }
  //   }

  //   checkLectureStatus()
  // }, [playground, roomId, isAuthenticated, router])

  // if (hasActiveLecture && !isAuthenticated) {
  //   return null
  // }

  return (
    <div className="min-h-screen bg-zinc-900">
      {children}
    </div>
  )
} 