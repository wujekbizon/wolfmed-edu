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


async function NoteData({ noteId, userId }: { noteId: string; userId: string }) {
    const note = await getNoteById(userId, noteId)

    if (!note) {
        return <NoteNotFound />
    }

    return (
        <>
            <BackToNotesLink />
            <NoteMetadataCard
                title={note.title}
                category={note.category}
                tags={note.tags}
                pinned={note.pinned}
                createdAt={note.createdAt}
                updatedAt={note.updatedAt}
            />
            <NotePageContent note={note} />
            <div className="h-8"></div>
        </>
    )
}

export default async function NotePage({ params }: Props) {
    const { userId } = await auth()

    if (!userId) {
        redirect('/sign-in')
    }

    const { noteId } = await params

    return (
        <section className="relative min-h-screen p-3 sm:p-6 md:p-8 overflow-hidden bg-linear-to-br from-rose-50/30 via-white/60 to-fuchsia-100/40">
            <div className="relative max-w-5xl mx-auto">
                <Suspense fallback={<NotePageSkeleton />}>
                    <NoteData noteId={noteId} userId={userId} />
                </Suspense>
            </div>
        </section>
    )
}
