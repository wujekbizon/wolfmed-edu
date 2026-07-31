import { requireUser } from '@/helpers/requireUser'

export default async function BlogLayout({ children }: { children: React.ReactNode }) {
  await requireUser()

  return (
    <main>
      {children}
    </main>
  )
}
