import TagForm from '@/components/admin/TagForm'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function NewTagPage() {
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
          <span className="text-zinc-900">Nowy Tag</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900">Utwórz Nowy Tag</h1>
        <p className="text-zinc-600 mt-2">
          Wypełnij formularz poniżej, aby utworzyć nowy tag bloga
        </p>
      </div>

      <TagForm mode="create" />
    </div>
  )
}
