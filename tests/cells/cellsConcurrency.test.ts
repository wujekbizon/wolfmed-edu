import assert from "node:assert/strict"
import test from "node:test"
import {
  boardsEqual,
  decideCellsHydration,
  type CellsSnapshot,
} from "../../src/helpers/cellsConcurrency"
import { UserCellsListSchema } from "../../src/server/schema"

const server: CellsSnapshot = {
  order: ["one"],
  cells: { one: { id: "one", type: "note", content: "server" } },
  version: 3,
}

test("boardsEqual ignores record key insertion order", () => {
  const left = {
    order: ["one", "two"],
    cells: {
      one: { id: "one", type: "note" as const, content: "a" },
      two: { id: "two", type: "note" as const, content: "b" },
    },
  }
  const right = {
    order: ["one", "two"],
    cells: {
      two: { id: "two", type: "note" as const, content: "b" },
      one: { id: "one", type: "note" as const, content: "a" },
    },
  }

  assert.equal(boardsEqual(left, right), true)
})

test("empty clean local board loads server", () => {
  assert.deepEqual(
    decideCellsHydration({
      local: { order: [], cells: {} },
      localVersion: null,
      localDirty: false,
      server,
    }),
    { type: "use-server" }
  )
})

test("identical legacy local board adopts server version", () => {
  assert.deepEqual(
    decideCellsHydration({
      local: { order: server.order, cells: server.cells },
      localVersion: null,
      localDirty: true,
      server,
    }),
    { type: "keep-local", version: 3, dirty: false }
  )
})

test("local edits based on current version remain editable", () => {
  assert.deepEqual(
    decideCellsHydration({
      local: {
        order: ["one"],
        cells: { one: { id: "one", type: "note", content: "local edit" } },
      },
      localVersion: 3,
      localDirty: true,
      server,
    }),
    { type: "keep-local", version: 3, dirty: true }
  )
})

test("stale divergent local board conflicts", () => {
  assert.deepEqual(
    decideCellsHydration({
      local: {
        order: ["one"],
        cells: { one: { id: "one", type: "note", content: "stale" } },
      },
      localVersion: 2,
      localDirty: true,
      server,
    }),
    { type: "conflict" }
  )
})

test("cell schema rejects duplicate order ids", () => {
  const result = UserCellsListSchema.safeParse({
    order: ["one", "one"],
    cells: { one: { id: "one", type: "note", content: "" } },
  })
  assert.equal(result.success, false)
})

test("cell schema rejects missing, orphaned, and mismatched cells", () => {
  const result = UserCellsListSchema.safeParse({
    order: ["missing"],
    cells: { orphan: { id: "different", type: "note", content: "" } },
  })
  assert.equal(result.success, false)
})
