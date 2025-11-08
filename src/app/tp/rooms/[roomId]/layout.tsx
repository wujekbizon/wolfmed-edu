import { requireAuth } from '@/lib/teacherHelpers'

interface RoomLayoutProps {
  children: React.ReactNode
  params: Promise<{
    roomId: string
  }>
}

export default async function RoomLayout({ children }: RoomLayoutProps) {
  // Allow both teachers and students to access rooms
  await requireAuth()

  return (
    <div className="min-h-screen bg-zinc-900">
      {children}
    </div>
  )
} 