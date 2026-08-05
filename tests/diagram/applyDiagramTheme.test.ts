import test from "node:test"
import assert from "node:assert/strict"
import { applyDiagramTheme } from "@/helpers/applyDiagramTheme"
import { countMermaidNodes } from "@/helpers/countMermaidNodes"
import { DIAGRAM_ROLES } from "@/constants/diagramRoles"

const FLOWCHART = `flowchart TD
    Start(["Pacjent"]) --> O1[Pomiar]
    O1 --> D1{Saturacja niska?}
    D1 -->|Tak| Pilne[Wezwij zespol]
    class Start start
    class D1 decyzja
    class O1 czynnosc
    class Pilne uwaga`

test("injects a classDef for every role", () => {
  const themed = applyDiagramTheme(FLOWCHART)

  for (const role of DIAGRAM_ROLES) {
    assert.match(themed, new RegExp(`classDef ${role} fill:#`))
  }
})

test("keeps the diagram type keyword on the first line", () => {
  assert.match(applyDiagramTheme(FLOWCHART).split("\n")[0] ?? "", /^flowchart TD$/)
})

test("drops model-authored colors", () => {
  const themed = applyDiagramTheme(`flowchart TD
    A[Wezel] --> B[Drugi]
    classDef mojaKlasa fill:#ff0000,stroke:#00ff00
    style A fill:#123456
    class A mojaKlasa`)

  assert.equal(themed.includes("#ff0000"), false)
  assert.equal(themed.includes("#123456"), false)
  assert.equal(themed.includes("classDef mojaKlasa"), false)
  assert.equal(themed.includes("class A mojaKlasa"), false)
})

test("styles subgraph containers without the model asking", () => {
  const themed = applyDiagramTheme(`flowchart TD
    subgraph Ocena["Ocena wstepna"]
      A[Pomiar] --> B[Osluchanie]
    end
    subgraph Lecz["Postepowanie"]
      C[Tlen]
    end`)

  assert.match(themed, /class Ocena grupa/)
  assert.match(themed, /class Lecz grupa/)
})

test("strips an inline role that names no class", () => {
  const themed = applyDiagramTheme(`flowchart TD
    A[Wezel]:::wymyslona --> B[Drugi]:::czynnosc`)

  assert.equal(themed.includes(":::wymyslona"), false)
  assert.match(themed, /:::czynnosc/)
})

test("leaves a sequence diagram untouched — Mermaid rejects classDef there", () => {
  const sequence = `sequenceDiagram
    participant H as Podwzgorze
    participant P as Przysadka
    H->>P: TRH`

  assert.equal(applyDiagramTheme(sequence), sequence)
})

test("does not count a bracket inside a label as another node", () => {
  assert.equal(
    countMermaidNodes(`flowchart TD
    A[Badanie fizykalne (osluchanie)] --> B[Pomiar cisnienia]
    B --> C[Wstawki (dyski wtracone)]`),
    3
  )

  assert.equal(countMermaidNodes(`flowchart TD
    Start(["Pacjent z dusznoscia"]) --> O1[Pomiar]`), 2)
})

test("counts declared nodes, not edges, containers or directives", () => {
  assert.equal(countMermaidNodes(FLOWCHART), 4)

  assert.equal(
    countMermaidNodes(`flowchart TD
    subgraph Ocena["Ocena wstepna"]
      A[Pomiar] --> B[Osluchanie]
    end
    A --> B
    class A czynnosc`),
    2
  )
})
