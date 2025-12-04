interface DrawerHandleProps {
  onClick?: () => void
}

export default function DrawerHandle({ onClick }: DrawerHandleProps) {
  return (
    <div
      onClick={onClick}
      className="absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-1 px-4 py-1 rounded-full transition-all duration-200 cursor-pointer hover:bg-zinc-700/50 border border-zinc-500"
    >
      <div className="flex items-center gap-1 animate-pulse">
        <span className="block w-1.5 h-1.5 bg-zinc-100 rounded-full"></span>
        <span className="block w-1.5 h-1.5 bg-zinc-100 rounded-full"></span>
        <span className="block w-1.5 h-1.5 bg-zinc-100 rounded-full"></span>
      </div>
    </div>
  )
}
