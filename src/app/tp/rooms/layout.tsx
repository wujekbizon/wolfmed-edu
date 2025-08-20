
interface RoomsLayoutProps {
  children: React.ReactNode
}

export default function RoomsLayout({ children }: RoomsLayoutProps) {
 
  return (
    <div className="min-h-screen bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  )
} 