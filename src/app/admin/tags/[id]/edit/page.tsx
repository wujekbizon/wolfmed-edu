import { getBlogTagById } from '@/server/queries'
import TagForm from '@/components/admin/TagForm'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface EditTagPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditTagPage({ params }: EditTagPageProps) {
  const { id } = await params
  const tag = await getBlogTagById(id)

  if (!tag) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-zinc-600 mb-2">
          <Link href="/admin" className="hover:text-indigo-600">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/admin/categories" className="hover:text-indigo-600">
            Kategorie i Tagi
          </Link>
          <span>/</span>
          <span className="text-zinc-900">Edytuj Tag</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900">Edytuj Tag</h1>
        <p className="text-zinc-600 mt-2">
          Zaktualizuj szczegóły tagu poniżej
        </p>
      </div>

      <TagForm mode="edit" tag={tag} />
    </div>
  )
}
