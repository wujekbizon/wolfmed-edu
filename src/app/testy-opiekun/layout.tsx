import SidePanel from '../_components/SidePanel'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-[calc(100vh_-_112px)] sm:h-[calc(100vh_-_144px)] w-full flex-row relative pt-2 border-t border-zinc-500/30">
      <SidePanel />
      {children}
    </main>
  )
}
