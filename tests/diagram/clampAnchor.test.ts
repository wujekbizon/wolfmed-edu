import test from "node:test"
import assert from "node:assert/strict"
import { clampAnchor } from "@/lib/diagram/selectionGeometry"
import { TOOLBAR_GAP, TOOLBAR_MARGIN } from "@/constants/diagramCanvas"

const TOOLBAR = { width: 120, height: 36 }
const CANVAS = { width: 800, height: 600 }

test("an anchor well inside the canvas is left alone", () => {
  assert.deepEqual(clampAnchor({ x: 400, y: 300 }, TOOLBAR, CANVAS), { x: 400, y: 300 })
})

test("a selection above the viewport keeps the toolbar on the canvas", () => {
  const clamped = clampAnchor({ x: 400, y: -250 }, TOOLBAR, CANVAS)

  assert.equal(clamped.y, TOOLBAR_MARGIN + TOOLBAR.height + TOOLBAR_GAP)
  assert.ok(clamped.y - TOOLBAR.height - TOOLBAR_GAP >= 0)
})

test("a selection off the left or right edge stays fully visible", () => {
  const left = clampAnchor({ x: -600, y: 300 }, TOOLBAR, CANVAS)
  const right = clampAnchor({ x: 2000, y: 300 }, TOOLBAR, CANVAS)

  assert.ok(left.x - TOOLBAR.width / 2 >= 0)
  assert.ok(right.x + TOOLBAR.width / 2 <= CANVAS.width)
})

test("a selection below the viewport is pulled back up", () => {
  assert.equal(clampAnchor({ x: 400, y: 5000 }, TOOLBAR, CANVAS).y, CANVAS.height - TOOLBAR_MARGIN)
})

test("a canvas narrower than the toolbar still yields a usable position", () => {
  const clamped = clampAnchor({ x: 10, y: 10 }, TOOLBAR, { width: 60, height: 40 })

  assert.ok(Number.isFinite(clamped.x))
  assert.ok(Number.isFinite(clamped.y))
})
