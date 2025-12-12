'use client'

import { formatDate } from '@/helpers/formatDate'

type RelativeTimeProps = {
  date: string
  className?: string
}

export default function RelativeTime({ date, className }: RelativeTimeProps) {
  return (
    <time className={className}>
      {formatDate(date)}
    </time>
  )
}