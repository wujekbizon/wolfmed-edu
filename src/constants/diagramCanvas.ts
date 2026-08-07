export const SCENE_FOCUS = {
  duration: 400,
}

/** Collapses a resize drag into one fit instead of one per observed frame. */
export const RESIZE_DEBOUNCE_MS = 120

/**
 * How long after a programmatic camera move to keep ignoring scroll events.
 *
 * One animated scrollToContent emits ~19 onScrollChange calls; without this the
 * very first auto-fit would be read as the student taking manual control and
 * auto-fit would switch itself off.
 */
export const CAMERA_SUPPRESS_BUFFER_MS = 150

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

/** Gap between a selection and its toolbar, and the toolbar's inset from the
 *  canvas edge — the toolbar is clamped rather than allowed to escape the cell
 *  when the selection sits above or beside the visible area. */
export const TOOLBAR_GAP = 8
export const TOOLBAR_MARGIN = 8

/** Used until the toolbar has been measured, on the frame it first appears. */
export const TOOLBAR_FALLBACK_SIZE = { width: 120, height: 36 }
