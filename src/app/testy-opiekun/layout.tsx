import SidePanel from '@/app/_components/SidePanel'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-[calc(100vh_-_70px)] justify-center w-[calc(100vw_-_8px)] flex-row relative p-2">
      <SidePanel />
      {children}
    </main>
  )
}
