import Link from 'next/link'
import { getBlogCategories, getBlogTags } from '@/server/queries'

export default async function CategoriesManagementPage() {
  const [categories, tags] = await Promise.all([
    getBlogCategories(),
    getBlogTags(),
  ])

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 text-sm text-zinc-600 mb-2">
          <Link href="/blog/admin" className="hover:text-red-600">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-zinc-900">Kategorie i Tagi</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900">Kategorie i Tagi</h1>
        <p className="text-zinc-600 mt-2">
          Zarządzaj organizacją treści bloga
        </p>
      </div>

      {/* Categories Section */}
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200">
        <div className="p-6 border-b border-zinc-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900">
              Kategorie ({categories.length})
            </h2>
            <Link
              href="/blog/admin/categories/new"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium text-sm"
            >
              + Nowa Kategoria
            </Link>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-zinc-500">Brak kategorii</p>
            <Link
              href="/blog/admin/categories/new"
              className="mt-4 inline-block text-red-600 hover:text-red-700 font-medium"
            >
              Utwórz pierwszą kategorię →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200">
            {categories.map((category) => (
              <div
                key={category.id}
                className="p-6 hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {category.icon && <span className="text-2xl">{category.icon}</span>}
                      <h3 className="text-lg font-semibold text-zinc-900">
                        {category.name}
                      </h3>
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.slug}
                      </span>
                    </div>
                    {category.description && (
                      <p className="text-sm text-zinc-600 mt-1">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/blog/admin/categories/${category.id}/edit`}
                      className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      Edytuj
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tags Section */}
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200">
        <div className="p-6 border-b border-zinc-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900">
              Tagi ({tags.length})
            </h2>
            <Link
              href="/blog/admin/tags/new"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium text-sm"
            >
              + Nowy Tag
            </Link>
          </div>
        </div>

        {tags.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-zinc-500">Brak tagów</p>
            <Link
              href="/blog/admin/tags/new"
              className="mt-4 inline-block text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Utwórz pierwszy tag →
            </Link>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/blog/admin/tags/${tag.id}/edit`}
                  className="group inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium transition-colors border border-indigo-200"
                >
                  <span>{tag.name}</span>
                  <span className="text-xs text-indigo-500">/{tag.slug}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Kategorie</h3>
          <p className="text-3xl font-bold text-red-600">{categories.length}</p>
          <p className="text-sm text-red-700 mt-2">
            Organizuj posty według tematyki
          </p>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-lg border border-indigo-200">
          <h3 className="text-lg font-semibold text-indigo-900 mb-2">Tagi</h3>
          <p className="text-3xl font-bold text-indigo-600">{tags.length}</p>
          <p className="text-sm text-indigo-700 mt-2">
            Dodaj szczegółowe etykiety do postów
          </p>
        </div>
      </div>
    </div>
  )
}
