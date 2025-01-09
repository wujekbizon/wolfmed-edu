import ForumPosts from '@/components/ForumPosts'
import { getAllForumPosts } from '@/server/queries'
import { Suspense } from 'react'
import CreatePostButton from '@/components/CreatePostButton'
import ForumPostsSkeleton from '@/components/ForumPostsSkeleton'
import { Metadata } from 'next'

export const experimental_ppr = true

export const metadata: Metadata = {
  title: 'Wolfmed Forum Dyskusyjne ',
  description:
    'Witam na forum dyskusyjne na naszej platformie. To przestrzeń, która łączy zarówno tych, którzy dopiero przygotowują się do egzaminu na opiekuna medycznego, jak i doświadczonych opiekunów, chcących podzielić się swoimi rozwiązaniami i poradami z innymi.',
  keywords:
    'opiekun, forum, porady, dieta, opieka, bezpieczeństwo, etyka, stres, komunikacja, higiena, egzamin, pomoc, rehabilitacja, dyskusja, problemy',
}

export default async function ForumPage() {
  const posts = await getAllForumPosts()

  return (
    <section className="min-h-screen w-full max-w-7xl mx-auto px-0 xs:px-4 py-0 xs:py-8">
      <div className="bg-zinc-900 rounded-tr-lg rounded-tl-lg overflow-hidden">
        <div className="p-4 xs:p-6 border-b border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl xs:text-5xl py-1 font-bold bg-gradient-to-r from-red-200 to-red-500 bg-clip-text text-transparent">
                Forum dyskusyjne
              </h1>
              <p className="text-zinc-200 text-base font-light">
                Dołącz do dyskusji i dziel się swoimi doświadczeniami
              </p>
            </div>
            <CreatePostButton />
          </div>
        </div>
      </div>
      <Suspense fallback={<ForumPostsSkeleton />}>
        <ForumPosts posts={posts} />
      </Suspense>
    </section>
  )
}
