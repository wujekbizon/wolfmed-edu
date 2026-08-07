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
