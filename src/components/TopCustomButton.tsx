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
              active ? 'bg-zinc-100 border-zinc-400' : 'bg-white border-zinc-200'
            } flex cursor-pointer place-items-center gap-4 stroke-zinc-500 stroke-[0.75] px-[5px] py-1 text-zinc-700 transition-all rounded-md border hover:bg-zinc-100 hover:border-zinc-400 hover:text-zinc-900`}
          >
            {icon}
          </button>
          {badgeCount > 0 && (
            <span className="absolute -bottom-3 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-zinc-700 text-white text-xs font-bold border border-white shadow-md">
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
