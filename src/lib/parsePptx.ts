import 'server-only'
import AdmZip from 'adm-zip'
import { XMLParser } from 'fast-xml-parser'

/**
 * Parses a PowerPoint (.pptx) file into Markdown suitable for a blog post.
 *
 * A .pptx is a ZIP archive of XML parts. We read slide order from
 * presentation.xml and reconstruct structure from each run's formatting,
 * since these decks place all text in plain shapes rather than title/body
 * placeholders:
 *   - the largest bold line on a slide  → ## slide heading
 *   - other bold lines                  → ### sub-headers
 *   - a single line under a sub-header   → paragraph
 *   - multiple lines under a sub-header  → bullet list
 *   - bare step numbers (e.g. "01")      → dropped as decoration
 *
 * Embedded images are intentionally skipped — PPTX slide images are typically
 * small decorative icons; meaningful images should be added via the cover
 * image field.
 */

export interface ParsedPptx {
  title: string
  excerpt: string
  content: string
}

const TITLE_MIN_SIZE = 1600

// Emojis kept because they drive callout-card colours in the renderer.
const MARKER_EMOJIS = new Set(['⚠', '✔', '✖', '🛠'])

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
})

interface Paragraph {
  text: string
  bold: boolean
  size: number
}

interface SlideResult {
  paragraphs: Paragraph[]
}

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

function stripEmojis(text: string): string {
  return text
    .replace(/\p{Extended_Pictographic}️?/gu, (match) => {
      const base = [...match][0]!
      return MARKER_EMOJIS.has(base) ? base : ''
    })
    .replace(/[️‍]/g, '') // orphaned variation selectors / ZWJ
    .replace(/\s+/g, ' ')
    .trim()
}

function paragraphText(paragraph: unknown): string {
  const texts: string[] = []
  collectByKey(paragraph, 'a:t', texts as unknown[])
  return stripEmojis(
    texts
      .map((t) => (typeof t === 'string' ? t : typeof t === 'number' ? String(t) : ''))
      .join('')
  )
}

function isBareNumber(text: string): boolean {
  return /^\d{1,2}$/.test(text)
}

function toParagraph(paragraphNode: unknown): Paragraph {
  const text = paragraphText(paragraphNode)
  const pNode = paragraphNode as Record<string, unknown>
  const runs = asArray(pNode['a:r']) as Record<string, unknown>[]

  const textRuns = runs.filter((r) => {
    const t = r['a:t']
    return typeof t === 'string' ? t.trim().length > 0 : t != null
  })

  // A line counts as bold only when every text run is explicitly b="1".
  // Body text omits the attribute entirely, so absent means not bold.
  let bold = textRuns.length > 0
  let size = 0
  for (const run of textRuns) {
    const rPr = run['a:rPr'] as Record<string, unknown> | undefined
    const b = rPr?.['@_b']
    if (b !== '1' && b !== 1) bold = false
    const sz = Number(rPr?.['@_sz'])
    if (!Number.isNaN(sz) && sz > 0) size = Math.max(size, sz)
  }

  return { text, bold, size }
}

function getShapeParagraphs(shape: Record<string, unknown>): Paragraph[] {
  const txBody = shape['p:txBody'] as Record<string, unknown> | undefined
  if (!txBody) return []
  return asArray(txBody['a:p'])
    .map((p) => toParagraph(p))
    .filter((p) => p.text.length > 0)
}

function relsToMap(zip: AdmZip, relsPath: string): Record<string, string> {
  const entry = zip.getEntry(relsPath)
  if (!entry) return {}
  const parsed = parser.parse(entry.getData().toString('utf-8'))
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

function parseSlide(zip: AdmZip, slidePath: string): SlideResult {
  const entry = zip.getEntry(slidePath)
  if (!entry) return { paragraphs: [] }

  const parsed = parser.parse(entry.getData().toString('utf-8'))
  const spTree = (
    (
      (parsed?.['p:sld'] as Record<string, unknown>)?.['p:cSld'] as Record<
        string,
        unknown
      >
    )?.['p:spTree']
  ) as Record<string, unknown> | undefined

  if (!spTree) return { paragraphs: [] }

  const paragraphs: Paragraph[] = []
  for (const shape of asArray(spTree['p:sp']) as Record<string, unknown>[]) {
    paragraphs.push(...getShapeParagraphs(shape))
  }
  return { paragraphs }
}

/**
 * The slide heading is formed by the large bold lines (size >= TITLE_MIN_SIZE).
 * A title can span multiple lines at different sizes (e.g. "CHOROBY" at 44pt and
 * "NEURODEGENERACYJNE" at 36pt), so we group by the size threshold rather than an
 * exact max. Sub-headers (11–13pt) and body text stay below the threshold.
 */
function splitHeading(paragraphs: Paragraph[]): {
  heading: string
  rest: Paragraph[]
} {
  const headingLines: string[] = []
  const rest: Paragraph[] = []
  for (const p of paragraphs) {
    if (p.bold && p.size >= TITLE_MIN_SIZE && !isBareNumber(p.text)) {
      headingLines.push(p.text)
    } else {
      rest.push(p)
    }
  }
  return { heading: headingLines.join(' '), rest }
}

function renderBody(paragraphs: Paragraph[]): string {
  interface Group {
    header?: string
    items: string[]
  }
  const groups: Group[] = []
  let current: Group | null = null

  for (const p of paragraphs) {
    if (isBareNumber(p.text)) continue
    if (p.bold) {
      current = { header: p.text, items: [] }
      groups.push(current)
    } else {
      if (!current) {
        current = { items: [] }
        groups.push(current)
      }
      current.items.push(p.text)
    }
  }

  const parts: string[] = []
  for (const group of groups) {
    if (group.header) parts.push(`### ${group.header}`)
    if (group.items.length === 1) {
      parts.push(group.items[0]!)
    } else if (group.items.length > 1) {
      parts.push(group.items.map((i) => `- ${i}`).join('\n'))
    }
  }
  return parts.join('\n\n')
}

export function parsePptx(buffer: Buffer): ParsedPptx {
  const zip = new AdmZip(buffer)
  const slidePaths = getSlidePathsInOrder(zip)

  if (slidePaths.length === 0) {
    throw new Error('Nie znaleziono slajdów w pliku PowerPoint')
  }

  const slides = slidePaths.map((path) => parseSlide(zip, path))

  // Title slide drives the post title and excerpt; it is not repeated in body.
  const titleSlide = slides[0] ?? { paragraphs: [] }
  const { heading: titleHeading, rest: titleRest } = splitHeading(
    titleSlide.paragraphs
  )

  const title = (titleHeading || titleSlide.paragraphs[0]?.text || 'Prezentacja').trim()

  const excerpt = titleRest
    .filter((p) => !isBareNumber(p.text) && !/^źród/i.test(p.text))
    .map((p) => p.text)
    .join(' ')
    .slice(0, 500)
    .trim()

  const sections: string[] = []
  for (const slide of slides.slice(1)) {
    const { heading, rest } = splitHeading(slide.paragraphs)
    const parts: string[] = []
    if (heading) parts.push(`## ${heading}`)
    const body = renderBody(rest)
    if (body) parts.push(body)
    if (parts.length > 0) sections.push(parts.join('\n\n'))
  }

  return {
    title,
    excerpt,
    content: sections.join('\n\n'),
  }
}
