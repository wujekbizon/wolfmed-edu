import test from "node:test"
import assert from "node:assert/strict"
import { separateGroups } from "@/lib/diagram/separateGroups"
import { computeGroupBoxes, overlapOf } from "@/lib/diagram/groupBoxes"
import type { DiagramGroup } from "@/types/diagramTypes"

const node = (id: string, x: number, y: number) =>
  ({ type: "rectangle", id, x, y, width: 120, height: 60 }) as never

const arrow = (from: string, to: string, x: number, y: number, points: number[][]) =>
  ({ type: "arrow", x, y, points, start: { id: from }, end: { id: to } }) as never

const group = (id: string, nodeIds: string[], ancestors: string[] = []): DiagramGroup => ({
  id,
  title: id,
  nodeIds,
  ancestors,
})

const boxesOf = (skeleton: never[], groups: DiagramGroup[]) => computeGroupBoxes(skeleton, groups)

test("overlapping sibling groups are pushed apart", () => {
  const groups = [group("A", ["a1"]), group("B", ["b1"])]
  const skeleton = [node("a1", 0, 0), node("b1", 100, 0)] as never[]

  assert.ok(overlapOf(boxesOf(skeleton, groups).get("A")!, boxesOf(skeleton, groups).get("B")!).x > 0)

  const separated = separateGroups(skeleton, groups) as never[]
  const after = boxesOf(separated, groups)
  const overlap = overlapOf(after.get("A")!, after.get("B")!)

  assert.ok(overlap.x <= 0 || overlap.y <= 0, "boxes no longer intersect")
})

test("a nested group is left inside its parent", () => {
  const groups = [group("Outer", ["o1"]), group("Inner", ["i1"], ["Outer"])]
  const skeleton = [node("o1", 0, 0), node("i1", 0, 100)] as never[]

  assert.deepEqual(separateGroups(skeleton, groups), skeleton)
})

test("a diagram with one group is untouched", () => {
  const skeleton = [node("a1", 0, 0), node("b1", 10, 0)] as never[]

  assert.deepEqual(separateGroups(skeleton, [group("A", ["a1"])]), skeleton)
})

test("an arrow inside a moved group keeps its shape", () => {
  const groups = [group("A", ["a1", "a2"]), group("B", ["b1"])]
  const skeleton = [
    node("a1", 0, 0),
    node("a2", 0, 100),
    node("b1", 40, 0),
    arrow("a1", "a2", 60, 60, [[0, 0], [0, 40]]),
  ] as never[]

  const moved = separateGroups(skeleton, groups) as never[]
  const inner = moved.find((el: never) => (el as { type: string }).type === "arrow") as unknown as {
    points: number[][]
  }

  assert.deepEqual(inner.points, [[0, 0], [0, 40]])
})

test("an arrow spanning the new gap is redrawn between the centres", () => {
  const groups = [group("A", ["a1"]), group("B", ["b1"])]
  const skeleton = [
    node("a1", 0, 0),
    node("b1", 60, 0),
    arrow("a1", "b1", 120, 30, [[0, 0], [-60, 0]]),
  ] as never[]

  const moved = separateGroups(skeleton, groups) as never[]
  const byId = new Map(
    moved
      .filter((el: never) => (el as { type: string }).type === "rectangle")
      .map((el: never) => [(el as { id: string }).id, el as unknown as { x: number; y: number }])
  )
  const redrawn = moved.find((el: never) => (el as { type: string }).type === "arrow") as unknown as {
    x: number
    y: number
    points: number[][]
  }

  const from = byId.get("a1")!
  const to = byId.get("b1")!
  assert.equal(redrawn.x, from.x + 60)
  assert.deepEqual(redrawn.points[1], [to.x - from.x, to.y - from.y])
})
