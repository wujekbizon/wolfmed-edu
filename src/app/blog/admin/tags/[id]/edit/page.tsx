import { Suspense } from 'react'
import { getBlogTagById } from '@/server/queries'
import TagForm from '@/components/blog/admin/TagForm'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface EditTagPageProps {
  params: Promise<{
    id: string
  }>
}

async function EditTagWithData(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const tag = await getBlogTagById(id)

  if (!tag) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-zinc-600 mb-2">
          <Link href="/blog/admin" className="hover:text-indigo-600">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/blog/admin/categories" className="hover:text-indigo-600">
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

export default function EditTagPage(props: EditTagPageProps) {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto animate-pulse">Ładowanie...</div>}>
      <EditTagWithData params={props.params} />
    </Suspense>
  )
}
