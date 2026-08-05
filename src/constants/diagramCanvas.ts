export const SCENE_FOCUS = {
  duration: 400,
}

/**
 * Excalidraw reports scroll, zoom, selection and cursor through the same
 * callback as real edits, so persisting the whole appState wrote a new revision
 * of the cell on every pan. Only what should survive a reload is kept.
 */
export const PERSISTED_APP_STATE_KEYS = ['viewBackgroundColor', 'gridSize'] as const

/**
 * Trailing debounce for saving a scene. Dragging one element fires ~18 onChange
 * calls carrying 17 real revisions; without this each one serialises the whole
 * cell.
 */
export const SAVE_DEBOUNCE_MS = 400

/**
 * A shorter delay used once a gesture ends. Excalidraw emits a final onChange
 * roughly 8ms *after* onPointerUp, so flushing on pointer-up itself would save
 * the state before last.
 */
export const SAVE_SETTLE_MS = 80
