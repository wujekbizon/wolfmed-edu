import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { nanoid } from "nanoid"
import { Cell } from "@/types/cellTypes"

interface CellsState {
  loading: boolean
  error: string | null
  order: string[]
  data: Record<string, Cell>
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
  setCells: (order: string[], cells: Record<string, Cell>) => void
  updateCell: (id: string, content: string) => void
  deleteCell: (id: string) => void
  moveCell: (id: string, direction: "up" | "down") => void
  insertCellAfter: (id: string | null, type: Cell["type"]) => string
}

export const useCellsStore = create<CellsState>()(
  persist(
    (set) => ({
      loading: false,
      error: null,
      order: [],
      data: {},
      setCells: (order, cells) =>
        set({
          loading: false,
          error: null,
          order,
          data: cells,
        }),
      setError: (error) => set({ error }),
      setLoading: (loading) => set({ loading }),

      updateCell: (id, content) =>
        set((state) => {
          const prev = state.data[id];
          if (!prev) return state; // safeguard
      
          if (prev.content === content) {
            return state;
          }
      
          return {
            data: {
              ...state.data,
              [id]: { ...prev, content } as Cell,
            },
          };
        }),

      deleteCell: (id) =>
        set((state) => {
          const newData = { ...state.data }
          delete newData[id]
          return {
            data: newData,
            order: state.order.filter((i) => i !== id),
          }
        }),

      moveCell: (id, direction) =>
        set((state) => {
          const index = state.order.findIndex((i) => i === id)
          const target = direction === "up" ? index - 1 : index + 1
          if (target < 0 || target >= state.order.length) return state
          const newOrder = [...state.order]
          ;[newOrder[index], newOrder[target]] = [
            newOrder[target]!,
            newOrder[index]!,
          ]
          return { order: newOrder }
        }),

      insertCellAfter: (id, type) => {
        const newCell: Cell = { id: nanoid(), type, content: "" }
        set((state) => {
          const newData = { ...state.data, [newCell.id]: newCell }
          const foundIndex = state.order.findIndex((i) => i === id)
          const newOrder = [...state.order]
          if (foundIndex < 0) newOrder.unshift(newCell.id)
          else newOrder.splice(foundIndex + 1, 0, newCell.id)
          return { data: newData, order: newOrder }
        })
        return newCell.id
      },
    }),
    {
      name: "cells-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
