import { notFound } from 'next/navigation'
import BlogPost from '@/app/_components/BlogPost'
import { blogPosts } from '@/data/blogPosts'
import { Metadata, ResolvingMetadata } from 'next'

export const dynamic = 'force-static'

type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params, searchParams }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const id = params.id
  const post = blogPosts.find((p) => p.id === id)

  if (!post) {
    return {
      title: 'Wolfmed Blog Medyczny',
    }
  }

  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default function BlogPostPage({ params, searchParams }: Props) {
  const post = blogPosts.find((p) => p.id === params.id)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-[calc(100vh_-_70px)] w-full flex flex-col items-center justify-start p-8 bg-[#fff5f5]">
      <BlogPost post={post} />
    </div>
  )
}
