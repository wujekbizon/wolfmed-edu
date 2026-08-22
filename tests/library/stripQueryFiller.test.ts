import test from "node:test"
import assert from "node:assert/strict"
import { stripQueryFiller } from "@/helpers/stripQueryFiller"

test("reduces a typed question to its subject", () => {
  assert.equal(stripQueryFiller("wyjaśnij pojęcie etnocentryzm"), "etnocentryzm")
  assert.equal(stripQueryFiller("Co to jest dyfuzja lateralna?"), "dyfuzja lateralna")
  assert.equal(stripQueryFiller("Czym są odleżyny"), "odleżyny")
})

test("keeps subject words that merely look like filler", () => {
  assert.equal(stripQueryFiller("płynność błony komórkowej"), "płynność błony komórkowej")
  assert.equal(
    stripQueryFiller("Cechy charakterystyczne błon komórkowych"),
    "Cechy charakterystyczne błon komórkowych"
  )
})

test("falls back to the original when everything is filler", () => {
  assert.equal(stripQueryFiller("co to jest?"), "co to jest?")
  assert.equal(stripQueryFiller("wyjaśnij proszę"), "wyjaśnij proszę")
})

test("handles missing diacritics and trailing punctuation", () => {
  assert.equal(stripQueryFiller("wyjasnij pojecie etnocentryzm"), "etnocentryzm")
  assert.equal(stripQueryFiller("Jakie są objawy odleżyn?"), "objawy odleżyn")
})
