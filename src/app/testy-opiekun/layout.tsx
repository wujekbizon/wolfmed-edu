import SidePanel from '../_components/SidePanel'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-[calc(100vh_-_86px)] sm:h-[calc(100vh_-_110px)] justify-center w-full flex-row relative py-6 px-2">
      <SidePanel />
      {children}
    </main>
  )
}
