import Link from 'next/link'
import { Tooltip } from './Tooltip'
import { useStore } from '@/store/useStore'

export default function CustomButton(props: {
  children?: React.ReactNode
  href: string
  text: string
  active?: boolean
  showTooltip?: boolean
}) {
  const closeSidePanel = useStore((state) => state.closeSidePanel)

  const linkContent = (
    <Link
      href={props.href}
      className={`group relative flex items-center gap-3.5 rounded-xl transition-all duration-200
        ${props.active ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-100'}
        ${props.showTooltip
          ? 'justify-center'
          : 'p-1 bg-zinc-800 border border-zinc-700'
        }`}
        onClick={closeSidePanel}
    >
      <span
        className={`w-9 h-9 rounded-lg hover:bg-rose-900/40 flex items-center justify-center shrink-0 transition-all duration-200
          ${props.active
            ? 'bg-linear-to-r from-[#f65555]/90 to-[#ffc5c5]/90 shadow-sm shadow-rose-900/40 border border-rose-800/60'
            : 'bg-zinc-800 border border-zinc-700 group-hover:bg-zinc-700 group-hover:shadow-sm'
          }`}
      >
        <span className="transition-transform duration-200 group-hover:scale-110">
          {props.children}
        </span>
      </span>
      {!props.showTooltip && (
        <span className={`text-md whitespace-nowrap overflow-hidden ${props.active ? 'font-semibold' : 'font-medium'}`}>
          {props.text}
        </span>
      )}
    </Link>
  )

  if (props.showTooltip) {
    return (
      <Tooltip message={props.text} position="right">
        {linkContent}
      </Tooltip>
    )
  }

  return linkContent
}
