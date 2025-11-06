import CategoryForm from '@/components/blog/admin/CategoryForm'
import Link from 'next/link'

export default async function NewCategoryPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-zinc-600 mb-2">
          <Link href="/blog/admin" className="hover:text-red-600">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/blog/admin/categories" className="hover:text-red-600">
            Kategorie i Tagi
          </Link>
          <span>/</span>
          <span className="text-zinc-900">Nowa Kategoria</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900">Utwórz Nową Kategorię</h1>
        <p className="text-zinc-600 mt-2">
          Wypełnij formularz poniżej, aby utworzyć nową kategorię bloga
        </p>
      </div>

      <CategoryForm mode="create" />
    </div>
  )
}
