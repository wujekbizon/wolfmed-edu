import SidePanel from '@/app/_components/SidePanel'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-[calc(100vh_-_70px)] justify-center w-full flex-row relative p-2">
      <SidePanel />
      {children}
    </main>
  )
}
