import CreatePostButton from './CreatePostButton'

export default function ForumHeader() {
  return (
    <div className="p-4 xs:p-6 border-b border-zinc-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl xs:text-5xl py-1 font-bold bg-linear-to-r from-red-200 to-red-500 bg-clip-text text-transparent">
            Forum dyskusyjne
          </h1>
          <p className="text-zinc-200 text-base font-light">Dołącz do dyskusji i dziel się swoimi doświadczeniami</p>
        </div>
        <CreatePostButton />
      </div>
    </div>
  )
}
