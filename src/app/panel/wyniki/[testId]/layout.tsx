export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <main className="flex h-[calc(100vh-76px)] justify-center w-full flex-row py-4 sm:py-8">{children}</main>
}
