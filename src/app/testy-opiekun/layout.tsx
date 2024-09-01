import SidePanel from '../_components/SidePanel'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-[calc(100vh_-_86px)] sm:h-[calc(100vh_-_110px)] w-full flex-row relative py-6 pr-0 sm:pr-2 border-t border-zinc-500/30">
      <SidePanel />
      {children}
    </main>
  )
}
