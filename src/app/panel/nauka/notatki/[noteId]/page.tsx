
type Props = {
    params: Promise<{
        noteId: string
    }>
}

export default async function NotePage({ params }: Props) {
    const { noteId } = await params

    return (
        <div className="h-full w-full">
            <h2 className="text-lg text-zinc-900">
                {noteId}
            </h2>
        </div>
    )
}