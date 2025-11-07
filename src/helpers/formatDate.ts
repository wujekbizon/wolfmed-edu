export function formatDate(date: string): string {
  const now = new Date()
  const postDate = new Date(date)
  const diffMs = now.getTime() - postDate.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHour / 24)

  // Less than 1 minute
  if (diffSec < 60) {
    return 'przed chwilą'
  }

  // Less than 1 hour
  if (diffMin < 60) {
    return `${diffMin} ${diffMin === 1 ? 'minutę' : 'minut'} temu`
  }

  // Less than 24 hours
  if (diffHour < 24) {
    return `${diffHour} ${diffHour === 1 ? 'godzinę' : 'godzin'} temu`
  }

  // Less than 7 days
  if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'dzień' : 'dni'} temu`
  }

  // More than 7 days - show full date
  return postDate.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatLectureDate(dateString: string) {
  return new Date(dateString).toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDaysAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  if (diffDays === 0) return 'dzisiaj'
  else if (diffDays === 1) return 'wczoraj'
  else if (diffDays < 7) return `${diffDays} dni temu`
  else if (diffWeeks < 4) return `${diffWeeks} ${diffWeeks === 1 ? 'tydzień' : 'tygodnie'} temu`
  else if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? 'miesiąc' : 'miesięcy'} temu`
  else return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
}
