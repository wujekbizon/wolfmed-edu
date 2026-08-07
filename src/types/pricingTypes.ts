export type ComparisonValue = boolean | string

export type ComparisonRow = {
  label: string
  basic: ComparisonValue
  premium: ComparisonValue
}

export type ComparisonGroup = {
  label: string
  rows: ComparisonRow[]
}

export type CourseSubject = {
  category: string
  title: string
  semester: string
  ects: number
}

export type CourseSubjectYear = {
  year: number
  label: string
  subjects: CourseSubject[]
}
