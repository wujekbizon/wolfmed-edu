import type { ResizableProps } from 're-resizable'

type SizeProps = Pick<
  ResizableProps,
  'size' | 'enable' | 'minWidth' | 'maxWidth' | 'minHeight' | 'maxHeight' | 'style'
>

interface BuildResizablePropsArgs {
  direction: 'horizontal' | 'vertical'
  isFullscreen: boolean
  innerWidth: number
  innerHeight: number
  width: number
  height: number
  constraint?: number | undefined
}

const FILL = { width: '100%', height: '100%' } as const

/**
 * Every variant returns props for the same <Resizable> element rather than a
 * plain <div>: swapping the element type would remount the whole cell subtree
 * and wipe in-cell state (AI answers, playback position, unsaved drawings).
 */
export function buildResizableProps({
  direction,
  isFullscreen,
  innerWidth,
  innerHeight,
  width,
  height,
  constraint,
}: BuildResizablePropsArgs): SizeProps {
  if (isFullscreen) {
    return { size: FILL, enable: false, style: { width: '100%', height: '100%' } }
  }

  // On mobile a side-by-side (horizontal) split doesn't fit: drop the fixed
  // pixel width and let the content go full width so it can stack vertically,
  // taking whatever height the stacked siblings leave behind rather than
  // growing with the note.
  if (direction === 'horizontal' && innerWidth < 768) {
    return {
      // Height stays auto so the flex parent drives it, as the plain <div> this
      // replaced did — a fixed 100% would fight the stacked siblings.
      size: { width: '100%', height: 'auto' },
      enable: false,
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        flex: '1 1 0%',
        minHeight: '16rem',
      },
    }
  }

  if (direction === 'horizontal') {
    return {
      size: { width, height: '100%' },
      minWidth: innerWidth * 0.2,
      maxWidth: innerWidth * 0.6,
      minHeight: '100%',
      maxHeight: '100%',
      enable: { right: true, bottom: false, bottomRight: false },
      style: { display: 'flex' },
    }
  }

  return {
    size: { width: '100%', height },
    minHeight: constraint || 480,
    maxHeight: innerHeight * 0.7,
    minWidth: '100%',
    maxWidth: '100%',
    enable: { bottom: true, right: false, bottomRight: false },
    style: { width: '100%' },
  }
}
