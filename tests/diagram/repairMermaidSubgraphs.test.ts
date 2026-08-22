import test from "node:test"
import assert from "node:assert/strict"
import { repairMermaidSubgraphs } from "@/helpers/repairMermaidSubgraphs"

test("renames a subgraph whose id is declared as a node inside it", () => {
  const repaired = repairMermaidSubgraphs(`flowchart TD
    subgraph Uklad["Uklad bodzcoprzewodzacy"]
      Uklad[Uklad] --> W1[Wezel zatokowy]
    end`)

  assert.match(repaired, /subgraph Uklad_grupa\["Uklad bodzcoprzewodzacy"\]/)
  assert.match(repaired, /Uklad\[Uklad\] --> W1/)
})

test("renames when the id is only referenced by an edge inside it", () => {
  const repaired = repairMermaidSubgraphs(`flowchart TD
    subgraph Uklad["Uklad"]
      W1[Wezel] --> Uklad
    end`)

  assert.match(repaired, /subgraph Uklad_grupa\["Uklad"\]/)
})

test("leaves an arrow pointing at the group from outside alone", () => {
  const source = `flowchart TD
    Serce[Serce] --> Uklad
    subgraph Uklad["Uklad"]
      W1[Wezel] --> W2[Peczek]
    end`

  assert.equal(repairMermaidSubgraphs(source), source)
})

test("keeps the visible title when the subgraph had no bracketed one", () => {
  const repaired = repairMermaidSubgraphs(`flowchart TD
    subgraph Uklad
      Uklad[Uklad] --> W1[Wezel]
    end`)

  assert.match(repaired, /subgraph Uklad_grupa\["Uklad"\]/)
})

test("does not match an id that is a prefix of another", () => {
  const source = `flowchart TD
    subgraph Uklad["Uklad"]
      UkladKrazenia[Krazenie] --> W1[Wezel]
    end`

  assert.equal(repairMermaidSubgraphs(source), source)
})

test("ignores an id that only appears inside label text", () => {
  const source = `flowchart TD
    subgraph Uklad["Uklad"]
      W1[Uklad bodzcoprzewodzacy serca] --> W2[Wezel]
    end`

  assert.equal(repairMermaidSubgraphs(source), source)
})

test("repairs an ancestor referenced from a nested subgraph", () => {
  const repaired = repairMermaidSubgraphs(`flowchart TD
    subgraph Serce["Serce"]
      subgraph Prawe["Serce prawe"]
        W1[Przedsionek] --> Serce
      end
    end`)

  assert.match(repaired, /subgraph Serce_grupa\["Serce"\]/)
  assert.match(repaired, /subgraph Prawe\["Serce prawe"\]/)
})
