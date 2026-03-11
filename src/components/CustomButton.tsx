import Link from 'next/link'
import { Tooltip } from './Tooltip'

export default function CustomButton(props: {
  children?: React.ReactNode
  href: string
  text: string
  active?: boolean
  showTooltip?: boolean
}) {
  const linkContent = (
    <Link
      href={props.href}
      className={`group relative flex items-center gap-3.5 px-3 py-2 rounded-xl
        transition-all duration-200
        ${props.active
          ? 'text-rose-600'
          : 'text-zinc-700 hover:text-zinc-900 hover:bg-rose-50/80'
        }
        ${props.showTooltip ? 'justify-center' : ''}`}
    >
      {props.active && (
        <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-rose-400" />
      )}
      <span
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200
          ${props.active
            ? 'bg-gradient-to-br from-rose-100 to-red-50 shadow-sm shadow-rose-200/60'
            : 'bg-white border border-zinc-200 group-hover:bg-zinc-50 group-hover:shadow-sm'
          }`}
      >
        <span className="transition-transform duration-200 group-hover:scale-110">
          {props.children}
        </span>
      </span>
      {!props.showTooltip && (
        <span className={`text-sm whitespace-nowrap overflow-hidden ${props.active ? 'font-semibold' : 'font-medium'}`}>
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
