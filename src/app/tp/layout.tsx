import { getUserRole } from '@/lib/teacherHelpers'
import TeachingPlaygroundNavbar from "./components/TeachingPlaygroundNavbar"
import TeachingPlaygroundSidebar from "./components/TeachingPlaygroundSidebar"
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Teaching Playground - Wolfmed',
  description: 'Wirtualna sala lekcyjna dla nauczycieli i studentów',
  robots: 'noindex, nofollow',
}

export default async function TeachingPlaygroundLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Middleware handles access control, just get the role for UI
  const userRole = await getUserRole()
  const isTeacher = userRole === 'teacher' || userRole === 'admin'

  return (
    <section className="h-[calc(100vh-6px)] bg-zinc-900 text-zinc-100">
      <TeachingPlaygroundNavbar />
      <div className="flex h-[calc(100vh-73px)]">
        {/* Only show sidebar for teachers */}
        {isTeacher && <TeachingPlaygroundSidebar />}
        <section className="flex-1 overflow-auto scrollbar-webkit">
          <div className={`${isTeacher ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8' : 'h-full'}`}>
            {children}
          </div>
        </section>
      </div>
    </section>
  )
}
