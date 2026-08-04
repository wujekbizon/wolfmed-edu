import { readFileSync } from 'node:fs'
import postgres from 'postgres'
import { chunkText } from '../src/server/library/chunk'

const CHUNK_2 = `znacznie łatwiej niż integralne
mogą być od błony odłączone - wystarczy do tego zastosowanie
roztworu o odpowiedniej wartości pH lub sile jonowej.

Cechy charakterystyczne błon
komórkowych
• płynność - polegającą na tym, że wszystkie
praktycznie składniki błon poruszają się. Cząsteczki
lipidów mogą obracać się wokół osi prostopadłej do
powierzchni błony (tzw. dyfuzja rotacyjna) jak i
przemieszczać się w jej płaszczyźnie (dyfuzja
lateralna). Oprócz ruchu cząsteczek lipidów jako
całości duże znaczenie posiadają także ruchy ich
łańcuchów węglowodorowych. Ich ruchliwość zależy
od wielu czynników - przede wszystkim od
temperatury oraz ilości wiązań nienasyconych.
• Im bardziej ruchliwe są łańcuchy węglowodorowe tym
większą zajmują efektywną objętość i tym samym
luźniej upakowane są cząsteczki lipidów w
dwuwarstwie. Ma to duże znaczenie zarówno dla
własności błony jako przegrody jak i dla działania
wielu białek błonowych.`

const CHUNK_3 = `są cząsteczki lipidów w
dwuwarstwie. Ma to duże znaczenie zarówno dla
własności błony jako przegrody jak i dla działania
wielu białek błonowych.

• Czynnikiem regulującym płynność błon jest obecność w nich
cząsteczek steroli - w błonach komórek eukariotycznych przede
wszystkim cholesterolu. Cząsteczki lipidów mogą też przechodzić z
warstwy cytoplazmatycznej do zewnętrznej (lub odwrotnie). Zajwisko
takie nazywane jest "flip-flop" - w błonach komórkowych występuje
ono z małym prawdopodobieństwem.
Białka integralne mogą ulegać dyfuzji rotacyjnej i lateralnej. Ze
względu na rozmiary ich cząsteczek oba typy dyfuzji są dla białek
wolniejsze niż dla lipidów. W odniesieniu do białek nie spotyka się
natomiast procesu analogicznego do "flip-flop" - białka nie zmieniają
swej orientacji względem powierzchni błony.`

// Realistic negatives: the same student's other library rows would be other
// medical prose. procedures.json and diagnozy.json are the only real Polish
// medical corpora in the repo, chunked by the production chunker so the length
// distribution matches what retrieval actually scores against.
function buildNegatives(): string[] {
  const out: string[] = []

  const procedures = JSON.parse(readFileSync('data/procedures.json', 'utf8')) as Array<{
    data: { name?: string; algorithm?: Array<{ step: string }> }
  }>
  for (const p of procedures) {
    const steps = p.data?.algorithm
    if (!steps) continue
    const text = `${p.data.name ?? ''}\n${steps.map((a) => a.step).join('\n')}`
    out.push(...chunkText(text).map((c) => c.content))
  }

  const diagnozy = JSON.parse(readFileSync('data/diagnozy.json', 'utf8')) as unknown
  const collectStrings = (node: unknown, acc: string[]): void => {
    if (typeof node === 'string') {
      if (node.length > 40) acc.push(node)
    } else if (Array.isArray(node)) {
      for (const n of node) collectStrings(n, acc)
    } else if (node && typeof node === 'object') {
      for (const n of Object.values(node)) collectStrings(n, acc)
    }
  }
  const strings: string[] = []
  collectStrings(diagnozy, strings)
  for (let i = 0; i < strings.length; i += 8) {
    out.push(...chunkText(strings.slice(i, i + 8).join('\n\n')).map((c) => c.content))
  }

  return out
}

const QUERIES: Array<{ q: string; relevant: boolean }> = [
  { q: 'Cechy charakterystyczne błon komórkowych to ?', relevant: true },
  { q: 'Cechy charakterystyczne błon komórkowych', relevant: true },
  { q: 'Co to jest dyfuzja lateralna?', relevant: true },
  { q: 'płynność błony komórkowej', relevant: true },
  { q: 'Czym jest zjawisko flip-flop w błonach?', relevant: true },
  { q: 'Wyjaśnij mi proszę jakie są cechy charakterystyczne błon komórkowych', relevant: true },
  { q: 'Od czego zależy ruchliwość łańcuchów węglowodorowych w błonie komórkowej?', relevant: true },
  { q: 'Czy możesz wytłumaczyć na czym polega płynność błon i jakie ruchy wykonują cząsteczki lipidów w dwuwarstwie lipidowej?', relevant: true },
  { q: 'jak poruszają się składniki błony', relevant: true },
  { q: 'Jak wykonać zmianę worka stomijnego na kolostomii?', relevant: false },
  { q: 'Jakie są objawy odleżyn u pacjenta leżącego?', relevant: false },
  { q: 'Na czym polega pomiar ciśnienia tętniczego krwi?', relevant: false },
]

const FNS = ['similarity', 'word_similarity', 'strict_word_similarity'] as const

const pct = (values: number[], p: number) => {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p))] ?? 0
}

async function main() {
  const sql = postgres({ host: '/var/tmp/pgtrgm', port: 5433, database: 'postgres', user: 'pgtest' })

  const negatives = buildNegatives()
  await sql`DROP TABLE IF EXISTS m`
  await sql`CREATE TABLE m (id serial primary key, tag text, content text)`

  const rows = [
    { tag: 'POS-chunk2', content: CHUNK_2 },
    { tag: 'POS-chunk3', content: CHUNK_3 },
    ...negatives.map((content) => ({ tag: 'NEG', content })),
  ]
  for (let i = 0; i < rows.length; i += 500) {
    await sql`INSERT INTO m ${sql(rows.slice(i, i + 500), 'tag', 'content')}`
  }

  const counts = await sql<{ n: number; avg_len: number }[]>`
    SELECT count(*)::int n, avg(length(content))::int avg_len FROM m WHERE tag = 'NEG'`
  console.log(`negatives: ${counts[0]!.n} rows, mean length ${counts[0]!.avg_len} chars`)
  console.log(`positives: chunk2 ${CHUNK_2.length} chars, chunk3 ${CHUNK_3.length} chars\n`)

  for (const fn of FNS) {
    console.log(`\n${'='.repeat(78)}\n${fn}\n${'='.repeat(78)}`)
    console.log(
      'query'.padEnd(46) + 'chunk2'.padStart(8) + 'chunk3'.padStart(8) + 'negP99'.padStart(8) + 'negMax'.padStart(8) + 'rank2'.padStart(8)
    )

    for (const { q, relevant } of QUERIES) {
      const scored = await sql<{ tag: string; s: number }[]>`
        SELECT tag, ${sql.unsafe(fn)}(${q}, content) s FROM m`
      const c2 = Number(scored.find((r) => r.tag === 'POS-chunk2')!.s)
      const c3 = Number(scored.find((r) => r.tag === 'POS-chunk3')!.s)
      const neg = scored.filter((r) => r.tag === 'NEG').map((r) => Number(r.s))
      const rank2 = neg.filter((n) => n > c2).length + 1

      const mark = relevant ? ' ' : '~'
      console.log(
        (mark + q).slice(0, 45).padEnd(46) +
          c2.toFixed(3).padStart(8) +
          c3.toFixed(3).padStart(8) +
          pct(neg, 0.99).toFixed(3).padStart(8) +
          Math.max(...neg).toFixed(3).padStart(8) +
          String(rank2).padStart(8)
      )
    }
  }

  await sql.end()
}

void main()
