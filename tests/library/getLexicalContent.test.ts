import test from "node:test"
import assert from "node:assert/strict"
import { getLexicalContent } from "@/helpers/getLexicalContent"

const text = (value: string) => ({ type: "text", text: value })
const block = (type: string, ...children: unknown[]) => ({ type, children })
const doc = (...children: unknown[]) => JSON.stringify({ root: block("root", ...children) })

test("blocks are separated, not concatenated", () => {
  const json = doc(
    block("heading", text("Transport Krwi w Organizmie")),
    block("paragraph", text("Krew - płynna tkanka."))
  )

  const result = getLexicalContent(json)

  assert.ok(!result.includes("OrganizmieKrew"), "block boundary was lost")
  assert.equal(result, "Transport Krwi w Organizmie\n\nKrew - płynna tkanka.")
})

test("list items sit on their own lines", () => {
  const json = doc(
    block("paragraph", text("Funkcje:")),
    block(
      "list",
      block("listitem", text("Transport tlenu")),
      block("listitem", text("Regulacja temperatury"))
    )
  )

  assert.equal(
    getLexicalContent(json),
    "Funkcje:\n\nTransport tlenu\nRegulacja temperatury"
  )
})

test("linebreaks inside a paragraph are preserved", () => {
  const json = doc(
    block("paragraph", text("Pierwszy"), { type: "linebreak" }, text("Drugi"))
  )

  assert.equal(getLexicalContent(json), "Pierwszy\nDrugi")
})

test("nested inline nodes keep their text unseparated", () => {
  const json = doc(block("paragraph", block("link", text("Serce")), text(" pompuje krew.")))

  assert.equal(getLexicalContent(json), "Serce pompuje krew.")
})

test("empty blocks collapse instead of stacking blank lines", () => {
  const json = doc(
    block("paragraph", text("Pierwszy")),
    block("paragraph"),
    block("paragraph"),
    block("paragraph", text("Drugi"))
  )

  assert.equal(getLexicalContent(json), "Pierwszy\n\nDrugi")
})

test("malformed input yields an empty string rather than throwing", () => {
  assert.equal(getLexicalContent("not json"), "")
  assert.equal(getLexicalContent("{}"), "")
  assert.equal(getLexicalContent('{"root":null}'), "")
})

test("an empty string text node does not swallow its siblings", () => {
  // The old guard was `if (node.text)`, so a text node holding "" fell through
  // to the children branch and returned nothing.
  const json = doc(block("paragraph", text(""), text("Widoczny")))

  assert.equal(getLexicalContent(json), "Widoczny")
})
