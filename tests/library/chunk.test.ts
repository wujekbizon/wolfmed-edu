import test from "node:test"
import assert from "node:assert/strict"
import { chunkText } from "@/server/library/chunk"
import {
  CHUNK_SIZE,
  MAX_CHUNKS_PER_SOURCE,
  MIN_CHUNK_CHARS,
} from "@/server/library/config"

/** Polish medical prose, so boundary handling is exercised on real diacritics. */
function paragraphs(count: number): string {
  const body =
    "Układ krążenia składa się z serca oraz naczyń krwionośnych. " +
    "Serce pełni funkcję pompy tłoczącej krew do tętnic. " +
    "Krew powraca do serca żyłami, zamykając obieg. "
  return Array.from({ length: count }, (_, i) => `Akapit ${i}. ${body}`).join("\n\n")
}

test("short text stays a single chunk", () => {
  const chunks = chunkText("Krótka notatka o sercu.")
  assert.equal(chunks.length, 1)
  assert.equal(chunks[0]!.content, "Krótka notatka o sercu.")
  assert.equal(chunks[0]!.position, 0)
})

test("empty and whitespace-only text yields nothing to index", () => {
  assert.deepEqual(chunkText(""), [])
  assert.deepEqual(chunkText("   \n\n  \t "), [])
})

test("long text splits into ordered chunks within the size limit", () => {
  const chunks = chunkText(paragraphs(40))

  assert.ok(chunks.length > 1, "expected multiple chunks")
  chunks.forEach((chunk, index) => {
    assert.equal(chunk.position, index, "positions must be dense and ordered")
    assert.ok(
      chunk.content.length <= CHUNK_SIZE,
      `chunk ${index} is ${chunk.content.length} chars, over CHUNK_SIZE`
    )
    assert.ok(chunk.content.trim().length > 0, "no empty chunks")
  })
})

test("chunking is deterministic — hashes depend on it", () => {
  const text = paragraphs(30)
  assert.deepEqual(chunkText(text), chunkText(text))
})

test("every part of the source survives somewhere", () => {
  const text = paragraphs(25)
  const joined = chunkText(text)
    .map((chunk) => chunk.content)
    .join(" ")

  // Sample markers spread through the input rather than reassembling it, since
  // overlap means the chunks do not concatenate back to the original.
  for (const marker of ["Akapit 0.", "Akapit 12.", "Akapit 24."]) {
    assert.ok(joined.includes(marker), `${marker} was dropped`)
  }
})

test("a short tail rides along instead of becoming a fragment", () => {
  const chunks = chunkText(`${paragraphs(12)}\n\nKoniec.`)
  const last = chunks[chunks.length - 1]!

  assert.ok(
    last.content.length >= MIN_CHUNK_CHARS,
    "trailing fragment should have merged into the previous chunk"
  )
  assert.ok(last.content.includes("Koniec."), "the tail text must survive")
})

test("no chunk opens mid-word", () => {
  const text = paragraphs(40)

  for (const chunk of chunkText(text)) {
    const firstWord = chunk.content.split(/\s+/)[0]!
    const escaped = firstWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

    assert.match(
      text,
      new RegExp(`(^|\\s)${escaped}`),
      `chunk starts mid-word: "${chunk.content.slice(0, 40)}…"`
    )
  }
})

test("chunks overlap so a boundary sentence survives on one side", () => {
  const chunks = chunkText(paragraphs(40))
  assert.ok(chunks.length > 1)

  // Consecutive chunks share text: the tail of one appears in the next.
  const first = chunks[0]!.content
  const second = chunks[1]!.content
  const tail = first.slice(-40)

  assert.ok(second.includes(tail), "expected the overlap to carry the tail forward")
})

test("a pathological source cannot exceed the per-source cap", () => {
  const chunks = chunkText(paragraphs(4000))
  assert.ok(chunks.length <= MAX_CHUNKS_PER_SOURCE)
})

test("text without punctuation or breaks still terminates", () => {
  const chunks = chunkText("a".repeat(CHUNK_SIZE * 4))
  assert.ok(chunks.length > 1)
  assert.ok(chunks.every((chunk) => chunk.content.length <= CHUNK_SIZE))
})
