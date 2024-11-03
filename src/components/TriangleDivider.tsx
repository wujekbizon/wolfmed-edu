interface TriangleDividerProps {
  className: string
  direction: 'right' | 'left'
}

export default function TriangleDivider({ className, direction }: TriangleDividerProps) {
  return (
    <div
      className={`${className} ${
        direction === 'right' ? 'border-r-[calc(100vw_-_6px)]' : 'border-l-[calc(100vw_-_6px)]'
      } w-0 h-0 border-solid`}
    ></div>
  )
}
