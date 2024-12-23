export default async function PostPage({ params }: { params: { postId: string } }) {
  return (
    <main className="min-h-screen w-full max-w-4xl mx-auto px-4 py-8">
      <article className="bg-zinc-900 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-zinc-100 mb-4">Post Title</h1>
        <div className="prose prose-invert max-w-none">{/* Post content will go here */}</div>
      </article>
    </main>
  )
}
