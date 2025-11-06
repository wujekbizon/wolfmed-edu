import { getAllBlogPosts } from '@/server/queries'

export default async function DebugBlogPage() {
  const posts = await getAllBlogPosts({
    status: 'published',
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  })

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug Blog Data</h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Total Posts: {posts.length}</h2>
        </div>

        {posts.map((post) => (
          <div key={post.id} className="bg-white p-4 rounded border">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-semibold">ID:</div>
              <div className="font-mono text-xs">{post.id}</div>

              <div className="font-semibold">Title:</div>
              <div>{post.title}</div>

              <div className="font-semibold">Slug:</div>
              <div className="font-mono text-blue-600">{post.slug || '❌ NO SLUG'}</div>

              <div className="font-semibold">Status:</div>
              <div>{post.status}</div>

              <div className="font-semibold">Created:</div>
              <div>{post.createdAt.toISOString()}</div>

              <div className="col-span-2 mt-2">
                <div className="font-semibold mb-1">Expected URL:</div>
                <div className="font-mono text-green-600">/blog/{post.slug}</div>
              </div>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="bg-yellow-100 p-4 rounded">
            <p>No published posts found in database!</p>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Checklist:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Posts fetched from database: {posts.length > 0 ? '✅' : '❌'}</li>
          <li>All posts have slugs: {posts.every(p => p.slug) ? '✅' : '❌'}</li>
          <li>Expected routes: {posts.map(p => `/blog/${p.slug}`).join(', ')}</li>
        </ul>
      </div>
    </div>
  )
}
