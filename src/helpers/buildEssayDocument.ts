import { stripContextCitations } from '@/helpers/stripContextCitations'

export function buildEssayDocument(topic: string, sections: { title: string; paragraphs: string[] }[]): string {
  const blocks = [{ type: 'heading', tag: 'h1', text: topic }, ...sections.flatMap((section) => [
    { type: 'heading', tag: 'h2', text: section.title },
    ...section.paragraphs.map((text) => ({ type: 'paragraph', text: stripContextCitations(text) })),
  ])]
  return JSON.stringify({ root: {
    type: 'root', version: 1, format: '', indent: 0, direction: null,
    children: blocks.map(({ text, ...block }) => ({
      ...block, version: 1, format: '', indent: 0, direction: null,
      children: [{ type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' }],
    })),
  } })
}
