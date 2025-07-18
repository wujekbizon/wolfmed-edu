import SidePanel from '@/app/_components/SidePanel'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-row relative h-[calc(100vh-70px)] bg-linear-to-b from-zinc-500 via-purple-100 to-zinc-300 justify-center w-[calc(100vw-6px)] rounded-br-3xl lg:rounded-br-[50px] rounded-bl-3xl lg:rounded-bl-[50px] p-2">
      <SidePanel />
      {children}
    </main>
  )
}
