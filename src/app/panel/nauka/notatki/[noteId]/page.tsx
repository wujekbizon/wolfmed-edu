import { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getNoteById } from '@/server/queries'
import NotePageContent from '@/components/NotePageContent'
import BackToNotesLink from '@/components/BackToNotesLink'
import NoteMetadataCard from '@/components/NoteMetadataCard'
import NoteNotFound from '@/components/NoteNotFound'
import NotePageSkeleton from '@/components/skeletons/NotePageSkeleton'

type Props = {
    params: Promise<{
        noteId: string
    }>
}

export const dynamic = 'force-dynamic'

async function NoteData({ noteId, userId }: { noteId: string; userId: string }) {
    const note = await getNoteById(userId, noteId)

    if (!note) {
        return <NoteNotFound />
    }

    return (
        <div className="flex flex-col lg:grid lg:grid-cols-[260px_1fr] lg:gap-8 lg:items-start gap-4">
            <aside className="lg:sticky lg:top-6">
                <NoteMetadataCard
                    title={note.title}
                    category={note.category}
                    tags={note.tags}
                    pinned={note.pinned}
                    createdAt={note.createdAt}
                    updatedAt={note.updatedAt}
                />
            </aside>
            <NotePageContent note={note} />
        </div>
    )
}

export default async function NotePage({ params }: Props) {
    const { userId } = await auth()

    if (!userId) {
        redirect('/sign-in')
    }

    const { noteId } = await params

    return (
        <section className="relative min-h-screen overflow-hidden bg-linear-to-br from-rose-50/30 via-white/60 to-fuchsia-100/40">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 pt-4 sm:pt-6">
                <BackToNotesLink />
            </div>
            <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 pb-12">
                <Suspense fallback={<NotePageSkeleton />}>
                    <NoteData noteId={noteId} userId={userId} />
                </Suspense>
            </div>
        </section>
    )
}
