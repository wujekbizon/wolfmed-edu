import test from "node:test"
import assert from "node:assert/strict"
import { extractSubgraphs } from "@/lib/diagram/extractSubgraphs"
import { buildGroupContainers } from "@/lib/diagram/buildGroupContainers"

const FLOWCHART = `flowchart TD
    Start(["Pacjent"]) --> Ocena
    subgraph Ocena["Ocena wstepna"]
      O1[Pomiar saturacji] --> O2[Osluchanie pluc]
      O2 --> O3{Saturacja niska?}
    end
    O3 -->|Tak| Pilne[Wezwij zespol]
    class O1,O2 czynnosc
    class Ocena grupa`

test("groups come out with their title and members", () => {
  const { groups } = extractSubgraphs(FLOWCHART)

  assert.equal(groups.length, 1)
  assert.equal(groups[0]?.title, "Ocena wstepna")
  assert.deepEqual(groups[0]?.nodeIds, ["O1", "O2", "O3"])
})

test("the source handed to Mermaid has no subgraph left in it", () => {
  const { source } = extractSubgraphs(FLOWCHART)

  assert.equal(/subgraph/.test(source), false)
  assert.equal(/^\s*end\s*$/m.test(source), false)
  assert.match(source, /O1\[Pomiar saturacji\]/)
})

test("an edge aimed at a group is repointed to its first member", () => {
  const { source } = extractSubgraphs(FLOWCHART)

  assert.match(source, /Start\(\["Pacjent"\]\) --> O1/)
  assert.equal(source.includes("--> Ocena"), false)
})

test("a role assigned to the group is dropped, not moved to a member", () => {
  const { source } = extractSubgraphs(FLOWCHART)

  assert.equal(source.includes("class Ocena grupa"), false)
  assert.equal(source.includes("class O1 grupa"), false)
  assert.match(source, /class O1,O2 czynnosc/)
})

test("label text is never mistaken for a node or rewritten", () => {
  const { groups, source } = extractSubgraphs(`flowchart TD
    subgraph Uklad["Uklad krazenia"]
      A[Serce i Uklad krazenia] --> B[Aorta]
    end`)

  assert.deepEqual(groups[0]?.nodeIds, ["A", "B"])
  assert.match(source, /A\[Serce i Uklad krazenia\]/)
})

test("nesting records ancestors innermost first", () => {
  const { groups } = extractSubgraphs(`flowchart TD
    subgraph Serce["Serce"]
      subgraph Prawe["Prawe"]
        PP[Przedsionek] --> PK[Komora]
      end
      Pluca[Pluca]
    end`)

  const inner = groups.find((group) => group.id === "Prawe")
  assert.deepEqual(inner?.ancestors, ["Serce"])
  assert.deepEqual(groups.find((group) => group.id === "Serce")?.nodeIds, ["Pluca"])
})

const box = (id: string, x: number, y: number) =>
  ({ type: "rectangle", id, x, y, width: 100, height: 50 }) as never

test("a parent container encloses its children's boxes", () => {
  const { groups } = extractSubgraphs(`flowchart TD
    subgraph Serce["Serce"]
      subgraph Prawe["Prawe"]
        PP[A] --> PK[B]
      end
      Pluca[C]
    end`)

  const { containers } = buildGroupContainers(
    [box("PP", 0, 0), box("PK", 0, 100), box("Pluca", 0, 200)],
    groups
  )

  const outer = containers.find((c) => c.id === "Serce") as never as { x: number; y: number; width: number; height: number }
  const inner = containers.find((c) => c.id === "Prawe") as never as { x: number; y: number; width: number; height: number }

  assert.ok(outer.x <= inner.x, "outer starts left of inner")
  assert.ok(outer.y <= inner.y, "outer starts above inner")
  assert.ok(outer.x + outer.width >= inner.x + inner.width, "outer ends right of inner")
  assert.ok(outer.y + outer.height >= inner.y + inner.height, "outer ends below inner")
})

test("members carry their groups innermost first, outermost painted first", () => {
  const { groups } = extractSubgraphs(`flowchart TD
    subgraph Serce["Serce"]
      subgraph Prawe["Prawe"]
        PP[A]
      end
    end`)

  const { containers, groupIdsById } = buildGroupContainers([box("PP", 0, 0)], groups)

  assert.deepEqual(groupIdsById.get("PP"), ["Prawe", "Serce"])
  assert.equal(containers[0]?.id, "Serce")
})

test("a group whose members never rendered produces no container", () => {
  const { groups } = extractSubgraphs(`flowchart TD
    subgraph Pusta["Pusta"]
      X[Nieobecny]
    end`)

  assert.deepEqual(buildGroupContainers([], groups).containers, [])
})
