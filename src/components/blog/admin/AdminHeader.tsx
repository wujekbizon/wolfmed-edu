import Link from 'next/link'

export default function AdminHeader() {
  return (
    <header className="bg-zinc-900 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-red-500">
              Admin Panel
            </h1>
            <nav className="hidden md:flex space-x-4">
              <Link
                href="/blog/admin"
                className="text-zinc-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/blog/admin/posts"
                className="text-zinc-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Posty
              </Link>
              <Link
                href="/blog/admin/posts/new"
                className="text-zinc-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Nowy Post
              </Link>
              <Link
                href="/blog/admin/messages"
                className="text-zinc-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Wiadomości
              </Link>
              <Link
                href="/blog/admin/categories"
                className="text-zinc-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Kategorie
              </Link>
            </nav>
          </div>
          <div>
            <Link
              href="/blog"
              className="text-zinc-300 hover:text-white text-sm font-medium transition-colors"
            >
              ← Powrót do Bloga
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden pb-4 flex flex-wrap gap-2">
          <Link
            href="/blog/admin"
            className="text-zinc-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/blog/admin/posts"
            className="text-zinc-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Posty
          </Link>
          <Link
            href="/blog/admin/posts/new"
            className="text-zinc-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Nowy Post
          </Link>
          <Link
            href="/blog/admin/messages"
            className="text-zinc-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Wiadomości
          </Link>
          <Link
            href="/blog/admin/categories"
            className="text-zinc-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Kategorie
          </Link>
        </nav>
      </div>
    </header>
  )
}
