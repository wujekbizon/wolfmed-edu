import { JSX } from "react"

export interface ActionButtonProps {
    icon: JSX.Element
    onClick: () => void
    className?: string
  }

export default function ActionButton({ icon, onClick, className }:ActionButtonProps) {
    return (
        <button className={`${className} flex items-center justify-center bg-slate-700 hover:bg-slate-800 transition-colors cursor-pointer w-8 h-8 rounded`} onClick={onClick}>
          {icon}
        </button>
      )
}