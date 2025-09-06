export default function SupportersListSkeleton() {
    const placeholders = Array.from({ length: 6 })
  
    return (
      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
        {placeholders.map((_, index) => (
          <div
            key={index}
            className={`flex flex-col items-center animate-pulse`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 rounded-full bg-zinc-300 mb-2 sm:mb-3" />
            <div className="h-3 w-12 xs:w-16 sm:w-20 rounded bg-zinc-300" />
          </div>
        ))}
      </div>
    )
  }