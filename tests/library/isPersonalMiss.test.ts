import test from "node:test"
import assert from "node:assert/strict"
import { isPersonalMiss } from "@/helpers/isPersonalMiss"
import type { ContextChunk } from "@/types/retrievalTypes"

const personal = (...scores: Array<number | undefined>): ContextChunk[] =>
  scores.map((score) => ({ text: "x", origin: "material" as const, label: "doc.pdf", score }))

/** A sociology PDF scored against a blood-pressure question. */
test("a flat low band is a miss", () => {
  assert.equal(isPersonalMiss(personal(0.558, 0.527, 0.509, 0.488, 0.485)), true)
})

/** The etnocentryzm, cholesterol and membrane runs. */
test("real hits survive", () => {
  assert.equal(isPersonalMiss(personal(0.635, 0.625, 0.543)), false)
  assert.equal(isPersonalMiss(personal(0.674, 0.66)), false)
  assert.equal(isPersonalMiss(personal(0.93)), false)
})

test("judged on the best chunk, so a relevant document keeps its tail", () => {
  assert.equal(isPersonalMiss(personal(0.93, 0.41, 0.4)), false)
})

test("empty is a miss", () => {
  assert.equal(isPersonalMiss([]), true)
})

test("unscored chunks fail open", () => {
  assert.equal(isPersonalMiss(personal(undefined, undefined)), false)
})
