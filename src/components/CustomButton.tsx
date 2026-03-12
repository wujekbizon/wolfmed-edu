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
 const { toggleSidePanel,closeSidePanel } = useStore((state) => state)

  const linkContent = (
    <Link
      href={props.href}
      className={`group relative flex items-center gap-3.5 px-3 py-2 rounded-xl
        transition-all duration-200
        ${props.active
          ? 'text-zinc-950'
          : 'text-zinc-700 hover:text-zinc-900'
        }
        ${props.showTooltip ? 'justify-center' : ''}`}
        onClick={closeSidePanel}
    >
      <span
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200
          ${props.active
            ? 'bg-linear-to-r from-[#f65555]/90 to-[#ffc5c5]/90 shadow-sm shadow-rose-200/60 border border-zinc-700/80'
            : 'bg-zinc-200 border border-zinc-400 group-hover:bg-zinc-100 group-hover:shadow-sm'
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
