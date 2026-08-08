export type StoryScene = {
  time: string
  title: string
  description: string
  photoHint: string
  imgSrc?: string
}

export type PathFact = {
  label: string
  value: string
}

export type PathStory = {
  intro: string
  facts: PathFact[]
  scenes: StoryScene[]
}

export type PathStep = {
  step: string
  duration: string
  title: string
  description: string
  photoHint: string
  imgSrc?: string
}

export type CareerPath = {
  headline: string
  steps: PathStep[]
}

export type PathQuestion = {
  question: string
  answer: string
}

export type PathShot = {
  photoHint: string
  imgSrc?: string
}

export type PathQuestions = {
  eyebrow: string
  title: string
  accent: string
  lead: string
  cta: string
  items: PathQuestion[]
  shots: PathShot[]
}
