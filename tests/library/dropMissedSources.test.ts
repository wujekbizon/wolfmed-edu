import test from "node:test"
import assert from "node:assert/strict"
import { dropMissedSources } from "@/helpers/dropMissedSources"
import type { LibraryHit } from "@/server/library/retrieve"

const hit = (sourceId: string, score: number): LibraryHit => ({
  chunkId: `${sourceId}-${score}`,
  content: "x",
  title: sourceId,
  sourceType: "material",
  sourceId,
  score,
})

/** The cholesterol run: a relevant note alongside an unrelated sociology PDF. */
test("one relevant source does not admit an irrelevant one", () => {
  const kept = dropMissedSources([
    hit("note-cholesterol", 0.674),
    hit("pdf-socjologia", 0.528),
    hit("pdf-socjologia", 0.527),
    hit("pdf-socjologia", 0.499),
  ])

  assert.deepEqual(
    kept.map((h) => h.sourceId),
    ["note-cholesterol"]
  )
})

test("a relevant document keeps its weaker chunks", () => {
  const kept = dropMissedSources([hit("pdf-blony", 0.93), hit("pdf-blony", 0.41), hit("pdf-blony", 0.4)])

  assert.equal(kept.length, 3)
})

test("everything below the gate leaves nothing", () => {
  assert.deepEqual(dropMissedSources([hit("pdf-socjologia", 0.558), hit("pdf-socjologia", 0.485)]), [])
})

test("empty stays empty", () => {
  assert.deepEqual(dropMissedSources([]), [])
})
