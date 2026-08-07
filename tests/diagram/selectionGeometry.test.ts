import test from "node:test"
import assert from "node:assert/strict"
import { getCommonGroupId, getSelectionAnchor, isSameSelection } from "@/lib/diagram/selectionGeometry"
import type { DiagramSelection } from "@/types/diagramTypes"

const box = (id: string, x: number, y: number, groupIds: string[] = []) =>
  ({ id, x, y, width: 100, height: 50, groupIds }) as never

test("the common group is the innermost one covering every selected element", () => {
  const selected = [
    box("a", 0, 0, ["inner", "outer"]),
    box("b", 0, 100, ["inner", "outer"]),
  ]

  assert.equal(getCommonGroupId(selected), "inner")
})

test("a group shared by only part of the selection is not common", () => {
  const selected = [box("a", 0, 0, ["inner", "outer"]), box("b", 0, 100, ["outer"])]

  assert.equal(getCommonGroupId(selected), "outer")
})

test("elements with no group have none", () => {
  assert.equal(getCommonGroupId([box("a", 0, 0)]), null)
  assert.equal(getCommonGroupId([]), null)
})

test("the anchor is the top-centre of the bounding box", () => {
  const anchor = getSelectionAnchor([box("a", 0, 200), box("b", 300, 40)])

  assert.deepEqual(anchor, { x: 200, y: 40 })
})

const selection = (over: Partial<DiagramSelection> = {}): DiagramSelection => ({
  kind: "node",
  elementId: "a",
  label: "A",
  groupId: null,
  ...over,
})

test("an identical selection is treated as unchanged", () => {
  assert.equal(isSameSelection(selection(), selection()), true)
  assert.equal(isSameSelection(null, null), true)
})

test("a different element, kind or group counts as a change", () => {
  assert.equal(isSameSelection(selection(), selection({ elementId: "b" })), false)
  assert.equal(isSameSelection(selection(), selection({ groupId: "g" })), false)
  assert.equal(isSameSelection(selection(), selection({ kind: "group" })), false)
  assert.equal(isSameSelection(selection(), null), false)
})

// The label is display-only; a change to it must not remount the toolbar.
test("identity ignores the label", () => {
  assert.equal(isSameSelection(selection(), selection({ label: "inne" })), true)
})
