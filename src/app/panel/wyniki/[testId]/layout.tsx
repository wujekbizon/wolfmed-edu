// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <main className="flex h-[calc(100vh-76px)] justify-center w-full flex-row py-4 sm:py-8">{children}</main>
}
