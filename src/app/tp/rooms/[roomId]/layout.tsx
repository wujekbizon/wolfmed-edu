interface RoomLayoutProps {
  children: React.ReactNode
  params: Promise<{
    roomId: string
  }>
}

export default function RoomLayout({ children }: RoomLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-900">
      {children}
    </div>
  )
} 