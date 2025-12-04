import { forwardRef } from 'react'
import { Tooltip } from './Tooltip'

interface TopCustomButtonProps {
  onClick: () => void
  active: boolean
  badgeCount?: number
  icon: React.ReactNode
  tooltipMessage: string
}

const TopCustomButton = forwardRef<HTMLButtonElement, TopCustomButtonProps>(
  ({ onClick, active, badgeCount = 0, icon, tooltipMessage }, ref) => {
    return (
      <Tooltip message={tooltipMessage} position="bottom-right">
        <div className="relative">
          <button
            ref={ref}
            onClick={onClick}
            className={`${
              active ? 'bg-white' : 'bg-[#ffc5c5]'
            } flex cursor-pointer place-items-center gap-4 stroke-neutral-400 stroke-[0.75] px-[5px] py-1 text-zinc-900 transition-all rounded-md border border-red-200/60 hover:bg-[#f58a8a] hover:border-zinc-900 hover:stroke-neutral-100 hover:text-white`}
          >
            {icon}
          </button>
          {badgeCount > 0 && (
            <span className="absolute -bottom-3 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-zinc-500 text-white text-xs font-bold border border-zinc-800 shadow-md">
              {badgeCount}
            </span>
          )}
        </div>
      </Tooltip>
    )
  }
)

TopCustomButton.displayName = 'TopCustomButton'

export default TopCustomButton
