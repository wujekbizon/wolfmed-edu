/**
 * Blog utility functions
 * Handles slug generation, reading time calculation, and other blog-related utilities
 */

/**
 * Generate a URL-friendly slug from a title
 * Handles Polish characters and special characters
 * @param title - The title to convert to a slug
 * @returns URL-friendly slug
 */
export function generateSlug(title: string): string {
  // Polish character mappings
  const polishChars: Record<string, string> = {
    ą: 'a',
    ć: 'c',
    ę: 'e',
    ł: 'l',
    ń: 'n',
    ó: 'o',
    ś: 's',
    ź: 'z',
    ż: 'z',
    Ą: 'A',
    Ć: 'C',
    Ę: 'E',
    Ł: 'L',
    Ń: 'N',
    Ó: 'O',
    Ś: 'S',
    Ź: 'Z',
    Ż: 'Z',
  }

  // Replace Polish characters
  let slug = title
  Object.entries(polishChars).forEach(([polish, latin]) => {
    slug = slug.replace(new RegExp(polish, 'g'), latin)
  })

  return (
    slug
      .toLowerCase()
      .normalize('NFD') // Normalize to decomposed form
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Remove duplicate hyphens
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
  )
}

/**
 * Calculate estimated reading time based on content
 * @param content - The content to analyze (Markdown or plain text)
 * @param wordsPerMinute - Average reading speed (default: 200 WPM)
 * @returns Reading time in minutes
 */
export function calculateReadingTime(
  content: string,
  wordsPerMinute: number = 200
): number {
  // Remove markdown syntax for more accurate word count
  const plainText = content
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]+`/g, '') // Remove inline code
    .replace(/[#*_~]/g, '') // Remove markdown symbols

  const wordCount = plainText.split(/\s+/).filter((word) => word.length > 0)
    .length

  const minutes = Math.ceil(wordCount / wordsPerMinute)
  return Math.max(1, minutes) // Minimum 1 minute
}

/**
 * Truncate text to a specified length with ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length (default: 160)
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

/**
 * Format date for display
 * @param date - The date to format
 * @param locale - The locale to use (default: 'pl-PL')
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, locale: string = 'pl-PL'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj)
}

/**
 * Format relative time (e.g., "2 days ago")
 * @param date - The date to format
 * @param locale - The locale to use (default: 'pl-PL')
 * @returns Relative time string
 */
export function formatRelativeTime(
  date: Date | string,
  locale: string = 'pl-PL'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - dateObj.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (years > 0) return rtf.format(-years, 'year')
  if (months > 0) return rtf.format(-months, 'month')
  if (weeks > 0) return rtf.format(-weeks, 'week')
  if (days > 0) return rtf.format(-days, 'day')
  if (hours > 0) return rtf.format(-hours, 'hour')
  if (minutes > 0) return rtf.format(-minutes, 'minute')
  return rtf.format(-seconds, 'second')
}

/**
 * Extract excerpt from content if not provided
 * @param content - The full content
 * @param maxLength - Maximum excerpt length (default: 200)
 * @returns Generated excerpt
 */
export function extractExcerpt(content: string, maxLength: number = 200): string {
  // Remove markdown syntax
  const plainText = content
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/[#*_~]/g, '')
    .trim()

  // Get first paragraph or sentence
  const firstParagraph = plainText.split('\n\n')[0] || plainText
  return truncateText(firstParagraph, maxLength)
}

/**
 * Count words in text
 * @param text - The text to count
 * @returns Word count
 */
export function countWords(text: string): number {
  return text.split(/\s+/).filter((word) => word.length > 0).length
}

/**
 * Validate slug format
 * @param slug - The slug to validate
 * @returns True if valid, false otherwise
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}

/**
 * Ensure slug is unique by appending a number if needed
 * @param slug - The desired slug
 * @param existingSlugs - Array of existing slugs to check against
 * @returns Unique slug
 */
export function ensureUniqueSlug(
  slug: string,
  existingSlugs: string[]
): string {
  let uniqueSlug = slug
  let counter = 1

  while (existingSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`
    counter++
  }

  return uniqueSlug
}

/**
 * Parse tags from comma-separated string
 * @param tagsString - Comma-separated tags
 * @returns Array of cleaned tag names
 */
export function parseTags(tagsString: string): string[] {
  return tagsString
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
}

/**
 * Format tags as comma-separated string
 * @param tags - Array of tag names
 * @returns Comma-separated string
 */
export function formatTags(tags: string[]): string {
  return tags.join(', ')
}

/**
 * Calculate similarity score between two posts based on category and tags
 * Used for related posts algorithm
 * @param post1Tags - Tags from first post
 * @param post2Tags - Tags from second post
 * @param post1Category - Category ID from first post
 * @param post2Category - Category ID from second post
 * @returns Similarity score (higher is more similar)
 */
export function calculateSimilarityScore(
  post1Tags: string[],
  post2Tags: string[],
  post1Category: string | null,
  post2Category: string | null
): number {
  let score = 0

  // Same category adds 3 points
  if (post1Category && post2Category && post1Category === post2Category) {
    score += 3
  }

  // Each matching tag adds 1 point
  const matchingTags = post1Tags.filter((tag) => post2Tags.includes(tag))
  score += matchingTags.length

  return score
}

/**
 * Sanitize HTML content (basic sanitization)
 * For production, consider using a library like DOMPurify
 * @param html - HTML content to sanitize
 * @returns Sanitized HTML
 */
export function sanitizeHtml(html: string): string {
  // Basic sanitization - remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
}

/**
 * Generate meta description from content if not provided
 * @param content - The content to extract from
 * @param maxLength - Maximum length (default: 160 for SEO)
 * @returns Meta description
 */
export function generateMetaDescription(
  content: string,
  maxLength: number = 160
): string {
  return extractExcerpt(content, maxLength)
}

/**
 * Generate keywords from content (simple extraction)
 * @param content - The content to analyze
 * @param maxKeywords - Maximum number of keywords (default: 10)
 * @returns Comma-separated keywords
 */
export function extractKeywords(
  content: string,
  maxKeywords: number = 10
): string {
  // Remove common Polish stop words
  const stopWords = [
    'i',
    'w',
    'z',
    'na',
    'do',
    'o',
    'się',
    'że',
    'to',
    'jest',
    'nie',
    'a',
    'ale',
    'lub',
    'po',
    'od',
    'dla',
    'jak',
    'gdy',
    'może',
    'co',
    'już',
    'tylko',
    'można',
    'który',
    'każdy',
    'tak',
    'być',
    'mieć',
  ]

  const words = content
    .toLowerCase()
    .replace(/[^\wąćęłńóśźż\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 4 && !stopWords.includes(word))

  // Count word frequency
  const wordFreq = new Map<string, number>()
  words.forEach((word) => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1)
  })

  // Sort by frequency and get top keywords
  const topKeywords = Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word)

  return topKeywords.join(', ')
}
