import SidePanel from '@/app/_components/SidePanel'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-row relative h-[calc(100vh-80px)] justify-center w-full bg-white">
      <SidePanel />
      {children}
    </main>
  )
}
