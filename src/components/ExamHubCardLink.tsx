import Link from 'next/link'
import type { ExamHubCardLinkProps } from '@/types/examHubCardTypes'

export default function ExamHubCardLink({ href, disabled, children }: ExamHubCardLinkProps) {
  const className = 'relative flex flex-col bg-white border border-zinc-200 rounded-2xl shadow-sm transition-all duration-300 overflow-hidden'

  if (disabled) {
    return <div aria-disabled="true" className={`${className} opacity-55`}>{children}</div>
  }

  return <Link href={href} className={`${className} group hover:shadow-xl hover:-translate-y-1`}>{children}</Link>
}
