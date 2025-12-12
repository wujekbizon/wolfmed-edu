import { Suspense } from 'react'
import { getAllMessages } from '@/server/queries'
import MessageManagement from '@/components/MessageManagement'
import { MessageListSkeleton } from '@/components/skeletons/MessageListSkeleton'

async function AsyncMessageList({ page }: { page: number }) {
  const { messages, pagination } = await getAllMessages(page, 20)

  return <MessageManagement initialMessages={messages} initialPagination={pagination} />
}

export default function MessagesPage(props: {
  searchParams: Promise<{ page?: string }>
}) {
  return (
    <Suspense fallback={<MessageListSkeleton />}>
      <AsyncMessageListWrapper searchParams={props.searchParams} />
    </Suspense>
  )
}

async function AsyncMessageListWrapper({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams
  const page = Number(params.page) || 1
  return <AsyncMessageList page={page} />
}
