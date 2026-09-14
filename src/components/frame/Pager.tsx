import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type Ref,
  type UIEvent,
} from 'react'
import { characters } from '../../data/characters'
import { useHub } from '../../state/HubState'

export const PAGE_W = 393
export const PAGE_H = 852
/** Distance between character centres — neighbours peek, they do not cover the hero. */
export const FRUIT_SLIDE = 250
export const FRUIT_PAD = (PAGE_W - FRUIT_SLIDE) / 2

/** One fruit step in the live frame — FRUIT_SLIDE/393 of the current width. */
export function fruitStep(el: HTMLElement | null | undefined) {
  return (el?.clientWidth || PAGE_W) * (FRUIT_SLIDE / PAGE_W)
}

export function frameScale(el: Element | null | undefined) {
  const frame = el?.closest('.frame') as HTMLElement | null
  const w = frame?.clientWidth || PAGE_W
  const h = frame?.clientHeight || PAGE_H
  return { w, h, sx: w / PAGE_W, sy: h / PAGE_H, slide: w * (FRUIT_SLIDE / PAGE_W) }
}

/**
 * Horizontal snap-pager for the three games. Scroll position is the source of
 * truth for which character is on screen; the shared index stays in sync so
 * the hub, the play screen and the demo rail all agree.
 */
export function useThemePager() {
  const { characterIndex, setCharacterIndex } = useHub()
  const ref = useRef<HTMLDivElement>(null)
  const fruitRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(characterIndex)
  const fromScroll = useRef(false)
  const driving = useRef<'play' | 'fruit' | null>(null)
  const mounted = useRef(false)

  const syncPlay = useCallback((index: number, smooth: boolean) => {
    const el = ref.current
    if (!el) return
    const left = index * (el.clientWidth || PAGE_W)
    if (Math.abs(el.scrollLeft - left) < 2) return
    el.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' })
  }, [])

  const syncFruit = useCallback((index: number, smooth: boolean) => {
    const el = fruitRef.current
    if (!el) return
    const left = index * fruitStep(el)
    if (Math.abs(el.scrollLeft - left) < 2) return
    el.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' })
  }, [])

  useLayoutEffect(() => {
    if (!mounted.current) {
      if (ref.current) ref.current.scrollLeft = characterIndex * (ref.current.clientWidth || PAGE_W)
      if (fruitRef.current) fruitRef.current.scrollLeft = characterIndex * fruitStep(fruitRef.current)
      setProgress(characterIndex)
      mounted.current = true
      return
    }
    if (fromScroll.current) {
      fromScroll.current = false
      return
    }
    syncPlay(characterIndex, true)
    syncFruit(characterIndex, true)
  }, [characterIndex, syncPlay, syncFruit])

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
      event.preventDefault()
      el.scrollLeft += event.deltaY
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const commit = (next: number) => {
    setProgress(next)
    const index = Math.max(0, Math.min(characters.length - 1, Math.round(next)))
    if (index !== characterIndex) {
      fromScroll.current = true
      setCharacterIndex(index)
    }
  }

  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    if (driving.current === 'fruit') return
    driving.current = 'play'
    const el = event.currentTarget
    const next = el.scrollLeft / (el.clientWidth || PAGE_W)
    commit(next)
    if (fruitRef.current) fruitRef.current.scrollLeft = next * fruitStep(fruitRef.current)
    queueMicrotask(() => {
      if (driving.current === 'play') driving.current = null
    })
  }

  const onFruitScroll = (event: UIEvent<HTMLDivElement>) => {
    if (driving.current === 'play') return
    driving.current = 'fruit'
    const next = event.currentTarget.scrollLeft / fruitStep(event.currentTarget)
    commit(next)
    if (ref.current) ref.current.scrollLeft = next * (ref.current.clientWidth || PAGE_W)
    queueMicrotask(() => {
      if (driving.current === 'fruit') driving.current = null
    })
  }

  const jumpTo = (index: number) => {
    fromScroll.current = false
    setCharacterIndex(index)
    syncPlay(index, true)
    syncFruit(index, true)
  }

  return { ref, fruitRef, progress, onScroll, onFruitScroll, jumpTo }
}

export function ThemePager({
  pagerRef,
  onScroll,
  children,
  className = '',
}: {
  pagerRef: Ref<HTMLDivElement>
  onScroll: (event: UIEvent<HTMLDivElement>) => void
  children: ReactNode
  className?: string
}) {
  return (
    <div ref={pagerRef} className={`pager ${className}`} onScroll={onScroll}>
      {children}
    </div>
  )
}

export function PagerDots({
  progress,
  onJump,
}: {
  progress: number
  onJump: (index: number) => void
}) {
  const active = Math.max(0, Math.min(2, Math.round(progress)))
  return (
    <div className="pager-dots" role="tablist" aria-label="Игры">
      {characters.map((character, index) => (
        <button
          key={character.id}
          role="tab"
          aria-selected={index === active}
          aria-label={character.name}
          className={`pager-dots__dot${index === active ? ' is-on' : ''}`}
          onClick={() => onJump(index)}
        />
      ))}
    </div>
  )
}

/** XP note colour: white on purple/magenta, ink on the lemon orange. */
export function onThemeFor(progress: number) {
  const lemon = Math.max(0, 1 - Math.abs(progress - 2))
  return lemon > 0.45 ? '#1f1f1f' : '#ffffff'
}
