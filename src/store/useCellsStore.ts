import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { nanoid } from "nanoid"
import type { Cell } from "@/types/cellTypes"
import {
  decideCellsHydration,
  type CellsSnapshot,
} from "@/helpers/cellsConcurrency"

interface CellsConflict {
  server: CellsSnapshot | null
}

interface CellsState {
  loading: boolean
  error: string | null
  order: string[]
  data: Record<string, Cell>
  serverVersion: number | null
  revision: number
  dirty: boolean
  saving: boolean
  hasHydrated: boolean
  initialized: boolean
  conflict: CellsConflict | null
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
  setSaving: (saving: boolean) => void
  setHasHydrated: (hydrated: boolean) => void
  initializeFromServer: (server: CellsSnapshot | null) => void
  setCellsFromServer: (server: CellsSnapshot) => void
  markSaved: (version: number, savedRevision: number) => void
  reportConflict: (server: CellsSnapshot | null) => void
  useServerConflict: () => void
  keepLocalConflict: () => void
  updateCell: (id: string, content: string) => void
  deleteCell: (id: string) => void
  moveCell: (id: string, direction: "up" | "down") => void
  insertCellAfter: (id: string | null, type: Cell["type"]) => string
  insertCellAfterWithContent: (id: string | null, type: Cell["type"], content: string) => string
}

export const useCellsStore = create<CellsState>()(
  persist(
    (set) => ({
      loading: false,
      error: null,
      order: [],
      data: {},
      serverVersion: null,
      revision: 0,
      dirty: false,
      saving: false,
      hasHydrated: false,
      initialized: false,
      conflict: null,
      setError: (error) => set({ error }),
      setLoading: (loading) => set({ loading }),
      setSaving: (saving) => set({ saving }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      initializeFromServer: (server) =>
        set((state) => {
          if (state.initialized) return state

          const decision = decideCellsHydration({
            local: { order: state.order, cells: state.data },
            localVersion: state.serverVersion,
            localDirty: state.dirty,
            server,
          })

          if (decision.type === "use-server") {
            if (!server) return { initialized: true }
            return {
              order: server.order,
              data: server.cells,
              serverVersion: server.version,
              revision: 0,
              dirty: false,
              conflict: null,
              initialized: true,
            }
          }

          if (decision.type === "conflict") {
            return { conflict: { server }, initialized: true }
          }

          if (decision.type === "keep-local") return {
            serverVersion: decision.version,
            dirty: decision.dirty,
            conflict: null,
            initialized: true,
          }

          return { initialized: true }
        }),
      setCellsFromServer: (server) =>
        set({
          loading: false,
          error: null,
          order: server.order,
          data: server.cells,
          serverVersion: server.version,
          revision: 0,
          dirty: false,
          conflict: null,
          initialized: true,
        }),
      markSaved: (serverVersion, savedRevision) =>
        set((state) => ({
          serverVersion,
          dirty: state.revision !== savedRevision,
          conflict: null,
          saving: false,
        })),
      reportConflict: (server) =>
        set({ conflict: { server }, saving: false }),
      useServerConflict: () =>
        set((state) => {
          const server = state.conflict?.server
          if (!server) {
            return {
              order: [],
              data: {},
              serverVersion: null,
              revision: state.revision + 1,
              dirty: false,
              conflict: null,
            }
          }
          return {
            order: server.order,
            data: server.cells,
            serverVersion: server.version,
            revision: state.revision + 1,
            dirty: false,
            conflict: null,
          }
        }),
      keepLocalConflict: () =>
        set((state) => ({
          serverVersion: state.conflict?.server?.version ?? null,
          dirty: true,
          conflict: null,
        })),
      updateCell: (id, content) =>
        set((state) => {
          const previous = state.data[id]
          if (!previous || previous.content === content) return state
          return {
            data: {
              ...state.data,
              [id]: { ...previous, content } as Cell,
            },
            dirty: true,
            revision: state.revision + 1,
          }
        }),
      deleteCell: (id) =>
        set((state) => {
          const newData = { ...state.data }
          delete newData[id]
          return {
            data: newData,
            order: state.order.filter((item) => item !== id),
            dirty: true,
            revision: state.revision + 1,
          }
        }),
      moveCell: (id, direction) =>
        set((state) => {
          const index = state.order.findIndex((item) => item === id)
          const target = direction === "up" ? index - 1 : index + 1
          if (target < 0 || target >= state.order.length) return state
          const newOrder = [...state.order]
          ;[newOrder[index], newOrder[target]] = [newOrder[target]!, newOrder[index]!]
          return { order: newOrder, dirty: true, revision: state.revision + 1 }
        }),
      insertCellAfter: (id, type) => {
        const newCell: Cell = { id: nanoid(), type, content: "" }
        set((state) => {
          const newData = { ...state.data, [newCell.id]: newCell }
          const foundIndex = state.order.findIndex((item) => item === id)
          const newOrder = [...state.order]
          if (foundIndex < 0) newOrder.unshift(newCell.id)
          else newOrder.splice(foundIndex + 1, 0, newCell.id)
          return {
            data: newData,
            order: newOrder,
            dirty: true,
            revision: state.revision + 1,
          }
        })
        return newCell.id
      },
      insertCellAfterWithContent: (id, type, content) => {
        const newCell: Cell = { id: nanoid(), type, content }
        set((state) => {
          const newData = { ...state.data, [newCell.id]: newCell }
          const foundIndex = state.order.findIndex((item) => item === id)
          const newOrder = [...state.order]
          if (foundIndex < 0) newOrder.unshift(newCell.id)
          else newOrder.splice(foundIndex + 1, 0, newCell.id)
          return {
            data: newData,
            order: newOrder,
            dirty: true,
            revision: state.revision + 1,
          }
        })
        return newCell.id
      },
    }),
    {
      name: "cells-storage",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        order: state.order,
        data: state.data,
        serverVersion: state.serverVersion,
        revision: state.revision,
        dirty: state.dirty,
      }),
      migrate: (persisted) => {
        const previous = (persisted ?? {}) as Partial<CellsState>
        const order = previous.order ?? []
        const data = previous.data ?? {}
        return {
          order,
          data,
          serverVersion: previous.serverVersion ?? null,
          revision: previous.revision ?? 0,
          dirty:
            previous.dirty ??
            (order.length > 0 || Object.keys(data).length > 0),
        }
      },
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
)
