import { useEffect, useLayoutEffect, useRef, useState, type Ref, type RefObject, type UIEvent } from 'react'
import { characters } from '../../data/characters'
import type { CharacterMood } from '../../state/HubState'
import { CharacterStrip, stripSlot } from './Hero'
import { FRUIT_SLIDE, PAGE_H, PAGE_W, fruitStep } from './Pager'

/**
 * Three characters on one horizontal track. Scroll is the source of motion —
 * they slide as a line, the centre one larger, the sides shrinking as they
 * leave the focus slot. Mouse drag, wheel and touch all move the same strip.
 */
export function CharacterStage({
  fruitRef,
  progress,
  characterIndex,
  placed,
  accessories,
  animateIds = [],
  mood = 'idle',
  scrollable = true,
  onScroll,
  onPick,
}: {
  fruitRef: RefObject<HTMLDivElement | null>
  progress: number
  characterIndex: number
  placed: string[]
  accessories: string[]
  animateIds?: string[]
  mood?: CharacterMood
  scrollable?: boolean
  onScroll: (event: UIEvent<HTMLDivElement>) => void
  onPick: (id: string) => void
}) {
  const drag = useRef<{ id: number; x: number; scroll: number } | null>(null)
  const progressRef = useRef(progress)
  const rootRef = useRef<HTMLDivElement>(null)
  const [metrics, setMetrics] = useState({ sx: 1, sy: 1, slide: FRUIT_SLIDE })
  progressRef.current = progress

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const apply = () => {
      const frame = root.closest('.frame') as HTMLElement | null
      const w = frame?.clientWidth || PAGE_W
      const h = frame?.clientHeight || PAGE_H
      setMetrics({ sx: w / PAGE_W, sy: h / PAGE_H, slide: w * (FRUIT_SLIDE / PAGE_W) })
    }
    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(root.closest('.frame') ?? root)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    const node = fruitRef.current
    if (node) node.scrollLeft = characterIndex * fruitStep(node)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fruitRef])

  useLayoutEffect(() => {
    const node = fruitRef.current
    if (!node || drag.current) return
    const step = fruitStep(node)
    const target = characterIndex * step
    if (Math.abs(node.scrollLeft / step - characterIndex) < 0.98) return
    node.scrollLeft = target
  }, [characterIndex, fruitRef])

  useEffect(() => {
    const node = fruitRef.current
    if (!node || !scrollable) return

    const snap = () => {
      const step = fruitStep(node)
      const index = Math.max(
        0,
        Math.min(characters.length - 1, Math.round(node.scrollLeft / step)),
      )
      node.scrollTo({ left: index * step, behavior: 'smooth' })
    }

    const onWheel = (event: WheelEvent) => {
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      if (!delta) return
      event.preventDefault()
      node.scrollLeft += delta
    }

    const onDown = (event: PointerEvent) => {
      if (event.button !== 0) return
      drag.current = { id: event.pointerId, x: event.clientX, scroll: node.scrollLeft }
      node.classList.add('is-dragging')
      node.setPointerCapture(event.pointerId)
    }

    const onMove = (event: PointerEvent) => {
      const state = drag.current
      if (!state || state.id !== event.pointerId) return
      node.scrollLeft = state.scroll - (event.clientX - state.x)
    }

    const finish = (event: PointerEvent) => {
      const state = drag.current
      if (!state || state.id !== event.pointerId) return
      const moved = Math.abs(event.clientX - state.x)
      drag.current = null
      node.classList.remove('is-dragging')
      if (node.hasPointerCapture(event.pointerId)) {
        node.releasePointerCapture(event.pointerId)
      }

      if (moved <= 8) {
        const rect = node.getBoundingClientRect()
        const x = event.clientX - rect.left
        const hit = characters.findIndex((_, index) => {
          const slot = stripSlot(
            index,
            progressRef.current,
            metrics.sx,
            metrics.sy,
            metrics.slide,
          )
          return x >= slot.left && x <= slot.left + slot.size
        })
        if (hit >= 0) onPick(characters[hit].id)
        return
      }

      snap()
    }

    node.addEventListener('wheel', onWheel, { passive: false })
    node.addEventListener('pointerdown', onDown)
    node.addEventListener('pointermove', onMove)
    node.addEventListener('pointerup', finish)
    node.addEventListener('pointercancel', finish)
    node.addEventListener('scrollend', snap)
    return () => {
      node.removeEventListener('wheel', onWheel)
      node.removeEventListener('pointerdown', onDown)
      node.removeEventListener('pointermove', onMove)
      node.removeEventListener('pointerup', finish)
      node.removeEventListener('pointercancel', finish)
      node.removeEventListener('scrollend', snap)
    }
  }, [fruitRef, metrics.slide, metrics.sx, metrics.sy, onPick, scrollable])

  return (
    <div ref={rootRef} className="cast" style={{ pointerEvents: scrollable ? 'auto' : 'none' }}>
      <CharacterStrip
        progress={progress}
        placed={placed}
        accessories={accessories}
        animateIds={animateIds}
        mood={mood}
        sx={metrics.sx}
        sy={metrics.sy}
        slide={metrics.slide}
      />

      <div ref={fruitRef as Ref<HTMLDivElement>} className="cast__scroll" onScroll={onScroll}>
        {characters.map((item) => (
          <div key={item.id} className="cast__snap" aria-hidden />
        ))}
      </div>
    </div>
  )
}
