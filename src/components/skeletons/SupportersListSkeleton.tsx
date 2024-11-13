export default function SupportersListSkeleton() {
  return (
    <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="flex flex-col items-center animate-pulse">
          <div
            className={`w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-2 sm:mb-3 shadow-md border border-zinc-400/40 backdrop-blur-sm ${
              index === 0
                ? 'bg-blue-100/60'
                : index === 1
                ? 'bg-green-100/60'
                : index === 2
                ? 'bg-yellow-100/60'
                : index === 3
                ? 'bg-red-100/60'
                : index === 4
                ? 'bg-purple-100/60'
                : 'bg-pink-100/60'
            }`}
          />
          <div className="h-4 bg-zinc-200/60 backdrop-blur-sm rounded-full w-16 sm:w-20" />
        </div>
      ))}
    </div>
  )
}
