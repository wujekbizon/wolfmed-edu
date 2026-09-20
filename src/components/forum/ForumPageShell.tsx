import CreatePostButton from '@/components/CreatePostButton'
import ForumToolbar from '@/components/forum/ForumToolbar'

export default function ForumPageShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto min-h-screen w-full max-w-7xl px-0 py-0 xs:px-4 xs:py-8">
      <div className="overflow-hidden rounded-t-lg bg-zinc-900">
        <div className="border-b border-zinc-800 p-4 xs:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="bg-linear-to-r from-red-200 to-red-500 bg-clip-text py-1 text-2xl font-bold text-transparent xs:text-5xl">
                Forum dyskusyjne
              </h1>
              <p className="text-base font-light text-zinc-200">
                Dołącz do dyskusji i dziel się swoimi doświadczeniami
              </p>
            </div>
            <CreatePostButton />
          </div>
        </div>
      </div>
      <ForumToolbar />
      <div className="mt-6">{children}</div>
    </section>
  )
}
