import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { motion } from 'framer-motion'

const FRAME_H = 852
const AXIS_PX = 10
const SNAP_PX = 36
const SNAP_PX_FROM_FLOOR = 24
const FLICK = 0.22
const H_STRIPS = '.menu__xprow, .promorow, .svctabs'

export type HubCurtainStop = 'expanded' | 'collapsed' | 'lowered'

export interface HubCurtainHandle {
  snapTo: (stop: HubCurtainStop) => void
}

/**
 * Hub curtain: the white panel slides between three stops. Inner scrolling
 * is locked until the sheet is fully raised. Horizontal strips keep native
 * pan-x; a vertical drag always moves one stop, so a lowered sheet can be
 * pulled back without crossing the midpoint.
 */
export const HubCurtain = forwardRef<
  HubCurtainHandle,
  {
    collapsedTop: number
    expandedTop: number
    loweredTop?: number
    stop?: HubCurtainStop
    children: ReactNode
    onTop?: (top: number) => void
  }
>(function HubCurtain(
  { collapsedTop, expandedTop, loweredTop, stop = 'collapsed', children, onTop },
  ref,
) {
  const floor = loweredTop ?? collapsedTop
  const startTop =
    stop === 'expanded' ? expandedTop : stop === 'lowered' ? floor : collapsedTop
  const [top, setTop] = useState(startTop)
  const [dragging, setDragging] = useState(false)
  const topRef = useRef(startTop)
  const panelRef = useRef<HTMLDivElement>(null)
  const pullRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{
    pointer: number
    x: number
    y: number
    start: number
    origin: number
    lastY: number
    lastT: number
    v: number
    axis: 'undecided' | 'sheet' | 'ignore'
    capture: HTMLElement | null
  } | null>(null)

  topRef.current = top
  const open = top <= expandedTop + 1
  const showPull = floor > collapsedTop + 1 && top > collapsedTop + 32
  const stops = useMemo(
    () =>
      [expandedTop, collapsedTop, floor]
        .filter((value, index, list) => list.indexOf(value) === index)
        .sort((a, b) => a - b),
    [collapsedTop, expandedTop, floor],
  )

  const clampTop = useCallback(
    (value: number) => Math.max(expandedTop, Math.min(floor, value)),
    [expandedTop, floor],
  )

  const nearest = useCallback(
    (value: number) =>
      stops.reduce((best, stop) =>
        Math.abs(stop - value) < Math.abs(best - value) ? stop : best,
      ),
    [stops],
  )

  const prevStop = useCallback(
    (from: number) =>
      [...stops].reverse().find((stop) => stop < from - 1) ?? expandedTop,
    [expandedTop, stops],
  )

  const nextStop = useCallback(
    (from: number) => stops.find((stop) => stop > from + 1) ?? floor,
    [floor, stops],
  )

  const applyTop = useCallback(
    (next: number) => {
      setTop(next)
      if (next > expandedTop + 1) {
        const node = panelRef.current
        if (node) node.scrollTop = 0
      }
    },
    [expandedTop],
  )

  const snapFrom = useCallback(
    (origin: number, current: number, velocity: number) => {
      const moved = current - origin
      const fromFloor = origin >= floor - 1
      const threshold = fromFloor ? SNAP_PX_FROM_FLOOR : SNAP_PX
      if (velocity < -FLICK || moved < -threshold) {
        applyTop(prevStop(origin))
        return
      }
      if (velocity > FLICK || moved > threshold) {
        applyTop(nextStop(origin))
        return
      }
      applyTop(origin)
    },
    [applyTop, floor, nextStop, prevStop],
  )

  useImperativeHandle(
    ref,
    () => ({
      snapTo: (stop) => {
        applyTop(
          stop === 'expanded'
            ? expandedTop
            : stop === 'lowered'
              ? floor
              : collapsedTop,
        )
      },
    }),
    [applyTop, collapsedTop, expandedTop, floor],
  )

  useEffect(() => {
    onTop?.(top)
  }, [top, onTop])

  useEffect(() => {
    const panel = panelRef.current
    const pull = pullRef.current
    if (!panel) return
    const nodes = [panel, pull].filter(Boolean) as HTMLElement[]

    const fitOf = () => {
      const frame = panel.closest('.frame')
      const height = frame?.getBoundingClientRect().height ?? FRAME_H
      return height / FRAME_H
    }

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return
      const overStrip = Boolean(
        (event.target as HTMLElement | null)?.closest(H_STRIPS),
      )
      if (overStrip && Math.abs(event.deltaX) >= Math.abs(event.deltaY) * 0.5) {
        return
      }

      const atTop = panel.scrollTop <= 0
      const raised = topRef.current <= expandedTop + 1
      if (raised && !atTop) return
      if (raised && atTop && event.deltaY < 0) return

      event.preventDefault()
      const next = clampTop(topRef.current + event.deltaY / fitOf())
      applyTop(next)
    }

    const onDown = (event: PointerEvent) => {
      if (event.button !== 0) return
      drag.current = {
        pointer: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        start: topRef.current,
        origin: nearest(topRef.current),
        lastY: event.clientY,
        lastT: performance.now(),
        v: 0,
        axis: 'undecided',
        capture: null,
      }
    }

    const onMove = (event: PointerEvent) => {
      const state = drag.current
      if (!state || state.pointer !== event.pointerId) return

      const now = performance.now()
      const dt = Math.max(8, now - state.lastT)
      state.v = (event.clientY - state.lastY) / dt
      state.lastY = event.clientY
      state.lastT = now

      const dx = event.clientX - state.x
      const dy = event.clientY - state.y

      if (state.axis === 'undecided') {
        if (Math.abs(dx) < AXIS_PX && Math.abs(dy) < AXIS_PX) return

        const onHStrip = Boolean(
          (event.target as HTMLElement | null)?.closest(H_STRIPS),
        )
        const horizontal = Math.abs(dx) > Math.abs(dy)
        if (horizontal && (onHStrip || Math.abs(dx) > Math.abs(dy) * 1.1)) {
          state.axis = 'ignore'
          return
        }

        const raised = topRef.current <= expandedTop + 1
        const atTop = panel.scrollTop <= 0
        if (raised && !atTop) {
          state.axis = 'ignore'
          return
        }
        if (raised && atTop && dy < 0) {
          state.axis = 'ignore'
          return
        }

        state.axis = 'sheet'
        setDragging(true)
        const node = event.currentTarget as HTMLElement
        state.capture = node
        node.setPointerCapture(event.pointerId)
      }

      if (state.axis !== 'sheet') return
      event.preventDefault()
      const delta = (event.clientY - state.y) / fitOf()
      setTop(clampTop(state.start + delta))
    }

    const finish = (event: PointerEvent) => {
      const state = drag.current
      if (!state || state.pointer !== event.pointerId) return
      const wasSheet = state.axis === 'sheet'
      const origin = state.origin
      const velocity = state.v
      const capture = state.capture
      drag.current = null
      setDragging(false)
      if (capture?.hasPointerCapture(event.pointerId)) {
        capture.releasePointerCapture(event.pointerId)
      }
      if (wasSheet) snapFrom(origin, topRef.current, velocity)
    }

    const moveOpts: AddEventListenerOptions = { passive: false }
    panel.addEventListener('wheel', onWheel, { passive: false })
    for (const node of nodes) {
      node.addEventListener('pointerdown', onDown)
      node.addEventListener('pointermove', onMove, moveOpts)
      node.addEventListener('pointerup', finish)
      node.addEventListener('pointercancel', finish)
    }
    return () => {
      panel.removeEventListener('wheel', onWheel)
      for (const node of nodes) {
        node.removeEventListener('pointerdown', onDown)
        node.removeEventListener('pointermove', onMove, moveOpts)
        node.removeEventListener('pointerup', finish)
        node.removeEventListener('pointercancel', finish)
      }
    }
  }, [applyTop, clampTop, expandedTop, nearest, snapFrom])

  const topPct = `${(top / FRAME_H) * 100}%`

  return (
    <>
      <div
        ref={pullRef}
        className={`hub-curtain__pull${showPull ? ' is-on' : ''}`}
        style={{ top: `calc(${topPct} - 40px)` }}
        aria-hidden
      />
      <motion.div
        ref={panelRef}
        className={`frame__scroll frame__scroll--sheet${open ? ' is-open' : ''}${
          showPull ? ' is-lowered' : ''
        }`}
        style={{ top: topPct, bottom: 'var(--nav-h)', pointerEvents: 'auto' }}
        animate={dragging ? { top: topPct, transition: { duration: 0 } } : { top: topPct }}
        transition={{ type: 'spring', stiffness: 380, damping: 34, mass: 0.9 }}
      >
        <div className="hub-curtain__grip" aria-hidden />
        {children}
      </motion.div>
    </>
  )
})
