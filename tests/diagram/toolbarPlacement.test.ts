import test from "node:test"
import assert from "node:assert/strict"
import { getToolbarPlacement } from "@/lib/diagram/toolbarPlacement"
import {
  TOOLBAR_MARGIN,
  TOOLBAR_SAFE_BOTTOM,
  TOOLBAR_SAFE_TOP,
} from "@/constants/diagramCanvas"

const CANVAS = { width: 600, height: 400 }
const TOOLBAR = { width: 100, height: 46 }

test("sits above the selection when there is room", () => {
  const placed = getToolbarPlacement({ left: 100, top: 200, right: 300, bottom: 350 }, CANVAS, TOOLBAR)

  assert.equal(placed.placement, "above")
  assert.deepEqual({ x: placed.x, y: placed.y }, { x: 200, y: 200 })
})

test("flips below when the selection starts under Excalidraw's toolbar", () => {
  const placed = getToolbarPlacement({ left: 100, top: 10, right: 300, bottom: 250 }, CANVAS, TOOLBAR)

  assert.equal(placed.placement, "below")
  assert.ok(placed.y >= TOOLBAR_SAFE_TOP)
})

test("a selection running off the top anchors below its visible bottom", () => {
  const placed = getToolbarPlacement({ left: 100, top: -900, right: 300, bottom: 220 }, CANVAS, TOOLBAR)

  assert.equal(placed.placement, "below")
  assert.equal(placed.y, 220)
})

test("never lands in the bottom bar's band", () => {
  const placed = getToolbarPlacement({ left: 100, top: -900, right: 300, bottom: 5000 }, CANVAS, TOOLBAR)

  assert.ok(placed.y + TOOLBAR.height <= CANVAS.height - TOOLBAR_SAFE_BOTTOM)
})

test("centres on the visible slice of a selection wider than the canvas", () => {
  const placed = getToolbarPlacement({ left: -400, top: 200, right: 900, bottom: 350 }, CANVAS, TOOLBAR)

  assert.equal(placed.x, CANVAS.width / 2)
})

test("stays fully on canvas horizontally", () => {
  const left = getToolbarPlacement({ left: -500, top: 200, right: -420, bottom: 350 }, CANVAS, TOOLBAR)
  const right = getToolbarPlacement({ left: 1200, top: 200, right: 1400, bottom: 350 }, CANVAS, TOOLBAR)

  assert.ok(left.x - TOOLBAR.width / 2 >= TOOLBAR_MARGIN - 0.01)
  assert.ok(right.x + TOOLBAR.width / 2 <= CANVAS.width - TOOLBAR_MARGIN + 0.01)
})
