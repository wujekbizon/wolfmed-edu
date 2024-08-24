import SidePanel from '../_components/SidePanel'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-[calc(100vh_-_120px)] md:h-[calc(100vh_-_166px)] w-full flex-row  pt-4">
      <SidePanel />
      {children}
    </main>
  )
}
