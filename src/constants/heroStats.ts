export interface HeroStat {
  value: number
  suffix?: string | undefined
  label: string
}

// Placeholder marketing figures — swap these for real platform numbers.
export const heroStats: HeroStat[] = [
  { value: 6500, suffix: '+', label: 'Aktywnych studentów' },
  { value: 1200, suffix: '+', label: 'Pytań testowych' },
  { value: 90, suffix: '+', label: 'Procedur medycznych' },
  { value: 98, suffix: '%', label: 'Zadowolonych użytkowników' },
]
