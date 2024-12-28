import { SortOption } from '@/store/useForumSearch'

export const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Najnowsze' },
  { value: 'oldest', label: 'Najstarsze' },
  { value: 'most_comments', label: 'Najwięcej komentarzy' },
  { value: 'recent_activity', label: 'Ostatnia aktywność' },
]
