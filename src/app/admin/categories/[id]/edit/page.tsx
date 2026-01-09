import { getBlogCategoryById } from '@/server/queries'
import CategoryForm from '@/components/admin/CategoryForm'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface EditCategoryPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params
  const category = await getBlogCategoryById(id)

  if (!category) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-zinc-600 mb-2">
          <Link href="/admin" className="hover:text-red-600">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/admin/categories" className="hover:text-red-600">
            Kategorie i Tagi
          </Link>
          <span>/</span>
          <span className="text-zinc-900">Edytuj Kategorię</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900">Edytuj Kategorię</h1>
        <p className="text-zinc-600 mt-2">
          Zaktualizuj szczegóły kategorii poniżej
        </p>
      </div>

      <CategoryForm mode="edit" category={category} />
    </div>
  )
}
