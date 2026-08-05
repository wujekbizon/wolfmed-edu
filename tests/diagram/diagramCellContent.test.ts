import test from "node:test"
import assert from "node:assert/strict"
import { parseDiagramCellContent } from "@/helpers/parseDiagramCellContent"
import { serializeDiagramCell } from "@/helpers/serializeDiagramCell"

const SOURCE = `flowchart TD
    A[Pomiar] --> B[Osluchanie]
    class A,B czynnosc`

const SCENE = {
  elements: [{ id: "x", type: "rectangle" }],
  appState: { viewBackgroundColor: "#ffffff", scrollX: 120, selectedElementIds: { x: true } },
}

test("raw Mermaid is recognised as an unconverted source", () => {
  const parsed = parseDiagramCellContent(SOURCE)

  assert.equal(parsed.kind, "source")
  assert.equal(parsed.kind === "source" && parsed.source, SOURCE)
})

test("the source survives a serialize/parse round trip", () => {
  const parsed = parseDiagramCellContent(serializeDiagramCell(SOURCE, SCENE))

  assert.equal(parsed.kind, "diagram")
  assert.equal(parsed.kind === "diagram" && parsed.source, SOURCE)
  assert.deepEqual(parsed.kind === "diagram" && parsed.scene.elements, SCENE.elements)
})

test("a cell saved before the source was kept still opens", () => {
  const parsed = parseDiagramCellContent(JSON.stringify(SCENE))

  assert.equal(parsed.kind, "scene")
  assert.deepEqual(parsed.kind === "scene" && parsed.scene.elements, SCENE.elements)
})

test("viewport and selection are not persisted", () => {
  const written = JSON.parse(serializeDiagramCell(SOURCE, SCENE))

  assert.equal(written.scene.appState.viewBackgroundColor, "#ffffff")
  assert.equal("scrollX" in written.scene.appState, false)
  assert.equal("selectedElementIds" in written.scene.appState, false)
})

test("panning twice serialises identically, so nothing is rewritten", () => {
  const panned = { ...SCENE, appState: { ...SCENE.appState, scrollX: 999, cursorButton: "up" } }

  assert.equal(serializeDiagramCell(SOURCE, SCENE), serializeDiagramCell(SOURCE, panned))
})

test("empty, blank and unparseable content all read as empty", () => {
  assert.equal(parseDiagramCellContent(undefined).kind, "empty")
  assert.equal(parseDiagramCellContent("   ").kind, "empty")
  assert.equal(parseDiagramCellContent("{not json").kind, "empty")
})
