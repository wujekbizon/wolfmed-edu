import test from "node:test"
import assert from "node:assert/strict"
import { quoteMermaidLabels } from "@/helpers/quoteMermaidLabels"

test("quotes a label containing parentheses", () => {
  assert.equal(
    quoteMermaidLabels(`    A[Wchlanianie wody (bez ramienia)] --> B[Dalej]`),
    `    A["Wchlanianie wody (bez ramienia)"] --> B[Dalej]`
  )
})

test("quotes a decision label too", () => {
  assert.equal(
    quoteMermaidLabels(`    A{Czy podano (dozylnie)?}`),
    `    A{"Czy podano (dozylnie)?"}`
  )
})

test("keeps a nested bracket inside the label", () => {
  assert.equal(
    quoteMermaidLabels(`    A[Stezenie [mmol/l] rosnie]`),
    `    A["Stezenie [mmol/l] rosnie"]`
  )
})

test("leaves labels that need nothing alone", () => {
  const plain = `    A[Pomiar saturacji] --> B[Osluchanie pluc]`

  assert.equal(quoteMermaidLabels(plain), plain)
})

test("does not double-quote what is already quoted", () => {
  const quoted = `    A["Juz zacytowane (ok)"] --> B[Zwykly]`

  assert.equal(quoteMermaidLabels(quoted), quoted)
})

test("leaves compound shapes alone — their brackets are the shape", () => {
  const stadium = `    Start(["Pacjent z dusznoscia"]) --> O1[Pomiar]`

  assert.equal(quoteMermaidLabels(stadium), stadium)
})

test("does not touch directives or edge labels", () => {
  const lines = `flowchart TD
    class A,B czynnosc
    classDef start fill:#fff,stroke:#000
    O3 -->|Tak| Pilne[Wezwij zespol]
    subgraph Ocena["Ocena wstepna"]`

  assert.equal(quoteMermaidLabels(lines), lines)
})

test("escapes a quote that was already in the text", () => {
  assert.match(quoteMermaidLabels(`    A[Objaw "cichy" (nieoczywisty)]`), /#quot;cichy#quot;/)
})
