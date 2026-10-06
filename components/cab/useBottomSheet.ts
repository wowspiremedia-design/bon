'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type Snap = 'peek' | 'half' | 'full'

export const SNAP_ORDER: Snap[] = ['peek', 'half', 'full']
export const PEEK_PX = 96

// Pixel height of each snap point for a pane of the given height.
export function snapHeights(paneHeight: number): Record<Snap, number> {
  return { peek: PEEK_PX, half: Math.round(paneHeight * 0.62), full: Math.round(paneHeight * 0.88) }
}

const DRAG_THRESHOLD_PX = 6
// How far ahead a fling projects, in milliseconds of current velocity.
const PROJECT_MS = 180

// Draggable bottom sheet with three snap points. The caller puts the returned
// `handleProps` on a button and sets `--cab-sheet-h` on the panel from
// `heightPx`. While dragging, the hook writes the CSS variable straight to the
// panel so React does not re-render on every pointer move.
export function useBottomSheet({
  paneHeight,
  enabled,
  panelRef,
  initial = 'half',
}: {
  paneHeight: number
  enabled: boolean
  panelRef: React.RefObject<HTMLElement | null>
  initial?: Snap
}) {
  const [snap, setSnapState] = useState<Snap>(initial)
  const [dragging, setDragging] = useState(false)
  const heights = snapHeights(paneHeight)
  const heightsRef = useRef(heights)
  const snapRef = useRef(snap)
  // Handlers read the latest values through refs, synced after each render.
  useEffect(() => {
    heightsRef.current = heights
    snapRef.current = snap
  })

  const drag = useRef<{
    startY: number
    startH: number
    active: boolean
    lastY: number
    lastT: number
    prevY: number
    prevT: number
    curH: number
  } | null>(null)
  // A drag ends in a click on the button; this lets the click handler ignore it.
  const justDragged = useRef(false)

  const setSnap = useCallback((s: Snap) => setSnapState(s), [])

  const move = useCallback((dir: 1 | -1) => {
    const i = SNAP_ORDER.indexOf(snapRef.current)
    setSnapState(SNAP_ORDER[Math.min(SNAP_ORDER.length - 1, Math.max(0, i + dir))])
  }, [])

  const cycle = useCallback(() => {
    const i = SNAP_ORDER.indexOf(snapRef.current)
    setSnapState(SNAP_ORDER[(i + 1) % SNAP_ORDER.length])
  }, [])

  const writeHeight = (px: number) => panelRef.current?.style.setProperty('--cab-sheet-h', `${px}px`)

  const nearest = (h: number): Snap => {
    const hs = heightsRef.current
    return SNAP_ORDER.reduce((best, s) => (Math.abs(hs[s] - h) < Math.abs(hs[best] - h) ? s : best), 'peek' as Snap)
  }

  const finish = (velocityPxPerMs: number) => {
    const d = drag.current
    drag.current = null
    setDragging(false)
    if (!d || !d.active) return
    // A mouse drag ends in a click that must be ignored. A touch drag ends in none, so the
    // flag also clears itself shortly after, or the next tap or Enter would be swallowed.
    justDragged.current = true
    window.setTimeout(() => {
      justDragged.current = false
    }, 120)
    // Positive velocity is downward, which shrinks the sheet.
    const projected = d.curH - velocityPxPerMs * PROJECT_MS
    const target = nearest(projected)
    writeHeight(heightsRef.current[target])
    setSnapState(target)
  }

  const handleProps = {
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!enabled || (e.pointerType === 'mouse' && e.button !== 0)) return
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {
        // Synthetic pointers have no active capture; the events still arrive.
      }
      justDragged.current = false
      const startH = heightsRef.current[snapRef.current]
      const now = performance.now()
      drag.current = { startY: e.clientY, startH, active: false, lastY: e.clientY, lastT: now, prevY: e.clientY, prevT: now, curH: startH }
    },
    onPointerMove: (e: React.PointerEvent<HTMLButtonElement>) => {
      const d = drag.current
      if (!d) return
      if (!d.active) {
        if (Math.abs(e.clientY - d.startY) < DRAG_THRESHOLD_PX) return
        d.active = true
        setDragging(true)
      }
      const hs = heightsRef.current
      d.curH = Math.min(hs.full, Math.max(hs.peek, d.startH + (d.startY - e.clientY)))
      d.prevY = d.lastY
      d.prevT = d.lastT
      d.lastY = e.clientY
      d.lastT = performance.now()
      writeHeight(d.curH)
    },
    onPointerUp: () => {
      const d = drag.current
      if (!d) return
      const dt = d.lastT - d.prevT
      // A pause before release means the finger stopped, so no fling.
      const stale = performance.now() - d.lastT > 100
      finish(dt > 0 && !stale ? (d.lastY - d.prevY) / dt : 0)
    },
    onPointerCancel: () => finish(0),
    onClick: () => {
      if (justDragged.current) {
        justDragged.current = false
        return
      }
      cycle()
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        move(1)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        move(-1)
      }
    },
  }

  return { snap, setSnap, heightPx: heights[snap], heights, dragging, handleProps }
}
