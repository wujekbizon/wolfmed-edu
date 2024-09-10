import SidePanel from '../_components/SidePanel'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-[calc(100vh_-_70px)] justify-center w-full flex-row relative pb-1 px-2">
      <SidePanel />
      {children}
    </main>
  )
}
