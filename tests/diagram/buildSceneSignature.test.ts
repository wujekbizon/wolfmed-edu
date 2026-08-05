import test from "node:test"
import assert from "node:assert/strict"
import { buildSceneSignature } from "@/helpers/buildSceneSignature"

const APP_STATE = { viewBackgroundColor: "#ffffff", gridSize: null, scrollX: 10, zoom: { value: 1 } }

test("a pan or zoom leaves the signature unchanged", () => {
  const before = buildSceneSignature(131, APP_STATE, null)
  const after = buildSceneSignature(131, { ...APP_STATE, scrollX: 900, zoom: { value: 2.4 } }, null)

  assert.equal(before, after)
})

test("an element edit changes the signature", () => {
  assert.notEqual(buildSceneSignature(131, APP_STATE, null), buildSceneSignature(132, APP_STATE, null))
})

test("a background change the element hash cannot see still changes it", () => {
  assert.notEqual(
    buildSceneSignature(131, APP_STATE, null),
    buildSceneSignature(131, { ...APP_STATE, viewBackgroundColor: "#000000" }, null)
  )
})

test("adding a file changes it, and file order does not", () => {
  const none = buildSceneSignature(131, APP_STATE, null)
  const one = buildSceneSignature(131, APP_STATE, { a: {} })

  assert.notEqual(none, one)
  assert.equal(
    buildSceneSignature(131, APP_STATE, { a: {}, b: {} }),
    buildSceneSignature(131, APP_STATE, { b: {}, a: {} })
  )
})
