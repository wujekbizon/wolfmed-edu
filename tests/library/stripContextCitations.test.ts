import test from "node:test"
import assert from "node:assert/strict"
import { stripContextCitations } from "@/helpers/stripContextCitations"

test("removes the citation shapes Gemini actually emits", () => {
  assert.equal(
    stripContextCitations("Płynność błony komórkowej. [10, TWÓJ MATERIAŁ]"),
    "Płynność błony komórkowej."
  )
  assert.equal(stripContextCitations("Selektywna przepuszczalność. [2, BAZA WIEDZY]"), "Selektywna przepuszczalność.")
  assert.equal(stripContextCitations("Szkielet błonowy. [1, 3, BAZA WIEDZY]"), "Szkielet błonowy.")
  assert.equal(stripContextCitations("Notatka ucznia. [TWOJA NOTATKA]"), "Notatka ucznia.")
  assert.equal(stripContextCitations("Fragment pierwszy [1] i drugi [2]."), "Fragment pierwszy i drugi.")
})

test("catches the parenthesised form the square-bracket ban pushed it into", () => {
  assert.equal(
    stripContextCitations("Pomiar na tętnicy ramiennej (BAZA WIEDZY)."),
    "Pomiar na tętnicy ramiennej."
  )
  assert.equal(stripContextCitations("Ramię na poziomie serca (2, BAZA WIEDZY)"), "Ramię na poziomie serca")
  assert.equal(stripContextCitations("Notatka ucznia (TWOJA NOTATKA)."), "Notatka ucznia.")
})

test("catches an origin label however the citation is dressed", () => {
  assert.equal(
    stripContextCitations("Wymaga energii. (BAZA WIEDZY — 01_fizjologia_komorki.md)"),
    "Wymaga energii."
  )
  assert.equal(
    stripContextCitations("Zużywa ATP. (TWOJA NOTATKA — transport przez błonę)"),
    "Zużywa ATP."
  )
  assert.equal(
    stripContextCitations("Płynność błony [TWÓJ MATERIAŁ: wyklad.pdf] jest kluczowa."),
    "Płynność błony jest kluczowa."
  )
})

test("leaves parenthesised content alone unless it names an origin", () => {
  const enumeration = "Kroki: (1) przygotuj zestaw, (2) umyj ręce."
  assert.equal(stripContextCitations(enumeration), enumeration)

  const aside = "receptorów błonowych (np. transporterów glukozy GLUT)."
  assert.equal(stripContextCitations(aside), aside)
})

test("leaves bracketed content that is not a citation", () => {
  const chemistry = "Stężenie [Na+] rośnie, a [K+] maleje."
  assert.equal(stripContextCitations(chemistry), chemistry)

  const figure = "Zobacz [Ryc. 2] w podręczniku."
  assert.equal(stripContextCitations(figure), figure)

  const link = "Więcej w [dokumentacji](https://example.com)."
  assert.equal(stripContextCitations(link), link)
})

test("does not leave a space before punctuation or double spaces", () => {
  assert.equal(stripContextCitations("Błona jest płynna [4, BAZA WIEDZY], a białka się przemieszczają."), "Błona jest płynna, a białka się przemieszczają.")
  assert.equal(stripContextCitations("Pierwsze [1] drugie."), "Pierwsze drugie.")
})

test("preserves markdown structure", () => {
  const bullets = "*   **Płynność** - opis. [10, TWÓJ MATERIAŁ]\n*   **Cholesterol** - opis. [1, 2, BAZA WIEDZY]"
  assert.equal(
    stripContextCitations(bullets),
    "*   **Płynność** - opis.\n*   **Cholesterol** - opis."
  )
})
