import { Suspense } from 'react'
import { getAllMessages } from '@/server/queries'
import MessageManagement from '@/components/MessageManagement'
import { MessageListSkeleton } from '@/components/skeletons/MessageListSkeleton'


async function AsyncMessageList({ page }: { page: number }) {
  const { messages, pagination } = await getAllMessages(page, 20)

  return <MessageManagement initialMessages={messages} initialPagination={pagination} />
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1

  return (
    <Suspense fallback={<MessageListSkeleton />}>
      <AsyncMessageList page={page} />
    </Suspense>
  )
}
