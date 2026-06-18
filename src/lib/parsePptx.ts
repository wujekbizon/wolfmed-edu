import 'server-only'
import AdmZip from 'adm-zip'
import { XMLParser } from 'fast-xml-parser'

/**
 * Parses a PowerPoint (.pptx) file into Markdown suitable for a blog post.
 *
 * A .pptx is a ZIP archive of XML parts. We read slide order from
 * presentation.xml, extract text per slide (titles → ## headings, body
 * paragraphs → bullet lists). Embedded images are intentionally skipped —
 * PPTX slide images are typically small decorative icons; meaningful images
 * should be uploaded separately via the cover image field.
 */

export interface ParsedPptx {
  title: string
  excerpt: string
  content: string
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
})

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) return []
  return Array.isArray(value) ? value : [value]
}

function collectByKey(node: unknown, key: string, out: unknown[]): void {
  if (node === null || typeof node !== 'object') return
  if (Array.isArray(node)) {
    for (const item of node) collectByKey(item, key, out)
    return
  }
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    if (k === key) out.push(v)
    collectByKey(v, key, out)
  }
}

function paragraphToText(paragraph: unknown): string {
  const texts: string[] = []
  collectByKey(paragraph, 'a:t', texts as unknown[])
  return texts
    .map((t) => (typeof t === 'string' ? t : typeof t === 'number' ? String(t) : ''))
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

function getParagraphs(shape: Record<string, unknown>): string[] {
  const txBody = shape['p:txBody'] as Record<string, unknown> | undefined
  if (!txBody) return []
  return asArray(txBody['a:p'])
    .map((p) => paragraphToText(p))
    .filter((text) => text.length > 0)
}

function isTitleShape(shape: Record<string, unknown>): boolean {
  const nvSpPr = shape['p:nvSpPr'] as Record<string, unknown> | undefined
  const nvPr = nvSpPr?.['p:nvPr'] as Record<string, unknown> | undefined
  const ph = nvPr?.['p:ph'] as Record<string, unknown> | undefined
  const type = ph?.['@_type']
  return type === 'title' || type === 'ctrTitle'
}

function relsToMap(zip: AdmZip, relsPath: string): Record<string, string> {
  const entry = zip.getEntry(relsPath)
  if (!entry) return {}
  const xml = entry.getData().toString('utf-8')
  const parsed = parser.parse(xml)
  const relationships = asArray(
    (parsed?.Relationships as Record<string, unknown>)?.Relationship
  ) as Record<string, unknown>[]
  const map: Record<string, string> = {}
  for (const rel of relationships) {
    const id = rel['@_Id'] as string
    const target = rel['@_Target'] as string
    if (id && target) map[id] = target
  }
  return map
}

function getSlidePathsInOrder(zip: AdmZip): string[] {
  const presEntry = zip.getEntry('ppt/presentation.xml')
  const relsMap = relsToMap(zip, 'ppt/_rels/presentation.xml.rels')

  if (presEntry && Object.keys(relsMap).length > 0) {
    const parsed = parser.parse(presEntry.getData().toString('utf-8'))
    const sldIdLst = (parsed?.['p:presentation'] as Record<string, unknown>)?.[
      'p:sldIdLst'
    ] as Record<string, unknown> | undefined
    const slideIds = asArray(sldIdLst?.['p:sldId']) as Record<string, unknown>[]

    const ordered = slideIds
      .map((s) => relsMap[s['@_r:id'] as string])
      .filter(Boolean)
      .map((target) => `ppt/${(target as string).replace(/^\//, '')}`)

    if (ordered.length > 0) return ordered
  }

  return zip
    .getEntries()
    .map((e) => e.entryName)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const na = Number(a.match(/slide(\d+)\.xml$/)?.[1] ?? 0)
      const nb = Number(b.match(/slide(\d+)\.xml$/)?.[1] ?? 0)
      return na - nb
    })
}

interface SlideResult {
  titleText: string
  bodyParagraphs: string[]
}

function parseSlide(zip: AdmZip, slidePath: string): SlideResult {
  const entry = zip.getEntry(slidePath)
  if (!entry) return { titleText: '', bodyParagraphs: [] }

  const parsed = parser.parse(entry.getData().toString('utf-8'))
  const spTree = (
    (
      (parsed?.['p:sld'] as Record<string, unknown>)?.['p:cSld'] as Record<
        string,
        unknown
      >
    )?.['p:spTree']
  ) as Record<string, unknown> | undefined

  let titleText = ''
  const bodyParagraphs: string[] = []

  if (spTree) {
    const shapes = asArray(spTree['p:sp']) as Record<string, unknown>[]
    for (const shape of shapes) {
      const paragraphs = getParagraphs(shape)
      if (paragraphs.length === 0) continue
      if (isTitleShape(shape) && !titleText) {
        titleText = paragraphs.join(' ')
      } else {
        bodyParagraphs.push(...paragraphs)
      }
    }
  }

  return { titleText, bodyParagraphs }
}

export function parsePptx(buffer: Buffer): ParsedPptx {
  const zip = new AdmZip(buffer)
  const slidePaths = getSlidePathsInOrder(zip)

  if (slidePaths.length === 0) {
    throw new Error('Nie znaleziono slajdów w pliku PowerPoint')
  }

  const slides = slidePaths.map((path) => parseSlide(zip, path))

  const titleSlide = slides[0] ?? { titleText: '', bodyParagraphs: [] }
  const bodySlides = slides.slice(1)

  const title = (
    titleSlide.titleText ||
    titleSlide.bodyParagraphs[0] ||
    'Prezentacja'
  ).trim()

  const excerpt = titleSlide.bodyParagraphs
    .filter((p) => !/^źród/i.test(p))
    .join(' ')
    .slice(0, 500)
    .trim()

  const sections: string[] = []

  for (const slide of bodySlides) {
    const parts: string[] = []
    if (slide.titleText) {
      parts.push(`## ${slide.titleText}`)
    }
    if (slide.bodyParagraphs.length > 0) {
      parts.push(slide.bodyParagraphs.map((p) => `- ${p}`).join('\n'))
    }
    if (parts.length > 0) {
      sections.push(parts.join('\n\n'))
    }
  }

  return {
    title,
    excerpt,
    content: sections.join('\n\n'),
  }
}
