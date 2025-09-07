import SidePanel from '@/app/_components/SidePanel'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-row relative h-[calc(100vh-80px)] bg-linear-to-b from-zinc-500 via-purple-100 to-zinc-300 justify-center w-full p-2">
      <SidePanel />
      {children}
    </main>
  )
}
