export const SCENE_FOCUS = {
  duration: 400,
}

/**
 * Excalidraw reports scroll, zoom, selection and cursor through the same
 * callback as real edits, so persisting the whole appState wrote a new revision
 * of the cell on every pan. Only what should survive a reload is kept.
 */
export const PERSISTED_APP_STATE_KEYS = ['viewBackgroundColor', 'gridSize'] as const
