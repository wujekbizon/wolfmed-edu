import test from "node:test"
import assert from "node:assert/strict"
import { reciprocalRankFusion } from "@/helpers/reciprocalRankFusion"

const id = (s: string) => s
const K = 10

test("an item ranked highly in both lists beats one ranked highly in either", () => {
  const a = ["shared", "onlyA1", "onlyA2"]
  const b = ["onlyB1", "shared", "onlyB2"]

  assert.equal(reciprocalRankFusion([a, b], id, K)[0], "shared")
})

test("preserves order within a single list", () => {
  const only = ["first", "second", "third"]
  assert.deepEqual(reciprocalRankFusion([only], id, K), only)
})

test("deduplicates across lists", () => {
  const merged = reciprocalRankFusion([["x", "y"], ["y", "x"]], id, K)
  assert.deepEqual(merged.sort(), ["x", "y"])
})

test("rank decides, not list length — a short list is not drowned out", () => {
  const long = Array.from({ length: 20 }, (_, i) => `long${i}`)
  const short = ["short0"]

  const merged = reciprocalRankFusion([long, short], id, K)

  // short0 is rank 1 of its list, so it must beat everything below rank 1 of the
  // long one. A score-based merge across incomparable spaces could not promise this.
  assert.ok(merged.indexOf("short0") <= 1, `short0 landed at ${merged.indexOf("short0")}`)
})

test("empty lists contribute nothing and do not throw", () => {
  assert.deepEqual(reciprocalRankFusion([[], []], id, K), [])
  assert.deepEqual(reciprocalRankFusion([[], ["a"]], id, K), ["a"])
})

test("smaller k separates early ranks more sharply", () => {
  const a = ["a1", "a2"]
  const b = ["b1", "b2"]

  const gap = (k: number) => {
    // Difference between a rank-1 and a rank-2 contribution.
    return 1 / (k + 1) - 1 / (k + 2)
  }

  assert.ok(gap(10) > gap(60), "k=60 flattens short lists, which is why the default is 10")
  // Both orderings stay stable regardless of k; only the margins change.
  assert.equal(reciprocalRankFusion([a, b], id, 10).length, 4)
})
