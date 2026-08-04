import test from "node:test"
import assert from "node:assert/strict"
import { isCorpusMiss } from "@/helpers/isCorpusMiss"
import type { ContextChunk } from "@/types/retrievalTypes"

const corpus = (...scores: Array<number | undefined>): ContextChunk[] =>
  scores.map((score) => ({ text: "x", origin: "corpus" as const, label: "doc.md", score }))

/** Distances logged for a question the curriculum covers. */
test("a real hit is not a miss", () => {
  assert.equal(isCorpusMiss(corpus(0.193, 0.201, 0.252, 0.3, 0.301)), false)
})

/** Distances logged for a sociology term absent from the curriculum. */
test("twelve chunks in a narrow high band is a miss", () => {
  assert.equal(isCorpusMiss(corpus(0.382, 0.39, 0.396, 0.402, 0.406)), true)
})

test("judged on the best chunk, not the worst", () => {
  assert.equal(isCorpusMiss(corpus(0.2, 0.45, 0.48)), false)
})

test("empty is a miss", () => {
  assert.equal(isCorpusMiss([]), true)
})

test("unscored chunks fail open", () => {
  assert.equal(isCorpusMiss(corpus(undefined, undefined)), false)
})
