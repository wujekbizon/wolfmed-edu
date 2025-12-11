import SidePanel from '@/app/_components/SidePanel'
import PinnedNotesSection from '@/components/PinnedNotesSection'
import ConfirmModal from '@/components/ConfirmModal'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-row relative h-[calc(100vh-80px)] w-full bg-white">
      <SidePanel />
      <div id="scroll-container" className="flex-1 overflow-y-scroll scrollbar-webkit">
        <PinnedNotesSection />
        <div className="py-10">
          {children}
        </div>
      </div>
      <ConfirmModal />
    </main>
  )
}

