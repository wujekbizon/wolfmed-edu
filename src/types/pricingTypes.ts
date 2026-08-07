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
